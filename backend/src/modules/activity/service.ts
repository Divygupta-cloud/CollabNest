import { ActivityModel, IActivity } from './model';

export class ActivityService {
  async getByEntity(entityType: string, entityId: string, limit = 50): Promise<IActivity[]> {
    return ActivityModel.find({ entityType, entityId })
      .populate('actorId', 'name username email avatarUrl role title')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getRecent(limit = 20): Promise<IActivity[]> {
    return ActivityModel.find()
      .populate('actorId', 'name username email avatarUrl role title')
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

export const activityService = new ActivityService();
