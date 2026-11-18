"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityService = exports.ActivityService = void 0;
const model_1 = require("./model");
class ActivityService {
    async getByEntity(entityType, entityId, limit = 50) {
        return model_1.ActivityModel.find({ entityType, entityId })
            .populate('actorId', 'name username email avatarUrl role title')
            .sort({ createdAt: -1 })
            .limit(limit);
    }
    async getRecent(limit = 20) {
        return model_1.ActivityModel.find()
            .populate('actorId', 'name username email avatarUrl role title')
            .sort({ createdAt: -1 })
            .limit(limit);
    }
}
exports.ActivityService = ActivityService;
exports.activityService = new ActivityService();
