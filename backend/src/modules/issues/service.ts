import { issueRepository, IssueFilter } from './repository';
import { projectRepository } from '../projects/repository';
import { sprintRepository } from '../sprints/repository';
import { aiClassificationService } from '../ai/service';
import { ActivityModel } from '../activity/model';
import { NotificationModel } from '../notifications/model';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { PaginationOptions } from '../../utils/pagination';
import { IIssue, AICategory, IssueStatus } from './model';
import { Types } from 'mongoose';
import { isRoleAllowed } from '../../middleware/rbac.middleware';

export class IssueService {
  async getAll(filter: IssueFilter = {}, pagination?: PaginationOptions) {
    return issueRepository.findAll(filter, pagination);
  }

  async getById(id: string): Promise<IIssue> {
    const issue = await issueRepository.findById(id);
    if (!issue) {
      throw new NotFoundError(`Issue not found with id ${id}`);
    }
    return issue;
  }

  async getByKey(key: string): Promise<IIssue> {
    const issue = await issueRepository.findByKey(key);
    if (!issue) {
      throw new NotFoundError(`Issue not found with key ${key}`);
    }
    return issue;
  }

  async create(userId: string, data: any, userRole?: string): Promise<IIssue> {
    // 1. RBAC: Only Team Leads, Managers, and Admins can create Epics
    if (data.issueType === 'EPIC') {
      if (!isRoleAllowed(userRole, 'ADMIN', 'MANAGER', 'TEAM_LEADER')) {
        throw new ForbiddenError('Only Team Leads, Managers, and Admins can create Epics');
      }
    }

    // 2. RBAC: QA role can only create BUG or TASK reports
    if (isRoleAllowed(userRole, 'QA')) {
      if (data.issueType !== 'BUG' && data.issueType !== 'TASK') {
        throw new ForbiddenError('QA role can only file Bug reports or Tasks');
      }
    }

    const project = await projectRepository.findById(data.projectId);
    if (!project) {
      throw new NotFoundError(`Project not found with id ${data.projectId}`);
    }

    const nextNumber = await projectRepository.getNextIssueNumber(data.projectId);
    const issueKey = `${project.key}-${nextNumber}`;

    const issueData: Partial<IIssue> = {
      ...data,
      issueKey,
      reporterId: new Types.ObjectId(userId),
      aiStatus: 'PENDING',
      isDeleted: false,
    };

    if (data.assigneeId) {
      issueData.assigneeId = new Types.ObjectId(data.assigneeId);
    }
    if (data.assigneeIds && Array.isArray(data.assigneeIds)) {
      const mappedIds = data.assigneeIds.map((id: string) => new Types.ObjectId(id));
      issueData.assigneeIds = mappedIds;
      if (!issueData.assigneeId && mappedIds.length > 0) {
        issueData.assigneeId = mappedIds[0];
      }
    }
    if (data.sprintId) {
      issueData.sprintId = new Types.ObjectId(data.sprintId);
    }
    if (data.teamId) {
      issueData.teamId = new Types.ObjectId(data.teamId);
    }
    if (data.parentIssueId) {
      issueData.parentIssueId = new Types.ObjectId(data.parentIssueId);
    }

    const created = await issueRepository.create(issueData);

    // If attached to a sprint, update the sprint
    if (created.sprintId) {
      await sprintRepository.update(created.sprintId.toString(), {
        $addToSet: { issueIds: created._id } as any,
      });
    }

    // Log Activity
    await ActivityModel.create({
      actorId: new Types.ObjectId(userId),
      entityType: 'ISSUE',
      entityId: created._id.toString(),
      action: 'ISSUE_CREATED',
      newValue: created.issueKey,
      metadata: { title: created.title, projectId: project._id },
    });

    // Notify assignee if not creator
    if (created.assigneeId && created.assigneeId.toString() !== userId) {
      await NotificationModel.create({
        recipientId: created.assigneeId,
        type: 'ISSUE_ASSIGNED',
        title: 'New Issue Assigned',
        message: `You were assigned to ${created.issueKey}: ${created.title}`,
        entityType: 'ISSUE',
        entityId: created._id.toString(),
        link: `/issue/${created.issueKey}`,
      });
    }

    // Trigger AI classification asynchronously - ONLY for Stories and Subtasks (NEVER for EPIC)
    if (created.issueType === 'STORY' || created.issueType === 'SUBTASK') {
      aiClassificationService.classifyIssueInBackground(created._id.toString());
    }

    return created;
  }

