"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const model_1 = require("./model");
class NotificationService {
    async getUserNotifications(userId, limit = 30) {
        return model_1.NotificationModel.find({ recipientId: userId })
            .sort({ createdAt: -1 })
            .limit(limit);
    }
    async getUnreadCount(userId) {
        return model_1.NotificationModel.countDocuments({ recipientId: userId, isRead: false });
    }
    async markAsRead(notificationId, userId) {
        return model_1.NotificationModel.findOneAndUpdate({ _id: notificationId, recipientId: userId }, { isRead: true }, { new: true });
    }
    async markAllAsRead(userId) {
        await model_1.NotificationModel.updateMany({ recipientId: userId, isRead: false }, { isRead: true });
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
