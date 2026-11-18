import { sprintRepository } from './repository';
import { IssueModel } from '../issues/model';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { ISprint } from './model';
import { Types } from 'mongoose';

export class SprintService {
  async getSprintsByProject(projectId: string): Promise<ISprint[]> {
    return sprintRepository.findByProjectId(projectId);
  }

  async getSprintById(id: string): Promise<ISprint> {
    const sprint = await sprintRepository.findById(id);
    if (!sprint) {
      throw new NotFoundError(`Sprint not found with id ${id}`);
    }
    return sprint;
  }

  async createSprint(data: Partial<ISprint>): Promise<ISprint> {
    return sprintRepository.create(data);
  }

  async updateSprint(id: string, updates: Partial<ISprint>): Promise<ISprint> {
    const updated = await sprintRepository.update(id, updates);
    if (!updated) {
      throw new NotFoundError(`Sprint not found with id ${id}`);
    }
    return updated;
  }

  async startSprint(
    id: string,
    data: { startDate?: string; endDate?: string; goal?: string }
  ): Promise<ISprint> {
    const sprint = await sprintRepository.findById(id);
    if (!sprint) {
      throw new NotFoundError(`Sprint not found with id ${id}`);
    }

    if (sprint.status === 'ACTIVE') {
      throw new BadRequestError('Sprint is already active');
    }

    if (sprint.status === 'COMPLETED') {
      throw new BadRequestError('Cannot restart a completed sprint');
    }

    const activeSprint = await sprintRepository.findActiveSprint(sprint.projectId.toString());
    if (activeSprint && activeSprint._id.toString() !== id) {
      throw new BadRequestError(
        `Cannot start sprint: Sprint "${activeSprint.name}" is already active in this project`
      );
    }

    const updates: Partial<ISprint> = {
      status: 'ACTIVE',
      startDate: data.startDate ? new Date(data.startDate) : sprint.startDate || new Date(),
      endDate: data.endDate
        ? new Date(data.endDate)
        : sprint.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // default 2 weeks
    };

    if (data.goal !== undefined) updates.goal = data.goal;

    const updated = await sprintRepository.update(id, updates);
    return updated!;
  }

  async completeSprint(id: string, targetSprintId?: string | null): Promise<ISprint> {
    const sprint = await sprintRepository.findById(id);
    if (!sprint) {
      throw new NotFoundError(`Sprint not found with id ${id}`);
    }

    if (sprint.status !== 'ACTIVE') {
      throw new BadRequestError('Only active sprints can be completed');
    }

    // Find incomplete issues in this sprint
    const incompleteIssues = await IssueModel.find({
      sprintId: sprint._id,
      status: { $ne: 'DONE' },
    });

    if (incompleteIssues.length > 0) {
      const incompleteIds = incompleteIssues.map((i) => i._id);

      if (targetSprintId) {
        // Move incomplete issues to target sprint
        await IssueModel.updateMany(
          { _id: { $in: incompleteIds } },
          { $set: { sprintId: new Types.ObjectId(targetSprintId) } }
        );
        await sprintRepository.update(targetSprintId, {
          $addToSet: { issueIds: { $each: incompleteIds } } as any,
        });
      } else {
        // Move incomplete issues to backlog
        await IssueModel.updateMany(
          { _id: { $in: incompleteIds } },
          { $unset: { sprintId: 1 } }
        );
      }
    }

    const updated = await sprintRepository.update(id, {
      status: 'COMPLETED',
      endDate: new Date(),
    });

    return updated!;
  }

  async deleteSprint(id: string): Promise<void> {
    const sprint = await sprintRepository.findById(id);
    if (!sprint) {
      throw new NotFoundError(`Sprint not found with id ${id}`);
    }

    // Move issues to backlog
    await IssueModel.updateMany(
      { sprintId: sprint._id },
      { $unset: { sprintId: 1 } }
    );

    await sprintRepository.delete(id);
  }

  async addIssuesToSprint(sprintId: string, issueIds: string[]): Promise<ISprint> {
    const sprint = await sprintRepository.findById(sprintId);
    if (!sprint) {
      throw new NotFoundError(`Sprint not found with id ${sprintId}`);
    }

    const objectIds = issueIds.map((id) => new Types.ObjectId(id));

    await IssueModel.updateMany(
      { _id: { $in: objectIds } },
      { $set: { sprintId: sprint._id } }
    );

    const updated = await sprintRepository.update(sprintId, {
      $addToSet: { issueIds: { $each: objectIds } } as any,
    });

    return updated!;
  }

  async removeIssuesFromSprint(sprintId: string, issueIds: string[]): Promise<ISprint> {
    const sprint = await sprintRepository.findById(sprintId);
    if (!sprint) {
      throw new NotFoundError(`Sprint not found with id ${sprintId}`);
    }

    const objectIds = issueIds.map((id) => new Types.ObjectId(id));

    await IssueModel.updateMany(
      { _id: { $in: objectIds }, sprintId: sprint._id },
      { $unset: { sprintId: 1 } }
    );

    const updated = await sprintRepository.update(sprintId, {
      $pullAll: { issueIds: objectIds } as any,
    });

    return updated!;
  }
}

export const sprintService = new SprintService();
