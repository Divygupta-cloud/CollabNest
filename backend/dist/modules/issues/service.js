"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueService = exports.IssueService = void 0;
const repository_1 = require("./repository");
const repository_2 = require("../projects/repository");
const repository_3 = require("../sprints/repository");
const service_1 = require("../ai/service");
const model_1 = require("../activity/model");
const model_2 = require("../notifications/model");
const errors_1 = require("../../utils/errors");
const mongoose_1 = require("mongoose");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
class IssueService {
    async getAll(filter = {}, pagination) {
        return repository_1.issueRepository.findAll(filter, pagination);
    }
    async getById(id) {
        const issue = await repository_1.issueRepository.findById(id);
        if (!issue) {
            throw new errors_1.NotFoundError(`Issue not found with id ${id}`);
        }
        return issue;
    }
    async getByKey(key) {
        const issue = await repository_1.issueRepository.findByKey(key);
        if (!issue) {
            throw new errors_1.NotFoundError(`Issue not found with key ${key}`);
        }
        return issue;
    }
    async create(userId, data, userRole) {
        // 1. RBAC: Only Team Leads, Managers, and Admins can create Epics
        if (data.issueType === 'EPIC') {
            if (!(0, rbac_middleware_1.isRoleAllowed)(userRole, 'ADMIN', 'MANAGER', 'TEAM_LEADER')) {
                throw new errors_1.ForbiddenError('Only Team Leads, Managers, and Admins can create Epics');
            }
        }
        // 2. RBAC: QA role can only create BUG or TASK reports
        if ((0, rbac_middleware_1.isRoleAllowed)(userRole, 'QA')) {
            if (data.issueType !== 'BUG' && data.issueType !== 'TASK') {
                throw new errors_1.ForbiddenError('QA role can only file Bug reports or Tasks');
            }
        }
        const project = await repository_2.projectRepository.findById(data.projectId);
        if (!project) {
            throw new errors_1.NotFoundError(`Project not found with id ${data.projectId}`);
        }
        const nextNumber = await repository_2.projectRepository.getNextIssueNumber(data.projectId);
        const issueKey = `${project.key}-${nextNumber}`;
        const issueData = {
            ...data,
            issueKey,
            reporterId: new mongoose_1.Types.ObjectId(userId),
            aiStatus: 'PENDING',
            isDeleted: false,
        };
        if (data.assigneeId) {
            issueData.assigneeId = new mongoose_1.Types.ObjectId(data.assigneeId);
        }
        if (data.assigneeIds && Array.isArray(data.assigneeIds)) {
            const mappedIds = data.assigneeIds.map((id) => new mongoose_1.Types.ObjectId(id));
            issueData.assigneeIds = mappedIds;
            if (!issueData.assigneeId && mappedIds.length > 0) {
                issueData.assigneeId = mappedIds[0];
            }
        }
        if (data.sprintId) {
            issueData.sprintId = new mongoose_1.Types.ObjectId(data.sprintId);
        }
        if (data.teamId) {
            issueData.teamId = new mongoose_1.Types.ObjectId(data.teamId);
        }
        if (data.parentIssueId) {
            issueData.parentIssueId = new mongoose_1.Types.ObjectId(data.parentIssueId);
        }
        const created = await repository_1.issueRepository.create(issueData);
        // If attached to a sprint, update the sprint
        if (created.sprintId) {
            await repository_3.sprintRepository.update(created.sprintId.toString(), {
                $addToSet: { issueIds: created._id },
            });
        }
        // Log Activity
        await model_1.ActivityModel.create({
            actorId: new mongoose_1.Types.ObjectId(userId),
            entityType: 'ISSUE',
            entityId: created._id.toString(),
            action: 'ISSUE_CREATED',
            newValue: created.issueKey,
            metadata: { title: created.title, projectId: project._id },
        });
        // Notify assignee if not creator
        if (created.assigneeId && created.assigneeId.toString() !== userId) {
            await model_2.NotificationModel.create({
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
            service_1.aiClassificationService.classifyIssueInBackground(created._id.toString());
        }
        return created;
    }
    async update(id, userId, updates, userRole) {
        const existing = await repository_1.issueRepository.findById(id);
        if (!existing) {
            throw new errors_1.NotFoundError(`Issue not found with id ${id}`);
        }
        const getDocId = (val) => {
            if (!val)
                return undefined;
            if (val._id)
                return val._id.toString();
            return val.toString();
        };
        const previousStatus = existing.status;
        const previousAssignee = getDocId(existing.assigneeId);
        const previousSprint = getDocId(existing.sprintId);
        // RBAC: Only Team Leads, Managers, and Admins can assign Epics
        const newAssigneeStr = getDocId(updates.assigneeId);
        if (existing.issueType === 'EPIC' && updates.assigneeId !== undefined && newAssigneeStr !== previousAssignee) {
            if (!(0, rbac_middleware_1.isRoleAllowed)(userRole, 'ADMIN', 'MANAGER', 'TEAM_LEADER')) {
                throw new errors_1.ForbiddenError('Only Team Leads, Managers, and Admins can assign Epics');
            }
        }
        // RBAC: Only Team Leads, Managers, and Admins can promote an issue to Epic
        if (updates.issueType === 'EPIC' && existing.issueType !== 'EPIC') {
            if (!(0, rbac_middleware_1.isRoleAllowed)(userRole, 'ADMIN', 'MANAGER', 'TEAM_LEADER')) {
                throw new errors_1.ForbiddenError('Only Team Leads, Managers, and Admins can promote an issue to Epic');
            }
        }
        // Convert string IDs in updates to ObjectIds if present
        if (updates.assigneeId) {
            updates.assigneeId = new mongoose_1.Types.ObjectId(updates.assigneeId);
        }
        if (updates.assigneeIds && Array.isArray(updates.assigneeIds)) {
            updates.assigneeIds = updates.assigneeIds.map((id) => new mongoose_1.Types.ObjectId(id));
            if (!updates.assigneeId && updates.assigneeIds.length > 0) {
                updates.assigneeId = updates.assigneeIds[0];
            }
        }
        if (updates.sprintId) {
            updates.sprintId = new mongoose_1.Types.ObjectId(updates.sprintId);
        }
        if (updates.teamId) {
            updates.teamId = new mongoose_1.Types.ObjectId(updates.teamId);
        }
        // Check sprint changes
        const newSprintId = getDocId(updates.sprintId);
        if (updates.sprintId !== undefined && newSprintId !== previousSprint) {
            // RBAC: Only Team Leads, Managers, and Admins can move issues into/out of sprints
            if (!(0, rbac_middleware_1.isRoleAllowed)(userRole, 'ADMIN', 'MANAGER', 'TEAM_LEADER')) {
                throw new errors_1.ForbiddenError('Only Team Leads, Managers, and Admins can assign issues to sprints');
            }
            if (previousSprint) {
                await repository_3.sprintRepository.update(previousSprint, {
                    $pull: { issueIds: existing._id },
                });
            }
            if (newSprintId) {
                await repository_3.sprintRepository.update(newSprintId, {
                    $addToSet: { issueIds: existing._id },
                });
            }
        }
        const updated = await repository_1.issueRepository.update(id, updates);
        if (!updated) {
            throw new errors_1.NotFoundError(`Issue not found with id ${id}`);
        }
        // Activity: status change
        if (updates.status && updates.status !== previousStatus) {
            await model_1.ActivityModel.create({
                actorId: new mongoose_1.Types.ObjectId(userId),
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
            ].filter((recId) => Boolean(recId) && recId !== userId);
            for (const recipientId of [...new Set(recipientsToNotify)]) {
                await model_2.NotificationModel.create({
                    recipientId: new mongoose_1.Types.ObjectId(recipientId),
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
            await model_1.ActivityModel.create({
                actorId: new mongoose_1.Types.ObjectId(userId),
                entityType: 'ISSUE',
                entityId: updated._id.toString(),
                action: 'ASSIGNEE_CHANGED',
                oldValue: previousAssignee || 'Unassigned',
                newValue: newAssigneeId || 'Unassigned',
            });
            if (newAssigneeId && newAssigneeId !== userId) {
                await model_2.NotificationModel.create({
                    recipientId: new mongoose_1.Types.ObjectId(newAssigneeId),
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
    async updateStatus(id, userId, status, rank, sprintId, userRole) {
        const updates = { status };
        if (rank !== undefined)
            updates.rank = rank;
        if (sprintId !== undefined)
            updates.sprintId = sprintId ? new mongoose_1.Types.ObjectId(sprintId) : null;
        return this.update(id, userId, updates, userRole);
    }
    async overrideCategory(id, userId, category, userRole) {
        if (!(0, rbac_middleware_1.isRoleAllowed)(userRole, 'ADMIN', 'MANAGER', 'TEAM_LEADER')) {
            throw new errors_1.ForbiddenError('Only Team Leads, Managers, and Admins can override issue category');
        }
        const issue = await repository_1.issueRepository.findById(id);
        if (!issue) {
            throw new errors_1.NotFoundError(`Issue not found with id ${id}`);
        }
        const previousCategory = issue.finalCategory || issue.aiCategory;
        const updated = await repository_1.issueRepository.update(id, { finalCategory: category });
        await model_1.ActivityModel.create({
            actorId: new mongoose_1.Types.ObjectId(userId),
            entityType: 'ISSUE',
            entityId: id,
            action: 'CATEGORY_OVERRIDDEN',
            oldValue: previousCategory,
            newValue: category,
        });
        return updated;
    }
    async reclassify(id, userRole) {
        if (!(0, rbac_middleware_1.isRoleAllowed)(userRole, 'ADMIN', 'MANAGER', 'TEAM_LEADER')) {
            throw new errors_1.ForbiddenError('Only Team Leads, Managers, and Admins can reclassify issues');
        }
        const issue = await repository_1.issueRepository.findById(id);
        if (!issue) {
            throw new errors_1.NotFoundError(`Issue not found with id ${id}`);
        }
        if (issue.issueType === 'EPIC') {
            throw new errors_1.BadRequestError('AI classification is only supported for Stories and Subtasks, not for Epics');
        }
        await repository_1.issueRepository.update(id, { aiStatus: 'PENDING' });
        service_1.aiClassificationService.classifyIssueInBackground(id);
        return { message: 'Reclassification initiated' };
    }
    async delete(id, userId, userRole) {
        if (!(0, rbac_middleware_1.isRoleAllowed)(userRole, 'ADMIN', 'MANAGER', 'TEAM_LEADER')) {
            throw new errors_1.ForbiddenError('Only Team Leads, Managers, and Admins can delete issues');
        }
        const issue = await repository_1.issueRepository.findById(id);
        if (!issue) {
            throw new errors_1.NotFoundError(`Issue not found with id ${id}`);
        }
        await repository_1.issueRepository.softDelete(id, userId);
        if (issue.sprintId) {
            await repository_3.sprintRepository.update(issue.sprintId.toString(), {
                $pull: { issueIds: issue._id },
            });
        }
        await model_1.ActivityModel.create({
            actorId: new mongoose_1.Types.ObjectId(userId),
            entityType: 'ISSUE',
            entityId: id,
            action: 'ISSUE_DELETED',
            oldValue: issue.issueKey,
        });
    }
}
exports.IssueService = IssueService;
exports.issueService = new IssueService();
