"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sprintService = exports.SprintService = void 0;
const repository_1 = require("./repository");
const model_1 = require("../issues/model");
const errors_1 = require("../../utils/errors");
const mongoose_1 = require("mongoose");
class SprintService {
    async getSprintsByProject(projectId) {
        return repository_1.sprintRepository.findByProjectId(projectId);
    }
    async getSprintById(id) {
        const sprint = await repository_1.sprintRepository.findById(id);
        if (!sprint) {
            throw new errors_1.NotFoundError(`Sprint not found with id ${id}`);
        }
        return sprint;
    }
    async createSprint(data) {
        return repository_1.sprintRepository.create(data);
    }
    async updateSprint(id, updates) {
        const updated = await repository_1.sprintRepository.update(id, updates);
        if (!updated) {
            throw new errors_1.NotFoundError(`Sprint not found with id ${id}`);
        }
        return updated;
    }
    async startSprint(id, data) {
        const sprint = await repository_1.sprintRepository.findById(id);
        if (!sprint) {
            throw new errors_1.NotFoundError(`Sprint not found with id ${id}`);
        }
        if (sprint.status === 'ACTIVE') {
            throw new errors_1.BadRequestError('Sprint is already active');
        }
        if (sprint.status === 'COMPLETED') {
            throw new errors_1.BadRequestError('Cannot restart a completed sprint');
        }
        const activeSprint = await repository_1.sprintRepository.findActiveSprint(sprint.projectId.toString());
        if (activeSprint && activeSprint._id.toString() !== id) {
            throw new errors_1.BadRequestError(`Cannot start sprint: Sprint "${activeSprint.name}" is already active in this project`);
        }
        const updates = {
            status: 'ACTIVE',
            startDate: data.startDate ? new Date(data.startDate) : sprint.startDate || new Date(),
            endDate: data.endDate
                ? new Date(data.endDate)
                : sprint.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // default 2 weeks
        };
        if (data.goal !== undefined)
            updates.goal = data.goal;
        const updated = await repository_1.sprintRepository.update(id, updates);
        return updated;
    }
    async completeSprint(id, targetSprintId) {
        const sprint = await repository_1.sprintRepository.findById(id);
        if (!sprint) {
            throw new errors_1.NotFoundError(`Sprint not found with id ${id}`);
        }
        if (sprint.status !== 'ACTIVE') {
            throw new errors_1.BadRequestError('Only active sprints can be completed');
        }
        // Find incomplete issues in this sprint
        const incompleteIssues = await model_1.IssueModel.find({
            sprintId: sprint._id,
            status: { $ne: 'DONE' },
        });
        if (incompleteIssues.length > 0) {
            const incompleteIds = incompleteIssues.map((i) => i._id);
            if (targetSprintId) {
                // Move incomplete issues to target sprint
                await model_1.IssueModel.updateMany({ _id: { $in: incompleteIds } }, { $set: { sprintId: new mongoose_1.Types.ObjectId(targetSprintId) } });
                await repository_1.sprintRepository.update(targetSprintId, {
                    $addToSet: { issueIds: { $each: incompleteIds } },
                });
            }
            else {
                // Move incomplete issues to backlog
                await model_1.IssueModel.updateMany({ _id: { $in: incompleteIds } }, { $unset: { sprintId: 1 } });
            }
        }
        const updated = await repository_1.sprintRepository.update(id, {
            status: 'COMPLETED',
            endDate: new Date(),
        });
        return updated;
    }
    async deleteSprint(id) {
        const sprint = await repository_1.sprintRepository.findById(id);
        if (!sprint) {
            throw new errors_1.NotFoundError(`Sprint not found with id ${id}`);
        }
        // Move issues to backlog
        await model_1.IssueModel.updateMany({ sprintId: sprint._id }, { $unset: { sprintId: 1 } });
        await repository_1.sprintRepository.delete(id);
    }
    async addIssuesToSprint(sprintId, issueIds) {
        const sprint = await repository_1.sprintRepository.findById(sprintId);
        if (!sprint) {
            throw new errors_1.NotFoundError(`Sprint not found with id ${sprintId}`);
        }
        const objectIds = issueIds.map((id) => new mongoose_1.Types.ObjectId(id));
        await model_1.IssueModel.updateMany({ _id: { $in: objectIds } }, { $set: { sprintId: sprint._id } });
        const updated = await repository_1.sprintRepository.update(sprintId, {
            $addToSet: { issueIds: { $each: objectIds } },
        });
        return updated;
    }
    async removeIssuesFromSprint(sprintId, issueIds) {
        const sprint = await repository_1.sprintRepository.findById(sprintId);
        if (!sprint) {
            throw new errors_1.NotFoundError(`Sprint not found with id ${sprintId}`);
        }
        const objectIds = issueIds.map((id) => new mongoose_1.Types.ObjectId(id));
        await model_1.IssueModel.updateMany({ _id: { $in: objectIds }, sprintId: sprint._id }, { $unset: { sprintId: 1 } });
        const updated = await repository_1.sprintRepository.update(sprintId, {
            $pullAll: { issueIds: objectIds },
        });
        return updated;
    }
}
exports.SprintService = SprintService;
exports.sprintService = new SprintService();
