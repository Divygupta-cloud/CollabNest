"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sprintController = exports.SprintController = void 0;
const service_1 = require("./service");
const api_response_1 = require("../../utils/api-response");
class SprintController {
    async getByProject(req, res) {
        const projectId = (req.params.projectId || req.query.projectId);
        const sprints = await service_1.sprintService.getSprintsByProject(projectId);
        (0, api_response_1.sendSuccess)(res, sprints);
    }
    async getById(req, res) {
        const sprint = await service_1.sprintService.getSprintById(req.params.id);
        (0, api_response_1.sendSuccess)(res, sprint);
    }
    async create(req, res) {
        const sprint = await service_1.sprintService.createSprint(req.body);
        (0, api_response_1.sendSuccess)(res, sprint, 201);
    }
    async update(req, res) {
        const sprint = await service_1.sprintService.updateSprint(req.params.id, req.body);
        (0, api_response_1.sendSuccess)(res, sprint);
    }
    async start(req, res) {
        const sprint = await service_1.sprintService.startSprint(req.params.id, req.body);
        (0, api_response_1.sendSuccess)(res, sprint);
    }
    async complete(req, res) {
        const sprint = await service_1.sprintService.completeSprint(req.params.id, req.body.targetSprintId);
        (0, api_response_1.sendSuccess)(res, sprint);
    }
    async delete(req, res) {
        await service_1.sprintService.deleteSprint(req.params.id);
        (0, api_response_1.sendSuccess)(res, { message: 'Sprint deleted successfully' });
    }
    async addIssues(req, res) {
        const sprint = await service_1.sprintService.addIssuesToSprint(req.params.id, req.body.issueIds);
        (0, api_response_1.sendSuccess)(res, sprint);
    }
    async removeIssues(req, res) {
        const sprint = await service_1.sprintService.removeIssuesFromSprint(req.params.id, req.body.issueIds);
        (0, api_response_1.sendSuccess)(res, sprint);
    }
}
exports.SprintController = SprintController;
exports.sprintController = new SprintController();
