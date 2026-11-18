"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityController = exports.ActivityController = void 0;
const service_1 = require("./service");
const api_response_1 = require("../../utils/api-response");
class ActivityController {
    async getByEntity(req, res) {
        const entityType = req.params.entityType;
        const entityId = req.params.entityId;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
        const activities = await service_1.activityService.getByEntity(entityType.toUpperCase(), entityId, limit);
        (0, api_response_1.sendSuccess)(res, activities);
    }
    async getRecent(req, res) {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
        const activities = await service_1.activityService.getRecent(limit);
        (0, api_response_1.sendSuccess)(res, activities);
    }
}
exports.ActivityController = ActivityController;
exports.activityController = new ActivityController();
