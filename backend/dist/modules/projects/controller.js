"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectController = exports.ProjectController = void 0;
const service_1 = require("./service");
const api_response_1 = require("../../utils/api-response");
class ProjectController {
    async getAll(req, res) {
        const filter = {};
        if (req.query.category)
            filter.category = req.query.category;
        if (req.query.status)
            filter.status = req.query.status;
        if (req.query.leadId)
            filter.leadId = req.query.leadId;
        if (req.query.teamId)
            filter.teamId = req.query.teamId;
        const projects = await service_1.projectService.getAllProjects(filter);
        (0, api_response_1.sendSuccess)(res, projects);
    }
    async getById(req, res) {
        const project = await service_1.projectService.getProjectById(req.params.id);
        (0, api_response_1.sendSuccess)(res, project);
    }
    async getByKey(req, res) {
        const project = await service_1.projectService.getProjectByKey(req.params.key);
        (0, api_response_1.sendSuccess)(res, project);
    }
    async create(req, res) {
        const project = await service_1.projectService.createProject(req.body);
        (0, api_response_1.sendSuccess)(res, project, 201);
    }
    async update(req, res) {
        const project = await service_1.projectService.updateProject(req.params.id, req.body);
        (0, api_response_1.sendSuccess)(res, project);
    }
    async delete(req, res) {
        await service_1.projectService.deleteProject(req.params.id);
        (0, api_response_1.sendSuccess)(res, { message: 'Project deleted successfully' });
    }
    async getBoard(req, res) {
        const sprintId = req.query.sprintId;
        const board = await service_1.projectService.getProjectBoard(req.params.idOrKey, sprintId);
        (0, api_response_1.sendSuccess)(res, board);
    }
}
exports.ProjectController = ProjectController;
exports.projectController = new ProjectController();
