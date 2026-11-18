"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueController = exports.IssueController = void 0;
const service_1 = require("./service");
const api_response_1 = require("../../utils/api-response");
const pagination_1 = require("../../utils/pagination");
class IssueController {
    async getAll(req, res) {
        const pagination = (0, pagination_1.parsePaginationParams)(req.query);
        const filter = {
            projectId: req.query.projectId,
            sprintId: req.query.sprintId,
            assigneeId: req.query.assigneeId,
            reporterId: req.query.reporterId,
            teamId: req.query.teamId,
            issueType: req.query.issueType,
            status: req.query.status,
            priority: req.query.priority,
            aiCategory: req.query.aiCategory,
            finalCategory: req.query.finalCategory,
            search: req.query.search,
        };
        const { issues, total } = await service_1.issueService.getAll(filter, pagination);
        (0, api_response_1.sendPaginated)(res, issues, total, pagination.page, pagination.limit);
    }
    async getById(req, res) {
        const issue = await service_1.issueService.getById(req.params.id);
        (0, api_response_1.sendSuccess)(res, issue);
    }
    async getByKey(req, res) {
        const issue = await service_1.issueService.getByKey(req.params.key);
        (0, api_response_1.sendSuccess)(res, issue);
    }
    async create(req, res) {
        const issue = await service_1.issueService.create(req.user.id, req.body, req.user.role);
        (0, api_response_1.sendSuccess)(res, issue, 201);
    }
    async update(req, res) {
        const issue = await service_1.issueService.update(req.params.id, req.user.id, req.body, req.user.role);
        (0, api_response_1.sendSuccess)(res, issue);
    }
    async updateStatus(req, res) {
        const { status, rank, sprintId } = req.body;
        const issue = await service_1.issueService.updateStatus(req.params.id, req.user.id, status, rank, sprintId, req.user.role);
        (0, api_response_1.sendSuccess)(res, issue);
    }
    async overrideCategory(req, res) {
        const { category } = req.body;
        const issue = await service_1.issueService.overrideCategory(req.params.id, req.user.id, category, req.user.role);
        (0, api_response_1.sendSuccess)(res, issue);
    }
    async reclassify(req, res) {
        const result = await service_1.issueService.reclassify(req.params.id, req.user.role);
        (0, api_response_1.sendSuccess)(res, result);
    }
    async delete(req, res) {
        await service_1.issueService.delete(req.params.id, req.user.id, req.user.role);
        (0, api_response_1.sendSuccess)(res, { message: 'Issue deleted successfully' });
    }
}
exports.IssueController = IssueController;
exports.issueController = new IssueController();
