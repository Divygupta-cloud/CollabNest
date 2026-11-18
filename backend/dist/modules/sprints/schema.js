"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeSprintSchema = exports.startSprintSchema = exports.updateSprintSchema = exports.createSprintSchema = void 0;
const zod_1 = require("zod");
exports.createSprintSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'Project ID is required'),
    name: zod_1.z.string().min(2, 'Sprint name must be at least 2 characters'),
    goal: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
exports.updateSprintSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    goal: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional().nullable(),
    endDate: zod_1.z.string().datetime().optional().nullable(),
    status: zod_1.z.enum(['FUTURE', 'ACTIVE', 'COMPLETED']).optional(),
    issueIds: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.startSprintSchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    goal: zod_1.z.string().optional(),
});
exports.completeSprintSchema = zod_1.z.object({
    targetSprintId: zod_1.z.string().optional().nullable(), // If null, incomplete issues go to backlog
});
