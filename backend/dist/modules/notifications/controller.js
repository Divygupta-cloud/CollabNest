"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = void 0;
const service_1 = require("./service");
const api_response_1 = require("../../utils/api-response");
class NotificationController {
    async getMine(req, res) {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 30;
        const notifications = await service_1.notificationService.getUserNotifications(req.user.id, limit);
        const unreadCount = await service_1.notificationService.getUnreadCount(req.user.id);
        (0, api_response_1.sendSuccess)(res, { notifications, unreadCount });
    }
    async markAsRead(req, res) {
        const notification = await service_1.notificationService.markAsRead(req.params.id, req.user.id);
        (0, api_response_1.sendSuccess)(res, notification);
    }
    async markAllAsRead(req, res) {
        await service_1.notificationService.markAllAsRead(req.user.id);
        (0, api_response_1.sendSuccess)(res, { message: 'All notifications marked as read' });
    }
}
exports.NotificationController = NotificationController;
exports.notificationController = new NotificationController();
