"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommentSchema = exports.createCommentSchema = void 0;
const zod_1 = require("zod");
exports.createCommentSchema = zod_1.z.object({
    issueId: zod_1.z.string().min(1, 'Issue ID is required'),
    content: zod_1.z.string().min(1, 'Comment content cannot be empty'),
});
exports.updateCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Comment content cannot be empty'),
});
