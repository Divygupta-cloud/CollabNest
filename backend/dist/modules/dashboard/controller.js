"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = exports.DashboardController = void 0;
const service_1 = require("./service");
const api_response_1 = require("../../utils/api-response");
class DashboardController {
    async getMetrics(req, res) {
        const dashboardData = await service_1.dashboardService.getDashboardForUser({
            id: req.user.id,
            role: req.user.role,
        });
        (0, api_response_1.sendSuccess)(res, dashboardData);
    }
}
exports.DashboardController = DashboardController;
exports.dashboardController = new DashboardController();
