"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    recipientId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
        type: String,
        enum: [
            'ISSUE_ASSIGNED',
            'ISSUE_STATUS_CHANGED',
            'COMMENT_ADDED',
            'MENTION',
            'TEAM_ASSIGNED',
            'TEAM_LEADER_ASSIGNED',
        ],
        required: true,
        index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    entityType: { type: String },
    entityId: { type: String },
    link: { type: String },
    isRead: { type: Boolean, default: false, index: true },
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
exports.NotificationModel = (0, mongoose_1.model)('Notification', notificationSchema);
