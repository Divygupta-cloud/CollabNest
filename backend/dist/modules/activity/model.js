"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityModel = void 0;
const mongoose_1 = require("mongoose");
const activitySchema = new mongoose_1.Schema({
    actorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    entityType: {
        type: String,
        enum: ['ISSUE', 'PROJECT', 'TEAM', 'USER', 'COMMENT', 'SPRINT'],
        required: true,
        index: true,
    },
    entityId: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    oldValue: { type: String },
    newValue: { type: String },
    metadata: { type: mongoose_1.Schema.Types.Mixed },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
        transform(_doc, ret) {
            ret.id = ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
exports.ActivityModel = (0, mongoose_1.model)('Activity', activitySchema);
