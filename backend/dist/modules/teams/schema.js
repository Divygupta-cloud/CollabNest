"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMemberSchema = exports.assignLeaderSchema = exports.updateTeamSchema = exports.createTeamSchema = void 0;
const zod_1 = require("zod");
exports.createTeamSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Team name must be at least 2 characters'),
    description: zod_1.z.string().optional(),
    leaderId: zod_1.z.string().min(1, 'Leader ID is required'),
    department: zod_1.z.string().optional(),
    memberIds: zod_1.z.array(zod_1.z.string()).optional(),
    projectIds: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.updateTeamSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    description: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    projectIds: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.assignLeaderSchema = zod_1.z.object({
    leaderId: zod_1.z.string().min(1, 'Leader ID is required'),
});
exports.addMemberSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
});
