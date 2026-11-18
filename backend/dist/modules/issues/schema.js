"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overrideCategorySchema = exports.updateStatusSchema = exports.updateIssueSchema = exports.createIssueSchema = void 0;
const zod_1 = require("zod");
exports.createIssueSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'Project ID is required'),
    title: zod_1.z.string().min(2, 'Title must be at least 2 characters'),
    description: zod_1.z.string().optional().default(''),
    issueType: zod_1.z.enum(['EPIC', 'STORY', 'TASK', 'BUG', 'SUBTASK']).default('STORY'),
    status: zod_1.z
        .enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'])
        .default('TODO'),
    priority: zod_1.z.enum(['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST']).default('MEDIUM'),
    assigneeId: zod_1.z.string().optional().nullable(),
    assigneeIds: zod_1.z.array(zod_1.z.string()).optional(),
    sprintId: zod_1.z.string().optional().nullable(),
    teamId: zod_1.z.string().optional().nullable(),
    parentIssueId: zod_1.z.string().optional().nullable(),
    storyPoints: zod_1.z.number().min(0).optional(),
    labels: zod_1.z.array(zod_1.z.string()).optional().default([]),
    rank: zod_1.z.number().optional(),
});
exports.updateIssueSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).optional(),
    description: zod_1.z.string().optional(),
    issueType: zod_1.z.enum(['EPIC', 'STORY', 'TASK', 'BUG', 'SUBTASK']).optional(),
    status: zod_1.z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']).optional(),
    priority: zod_1.z.enum(['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST']).optional(),
    assigneeId: zod_1.z.string().optional().nullable(),
    assigneeIds: zod_1.z.array(zod_1.z.string()).optional(),
    sprintId: zod_1.z.string().optional().nullable(),
    teamId: zod_1.z.string().optional().nullable(),
    parentIssueId: zod_1.z.string().optional().nullable(),
    storyPoints: zod_1.z.number().min(0).optional().nullable(),
    labels: zod_1.z.array(zod_1.z.string()).optional(),
    rank: zod_1.z.number().optional(),
    finalCategory: zod_1.z
        .enum(['Bug', 'feature', 'docuementation', 'Refactor', 'others', 'BUG', 'FEATURE', 'IMPROVEMENT', 'DOCUMENTATION', 'TASK', 'OTHER'])
        .optional(),
    subtasks: zod_1.z
        .array(zod_1.z.object({
        key: zod_1.z.string(),
        title: zod_1.z.string(),
        completed: zod_1.z.boolean().default(false),
        assigneeId: zod_1.z.string().optional().nullable(),
    }))
        .optional(),
});
exports.updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']),
    rank: zod_1.z.number().optional(),
    sprintId: zod_1.z.string().optional().nullable(),
});
exports.overrideCategorySchema = zod_1.z.object({
    category: zod_1.z.enum(['Bug', 'feature', 'docuementation', 'Refactor', 'others', 'BUG', 'FEATURE', 'IMPROVEMENT', 'DOCUMENTATION', 'TASK', 'OTHER']),
});
