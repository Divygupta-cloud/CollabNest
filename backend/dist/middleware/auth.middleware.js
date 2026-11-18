"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const model_1 = require("../modules/users/model");
async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.UnauthorizedError('Authentication token is required');
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new errors_1.UnauthorizedError('Authentication token is malformed');
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        // Verify user exists and is active
        const user = await model_1.UserModel.findById(decoded.id).select('name username email role teamIds isActive');
        if (!user) {
            throw new errors_1.UnauthorizedError('Authenticated user no longer exists');
        }
        if (!user.isActive) {
            throw new errors_1.UnauthorizedError('User account is deactivated');
        }
        req.user = {
            id: user._id.toString(),
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            teamIds: (user.teamIds || []).map((t) => t.toString()),
        };
        next();
    }
    catch (err) {
        next(err);
    }
}
exports.authenticate = requireAuth;
