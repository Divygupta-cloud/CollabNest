"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentController = exports.CommentController = void 0;
const service_1 = require("./service");
const api_response_1 = require("../../utils/api-response");
class CommentController {
    async getByIssue(req, res) {
        const comments = await service_1.commentService.getByIssue(req.params.issueId);
        (0, api_response_1.sendSuccess)(res, comments);
    }
    async create(req, res) {
        const comment = await service_1.commentService.create(req.user.id, req.body.issueId, req.body.content);
        (0, api_response_1.sendSuccess)(res, comment, 201);
    }
    async update(req, res) {
        const comment = await service_1.commentService.update(req.params.id, req.user.id, req.user.role, req.body.content);
        (0, api_response_1.sendSuccess)(res, comment);
    }
    async delete(req, res) {
        await service_1.commentService.delete(req.params.id, req.user.id, req.user.role);
        (0, api_response_1.sendSuccess)(res, { message: 'Comment deleted successfully' });
    }
}
exports.CommentController = CommentController;
exports.commentController = new CommentController();