  async update(id: string, userId: string, updates: any, userRole?: string): Promise<IIssue> {
    const existing = await issueRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Issue not found with id ${id}`);
    }

    const getDocId = (val: any): string | undefined => {
      if (!val) return undefined;
      if (val._id) return val._id.toString();
      return val.toString();
    };

    const previousStatus = existing.status;
    const previousAssignee = getDocId(existing.assigneeId);
    const previousSprint = getDocId(existing.sprintId);

    // RBAC: Only Team Leads, Managers, and Admins can assign Epics
    const newAssigneeStr = getDocId(updates.assigneeId);
    if (existing.issueType === 'EPIC' && updates.assigneeId !== undefined && newAssigneeStr !== previousAssignee) {
      if (!isRoleAllowed(userRole, 'ADMIN', 'MANAGER', 'TEAM_LEADER')) {
        throw new ForbiddenError('Only Team Leads, Managers, and Admins can assign Epics');
      }
    }

    // RBAC: Only Team Leads, Managers, and Admins can promote an issue to Epic
    if (updates.issueType === 'EPIC' && existing.issueType !== 'EPIC') {
      if (!isRoleAllowed(userRole, 'ADMIN', 'MANAGER', 'TEAM_LEADER')) {
        throw new ForbiddenError('Only Team Leads, Managers, and Admins can promote an issue to Epic');
      }
    }

    // Convert string IDs in updates to ObjectIds if present
    if (updates.assigneeId) {
      updates.assigneeId = new Types.ObjectId(updates.assigneeId);
    }
    if ((updates as any).assigneeIds && Array.isArray((updates as any).assigneeIds)) {
      (updates as any).assigneeIds = (updates as any).assigneeIds.map((id: string) => new Types.ObjectId(id));
      if (!updates.assigneeId && (updates as any).assigneeIds.length > 0) {
        updates.assigneeId = (updates as any).assigneeIds[0];
      }
    }
    if (updates.sprintId) {
      updates.sprintId = new Types.ObjectId(updates.sprintId);
    }
    if (updates.teamId) {
      updates.teamId = new Types.ObjectId(updates.teamId);
    }

    // Check sprint changes
    const newSprintId = getDocId(updates.sprintId);
    if (updates.sprintId !== undefined && newSprintId !== previousSprint) {
      // RBAC: Only Team Leads, Managers, and Admins can move issues into/out of sprints
      if (!isRoleAllowed(userRole, 'ADMIN', 'MANAGER', 'TEAM_LEADER')) {
        throw new ForbiddenError('Only Team Leads, Managers, and Admins can assign issues to sprints');
      }

      if (previousSprint) {
        await sprintRepository.update(previousSprint, {
          $pull: { issueIds: existing._id } as any,
        });
      }
      if (newSprintId) {
        await sprintRepository.update(newSprintId, {
          $addToSet: { issueIds: existing._id } as any,
        });
      }
    }

    const updated = await issueRepository.update(id, updates);
    if (!updated) {
      throw new NotFoundError(`Issue not found with id ${id}`);
    }

    // Activity: status change
    if (updates.status && updates.status !== previousStatus) {
      await ActivityModel.create({
        actorId: new Types.ObjectId(userId),
        entityType: 'ISSUE',
        entityId: updated._id.toString(),
        action: 'STATUS_CHANGED',
        oldValue: previousStatus,
        newValue: updates.status,
      });

      // Notify assignee and reporter if someone else made the update
      const recipientsToNotify = [
        getDocId(updated.assigneeId),
        getDocId(updated.reporterId),
      ].filter((recId): recId is string => Boolean(recId) && recId !== userId);

      for (const recipientId of [...new Set(recipientsToNotify)]) {
        await NotificationModel.create({
          recipientId: new Types.ObjectId(recipientId),
          type: 'ISSUE_STATUS_CHANGED',
          title: 'Issue Status Updated',
          message: `${updated.issueKey} changed status to ${updates.status}`,
          entityType: 'ISSUE',
          entityId: updated._id.toString(),
          link: `/issue/${updated.issueKey}`,
        });
      }
    }

    // Activity: assignee change
    const newAssigneeId = getDocId(updates.assigneeId);
    if (updates.assigneeId !== undefined && newAssigneeId !== previousAssignee) {
      await ActivityModel.create({
        actorId: new Types.ObjectId(userId),
        entityType: 'ISSUE',
        entityId: updated._id.toString(),
        action: 'ASSIGNEE_CHANGED',
        oldValue: previousAssignee || 'Unassigned',
        newValue: newAssigneeId || 'Unassigned',
      });

      if (newAssigneeId && newAssigneeId !== userId) {
        await NotificationModel.create({
          recipientId: new Types.ObjectId(newAssigneeId),
          type: 'ISSUE_ASSIGNED',
          title: 'Issue Assigned to You',
          message: `You were assigned to ${updated.issueKey}: ${updated.title}`,
          entityType: 'ISSUE',
          entityId: updated._id.toString(),
          link: `/issue/${updated.issueKey}`,
        });
      }
    }

    return updated;
  }

  async updateStatus(
    id: string,
    userId: string,
    status: IssueStatus,
    rank?: number,
    sprintId?: string | null,
    userRole?: string
  ): Promise<IIssue> {
    const updates: Record<string, any> = { status };
    if (rank !== undefined) updates.rank = rank;
    if (sprintId !== undefined) updates.sprintId = sprintId ? new Types.ObjectId(sprintId) : null;

    return this.update(id, userId, updates, userRole);
  }

  async overrideCategory(id: string, userId: string, category: AICategory, userRole?: string): Promise<IIssue> {
    if (!isRoleAllowed(userRole, 'ADMIN', 'MANAGER', 'TEAM_LEADER')) {
      throw new ForbiddenError('Only Team Leads, Managers, and Admins can override issue category');
    }

    const issue = await issueRepository.findById(id);
    if (!issue) {
      throw new NotFoundError(`Issue not found with id ${id}`);
    }

    const previousCategory = issue.finalCategory || issue.aiCategory;

    const updated = await issueRepository.update(id, { finalCategory: category });

    await ActivityModel.create({
      actorId: new Types.ObjectId(userId),
      entityType: 'ISSUE',
      entityId: id,
      action: 'CATEGORY_OVERRIDDEN',
      oldValue: previousCategory,
      newValue: category,
    });

    return updated!;
  }

  async reclassify(id: string, userRole?: string): Promise<{ message: string }> {
    if (!isRoleAllowed(userRole, 'ADMIN', 'MANAGER', 'TEAM_LEADER')) {
      throw new ForbiddenError('Only Team Leads, Managers, and Admins can reclassify issues');
    }

    const issue = await issueRepository.findById(id);
    if (!issue) {
      throw new NotFoundError(`Issue not found with id ${id}`);
    }

    if (issue.issueType === 'EPIC') {
      throw new BadRequestError('AI classification is only supported for Stories and Subtasks, not for Epics');
    }

    await issueRepository.update(id, { aiStatus: 'PENDING' });
    aiClassificationService.classifyIssueInBackground(id);

    return { message: 'Reclassification initiated' };
  }

  async delete(id: string, userId: string, userRole?: string): Promise<void> {
    if (!isRoleAllowed(userRole, 'ADMIN', 'MANAGER', 'TEAM_LEADER')) {
      throw new ForbiddenError('Only Team Leads, Managers, and Admins can delete issues');
    }

    const issue = await issueRepository.findById(id);
    if (!issue) {
      throw new NotFoundError(`Issue not found with id ${id}`);
    }

    await issueRepository.softDelete(id, userId);

    if (issue.sprintId) {
      await sprintRepository.update(issue.sprintId.toString(), {
        $pull: { issueIds: issue._id } as any,
      });
    }

    await ActivityModel.create({
      actorId: new Types.ObjectId(userId),
      entityType: 'ISSUE',
      entityId: id,
      action: 'ISSUE_DELETED',
      oldValue: issue.issueKey,
    });
  }
}

export const issueService = new IssueService();
