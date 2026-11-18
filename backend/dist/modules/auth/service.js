"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const model_1 = require("../users/model");
const env_1 = require("../../config/env");
const errors_1 = require("../../utils/errors");
class AuthService {
    async login(input) {
        const identifier = input.username.toLowerCase().trim();
        // Query user by username OR email, selecting passwordHash
        const user = await model_1.UserModel.findOne({
            $or: [{ username: identifier }, { email: identifier }],
        }).select('+passwordHash');
        if (!user) {
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        if (!user.isActive) {
            throw new errors_1.UnauthorizedError('Account has been deactivated. Please contact an administrator.');
        }
        const isMatch = await bcrypt_1.default.compare(input.password, user.passwordHash);
        if (!isMatch) {
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        const payload = {
            id: user._id.toString(),
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            teamIds: (user.teamIds || []).map((t) => t.toString()),
        };
        const token = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
            expiresIn: env_1.env.JWT_EXPIRES_IN,
        });
        const safeUser = user.toJSON();
        return {
            user: safeUser,
            token,
        };
    }
    async getCurrentUser(userId) {
        const user = await model_1.UserModel.findById(userId).populate('teamIds', 'name department');
        if (!user || !user.isActive) {
            throw new errors_1.UnauthorizedError('User session expired or user deactivated');
        }
        return user;
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
