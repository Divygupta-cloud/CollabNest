"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SprintModel = void 0;
const mongoose_1 = require("mongoose");
const sprintSchema = new mongoose_1.Schema({
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    name: { type: String, required: true, trim: true },
    goal: { type: String, default: '' },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
        type: String,
        enum: ['FUTURE', 'ACTIVE', 'COMPLETED'],
        default: 'FUTURE',
        index: true,
    },
    issueIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Issue' }],
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
exports.SprintModel = (0, mongoose_1.model)('Sprint', sprintSchema);
