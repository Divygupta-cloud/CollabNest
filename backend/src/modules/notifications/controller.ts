import { Request, Response } from 'express';
import { notificationService } from './service';
import { sendSuccess } from '../../utils/api-response';

export class NotificationController {
  async getMine(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
    const notifications = await notificationService.getUserNotifications(req.user!.id, limit);
    const unreadCount = await notificationService.getUnreadCount(req.user!.id);
    sendSuccess(res, { notifications, unreadCount });
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    const notification = await notificationService.markAsRead(req.params.id as string, req.user!.id);
    sendSuccess(res, notification);
  }


  async markAllAsRead(req: Request, res: Response): Promise<void> {
    await notificationService.markAllAsRead(req.user!.id);
    sendSuccess(res, { message: 'All notifications marked as read' });
  }
}

export const notificationController = new NotificationController();
