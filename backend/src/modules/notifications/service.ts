import { NotificationModel, INotification } from './model';

export class NotificationService {
  async getUserNotifications(userId: string, limit = 30): Promise<INotification[]> {
    return NotificationModel.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return NotificationModel.countDocuments({ recipientId: userId, isRead: false });
  }

  async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    return NotificationModel.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await NotificationModel.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );
  }
}

export const notificationService = new NotificationService();
