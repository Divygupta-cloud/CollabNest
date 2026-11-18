"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueModel = void 0;
const mongoose_1 = require("mongoose");
const subtaskSchema = new mongoose_1.Schema({
    key: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    assigneeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
}, { _id: true });
const issueSchema = new mongoose_1.Schema({
    issueKey: { type: String, required: true, unique: true, index: true },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    parentIssueId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Issue' },
    sprintId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Sprint', default: null, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    issueType: {
        type: String,
        enum: ['EPIC', 'STORY', 'TASK', 'BUG', 'SUBTASK'],
        default: 'STORY',
        index: true,
    },
    status: {
        type: String,
        enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'],
        default: 'TODO',
        index: true,
    },
    priority: {
        type: String,
        enum: ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'],
        default: 'MEDIUM',
        index: true,
    },
    reporterId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assigneeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', index: true },
    assigneeIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    teamId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Team', index: true },
    storyPoints: { type: Number },
    labels: [{ type: String, trim: true, lowercase: true }],
    subtasks: [subtaskSchema],
    rank: { type: Number, default: 0, index: true },
    aiCategory: {
        type: String,
        enum: ['Bug', 'feature', 'docuementation', 'Refactor', 'others', 'BUG', 'FEATURE', 'IMPROVEMENT', 'DOCUMENTATION', 'TASK', 'OTHER'],
        index: true,
    },
    aiConfidence: { type: Number },
    aiReason: { type: String },
    aiStatus: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
        default: 'PENDING',
        index: true,
    },
    finalCategory: {
        type: String,
        enum: ['Bug', 'feature', 'docuementation', 'Refactor', 'others', 'BUG', 'FEATURE', 'IMPROVEMENT', 'DOCUMENTATION', 'TASK', 'OTHER'],
        index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            ret.id = ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
// Compound text index for search
issueSchema.index({ title: 'text', description: 'text', issueKey: 'text' });
exports.IssueModel = (0, mongoose_1.model)('Issue', issueSchema);
