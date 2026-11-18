import { projectRepository } from './repository';
import { IssueModel } from '../issues/model';
import { SprintModel } from '../sprints/model';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { IProject } from './model';

export class ProjectService {
  async getAllProjects(filter: Record<string, any> = {}): Promise<IProject[]> {
    return projectRepository.findAll(filter);
  }

  async getProjectById(id: string): Promise<IProject> {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new NotFoundError(`Project not found with id ${id}`);
    }
    return project;
  }

  async getProjectByKey(key: string): Promise<IProject> {
    const project = await projectRepository.findByKey(key);
    if (!project) {
      throw new NotFoundError(`Project not found with key ${key}`);
    }
    return project;
  }

  async createProject(data: Partial<IProject>): Promise<IProject> {
    if (data.key) {
      const existing = await projectRepository.findByKey(data.key);
      if (existing) {
        throw new ConflictError(`Project with key ${data.key} already exists`);
      }
    }
    return projectRepository.create(data);
  }

  async updateProject(id: string, updates: Partial<IProject>): Promise<IProject> {
    const updated = await projectRepository.update(id, updates);
    if (!updated) {
      throw new NotFoundError(`Project not found with id ${id}`);
    }
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    const deleted = await projectRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Project not found with id ${id}`);
    }
    // Also clean up or flag issues/sprints in the project
    await IssueModel.deleteMany({ projectId: id });
    await SprintModel.deleteMany({ projectId: id });
  }

  async getProjectBoard(idOrKey: string, sprintId?: string) {
    let project: IProject | null = null;
    if (idOrKey.match(/^[0-9a-fA-F]{24}$/)) {
      project = await projectRepository.findById(idOrKey);
    }
    if (!project) {
      project = await projectRepository.findByKey(idOrKey);
    }
    if (!project) {
      throw new NotFoundError(`Project not found with identifier ${idOrKey}`);
    }

    const query: Record<string, any> = { projectId: project._id };

    if (sprintId) {
      query.sprintId = sprintId;
    } else {
      // Find active sprint if available
      const activeSprint = await SprintModel.findOne({ projectId: project._id, status: 'ACTIVE' });
      if (activeSprint) {
        query.sprintId = activeSprint._id;
      }
    }

    const issues = await IssueModel.find(query)
      .populate('assigneeId', 'name username email avatarUrl role title')
      .populate('reporterId', 'name username email avatarUrl role title')
      .sort({ rank: 1, createdAt: -1 });

    const columns = {
      TODO: issues.filter((i) => i.status === 'TODO'),
      IN_PROGRESS: issues.filter((i) => i.status === 'IN_PROGRESS'),
      IN_REVIEW: issues.filter((i) => i.status === 'IN_REVIEW'),
      DONE: issues.filter((i) => i.status === 'DONE'),
    };

    return {
      project,
      totalIssues: issues.length,
      columns,
    };
  }
}

export const projectService = new ProjectService();
