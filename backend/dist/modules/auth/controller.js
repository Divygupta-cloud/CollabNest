"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const service_1 = require("./service");
const api_response_1 = require("../../utils/api-response");
class AuthController {
    async login(req, res, next) {
        try {
            const result = await service_1.authService.login(req.body);
            return (0, api_response_1.sendSuccess)(res, result, 200);
        }
        catch (err) {
            next(err);
        }
    }
    async getMe(req, res, next) {
        try {
            const user = await service_1.authService.getCurrentUser(req.user.id);
            return (0, api_response_1.sendSuccess)(res, user, 200);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
