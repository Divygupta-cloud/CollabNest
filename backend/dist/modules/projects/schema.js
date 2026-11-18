"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
exports.createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Project name must be at least 2 characters'),
    key: zod_1.z
        .string()
        .min(2, 'Key must be at least 2 characters')
        .max(10, 'Key must be at most 10 characters')
        .regex(/^[a-zA-Z0-9]{2,10}$/, 'Key must be 2-10 alphanumeric characters')
        .transform((val) => val.toUpperCase()),
    description: zod_1.z.string().optional(),
    leadId: zod_1.z.string().min(1, 'Lead ID is required'),
    teamId: zod_1.z.string().optional(),
    category: zod_1.z.enum(['SOFTWARE', 'OPERATIONS', 'MARKETING', 'BUSINESS']).default('SOFTWARE'),
    iconBgColor: zod_1.z.string().optional(),
});
exports.updateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    description: zod_1.z.string().optional(),
    leadId: zod_1.z.string().optional(),
    teamId: zod_1.z.string().optional(),
    category: zod_1.z.enum(['SOFTWARE', 'OPERATIONS', 'MARKETING', 'BUSINESS']).optional(),
    status: zod_1.z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']).optional(),
    iconBgColor: zod_1.z.string().optional(),
    isStarred: zod_1.z.boolean().optional(),
});
