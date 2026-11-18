"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.updateStatusSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    username: zod_1.z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .regex(/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, dots, dashes, and underscores'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    role: zod_1.z.enum(['ADMIN', 'MANAGER', 'TEAM_LEADER', 'TEAM_LEAD', 'DEVELOPER', 'QA', 'EMPLOYEE']).default('EMPLOYEE'),
    teamIds: zod_1.z.array(zod_1.z.string()).optional(),
    title: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    avatarUrl: zod_1.z.string().optional(),
});
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    email: zod_1.z.string().email().optional(),
    role: zod_1.z.enum(['ADMIN', 'MANAGER', 'TEAM_LEADER', 'TEAM_LEAD', 'DEVELOPER', 'QA', 'EMPLOYEE']).optional(),
    teamIds: zod_1.z.array(zod_1.z.string()).optional(),
    title: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    avatarUrl: zod_1.z.string().optional(),
});
exports.updateStatusSchema = zod_1.z.object({
    isActive: zod_1.z.boolean(),
});
exports.resetPasswordSchema = zod_1.z.object({
    newPassword: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
