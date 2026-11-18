"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectService = exports.ProjectService = void 0;
const repository_1 = require("./repository");
const model_1 = require("../issues/model");
const model_2 = require("../sprints/model");
const errors_1 = require("../../utils/errors");
class ProjectService {
    async getAllProjects(filter = {}) {
        return repository_1.projectRepository.findAll(filter);
    }
    async getProjectById(id) {
        const project = await repository_1.projectRepository.findById(id);
        if (!project) {
            throw new errors_1.NotFoundError(`Project not found with id ${id}`);
        }
        return project;
    }
    async getProjectByKey(key) {
        const project = await repository_1.projectRepository.findByKey(key);
        if (!project) {
            throw new errors_1.NotFoundError(`Project not found with key ${key}`);
        }
        return project;
    }
    async createProject(data) {
        if (data.key) {
            const existing = await repository_1.projectRepository.findByKey(data.key);
            if (existing) {
                throw new errors_1.ConflictError(`Project with key ${data.key} already exists`);
            }
        }
        return repository_1.projectRepository.create(data);
    }
    async updateProject(id, updates) {
        const updated = await repository_1.projectRepository.update(id, updates);
        if (!updated) {
            throw new errors_1.NotFoundError(`Project not found with id ${id}`);
        }
        return updated;
    }
    async deleteProject(id) {
        const deleted = await repository_1.projectRepository.delete(id);
        if (!deleted) {
            throw new errors_1.NotFoundError(`Project not found with id ${id}`);
        }
        // Also clean up or flag issues/sprints in the project
        await model_1.IssueModel.deleteMany({ projectId: id });
        await model_2.SprintModel.deleteMany({ projectId: id });
    }
    async getProjectBoard(idOrKey, sprintId) {
        let project = null;
        if (idOrKey.match(/^[0-9a-fA-F]{24}$/)) {
            project = await repository_1.projectRepository.findById(idOrKey);
        }
        if (!project) {
            project = await repository_1.projectRepository.findByKey(idOrKey);
        }
        if (!project) {
            throw new errors_1.NotFoundError(`Project not found with identifier ${idOrKey}`);
        }
        const query = { projectId: project._id };
        if (sprintId) {
            query.sprintId = sprintId;
        }
        else {
            // Find active sprint if available
            const activeSprint = await model_2.SprintModel.findOne({ projectId: project._id, status: 'ACTIVE' });
            if (activeSprint) {
                query.sprintId = activeSprint._id;
            }
        }
        const issues = await model_1.IssueModel.find(query)
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
exports.ProjectService = ProjectService;
exports.projectService = new ProjectService();
