"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectModel = void 0;
const mongoose_1 = require("mongoose");
const projectSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    key: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        minlength: 2,
        maxlength: 10,
        match: /^[A-Z0-9]{2,10}$/,
        index: true,
    },
    description: { type: String, default: '' },
    leadId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    teamId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Team', index: true },
    category: {
        type: String,
        enum: ['SOFTWARE', 'OPERATIONS', 'MARKETING', 'BUSINESS'],
        default: 'SOFTWARE',
    },
    status: {
        type: String,
        enum: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'],
        default: 'ACTIVE',
    },
    iconBgColor: { type: String, default: '#0C66E4' },
    isStarred: { type: Boolean, default: false },
    nextIssueNumber: { type: Number, default: 101 },
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
exports.ProjectModel = (0, mongoose_1.model)('Project', projectSchema);
