import { Request, Response } from 'express';
import { activityService } from './service';
import { sendSuccess } from '../../utils/api-response';

export class ActivityController {
  async getByEntity(req: Request, res: Response): Promise<void> {
    const entityType = req.params.entityType as string;
    const entityId = req.params.entityId as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const activities = await activityService.getByEntity(entityType.toUpperCase(), entityId, limit);
    sendSuccess(res, activities);

  }

  async getRecent(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const activities = await activityService.getRecent(limit);
    sendSuccess(res, activities);
  }
}

export const activityController = new ActivityController();
