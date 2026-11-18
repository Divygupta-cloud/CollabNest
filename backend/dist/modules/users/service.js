"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const repository_1 = require("./repository");
const model_1 = require("../activity/model");
const errors_1 = require("../../utils/errors");
class UserService {
    async listUsers(query, pagination) {
        const filter = {};
        if (query.role)
            filter.role = query.role;
        if (query.teamId)
            filter.teamIds = query.teamId;
        if (query.isActive !== undefined)
            filter.isActive = query.isActive === 'true';
        if (query.search) {
            const searchRegex = new RegExp(query.search, 'i');
            filter.$or = [{ name: searchRegex }, { username: searchRegex }, { email: searchRegex }, { title: searchRegex }];
        }
        return repository_1.userRepository.findAll(filter, pagination);
    }
    async getUserById(id) {
        const user = await repository_1.userRepository.findById(id);
        if (!user)
            throw new errors_1.NotFoundError('User not found');
        return user;
    }
    async createUser(input, actorId) {
        const existing = await repository_1.userRepository.findByUsernameOrEmail(input.username, input.email);
        if (existing) {
            if (existing.username === input.username.toLowerCase()) {
                throw new errors_1.ConflictError('Username is already in use');
            }
            throw new errors_1.ConflictError('Email is already in use');
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt_1.default.hash(input.password, saltRounds);
        const user = await repository_1.userRepository.create({
            name: input.name,
            username: input.username.toLowerCase().trim(),
            email: input.email.toLowerCase().trim(),
            passwordHash,
            role: input.role || 'EMPLOYEE',
            teamIds: input.teamIds || [],
            title: input.title || 'Software Engineer',
            department: input.department || 'Engineering',
            avatarUrl: input.avatarUrl ||
                `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
            isActive: true,
        });
        await model_1.ActivityModel.create({
            actorId,
            entityType: 'USER',
            entityId: user._id.toString(),
            action: 'USER_CREATED',
            newValue: user.username,
            metadata: { role: user.role, name: user.name },
        });
        return user;
    }
    async updateUser(id, updates, actorId) {
        const user = await repository_1.userRepository.findById(id);
        if (!user)
            throw new errors_1.NotFoundError('User not found');
        if (updates.email && updates.email !== user.email) {
            const existing = await repository_1.userRepository.findByUsernameOrEmail('', updates.email);
            if (existing && existing._id.toString() !== id) {
                throw new errors_1.ConflictError('Email already in use');
            }
        }
        const updated = await repository_1.userRepository.update(id, updates);
        return updated;
    }
    async updateStatus(id, isActive, actorId) {
        const user = await repository_1.userRepository.findById(id);
        if (!user)
            throw new errors_1.NotFoundError('User not found');
        const updated = await repository_1.userRepository.update(id, { isActive });
        await model_1.ActivityModel.create({
            actorId,
            entityType: 'USER',
            entityId: id,
            action: 'STATUS_CHANGED',
            oldValue: user.isActive ? 'ACTIVE' : 'INACTIVE',
            newValue: isActive ? 'ACTIVE' : 'INACTIVE',
        });
        return updated;
    }
    async resetPassword(id, newPassword, actorId) {
        const user = await repository_1.userRepository.findById(id);
        if (!user)
            throw new errors_1.NotFoundError('User not found');
        const saltRounds = 10;
        const passwordHash = await bcrypt_1.default.hash(newPassword, saltRounds);
        await repository_1.userRepository.update(id, { passwordHash });
        await model_1.ActivityModel.create({
            actorId,
            entityType: 'USER',
            entityId: id,
            action: 'PASSWORD_RESET',
            metadata: { targetUser: user.username },
        });
        return { message: 'Password reset successfully' };
    }
    async deleteUser(id, actorId) {
        const user = await repository_1.userRepository.findById(id);
        if (!user)
            throw new errors_1.NotFoundError('User not found');
        // Soft-deactivate user instead of wiping audit trails
        return this.updateStatus(id, false, actorId);
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
