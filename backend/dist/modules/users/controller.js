"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const service_1 = require("./service");
const api_response_1 = require("../../utils/api-response");
const pagination_1 = require("../../utils/pagination");
class UserController {
    async listUsers(req, res, next) {
        try {
            const pagination = (0, pagination_1.getPaginationOptions)(req.query, 'name');
            const { users, total } = await service_1.userService.listUsers(req.query, pagination);
            return (0, api_response_1.sendSuccess)(res, users, 200, {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit),
            });
        }
        catch (err) {
            next(err);
        }
    }
    async getUserById(req, res, next) {
        try {
            const user = await service_1.userService.getUserById(req.params.id);
            return (0, api_response_1.sendSuccess)(res, user, 200);
        }
        catch (err) {
            next(err);
        }
    }
    async createUser(req, res, next) {
        try {
            const user = await service_1.userService.createUser(req.body, req.user.id);
            return (0, api_response_1.sendSuccess)(res, user, 201);
        }
        catch (err) {
            next(err);
        }
    }
    async updateUser(req, res, next) {
        try {
            const user = await service_1.userService.updateUser(req.params.id, req.body, req.user.id);
            return (0, api_response_1.sendSuccess)(res, user, 200);
        }
        catch (err) {
            next(err);
        }
    }
    async updateStatus(req, res, next) {
        try {
            const user = await service_1.userService.updateStatus(req.params.id, req.body.isActive, req.user.id);
            return (0, api_response_1.sendSuccess)(res, user, 200);
        }
        catch (err) {
            next(err);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const result = await service_1.userService.resetPassword(req.params.id, req.body.newPassword, req.user.id);
            return (0, api_response_1.sendSuccess)(res, result, 200);
        }
        catch (err) {
            next(err);
        }
    }
    async deleteUser(req, res, next) {
        try {
            const result = await service_1.userService.deleteUser(req.params.id, req.user.id);
            return (0, api_response_1.sendSuccess)(res, result, 200);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
