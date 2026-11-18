"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const routes_1 = require("../modules/auth/routes");
const routes_2 = require("../modules/users/routes");
const routes_3 = require("../modules/teams/routes");
const routes_4 = require("../modules/projects/routes");
const routes_5 = require("../modules/sprints/routes");
const routes_6 = require("../modules/issues/routes");
const routes_7 = require("../modules/comments/routes");
const routes_8 = require("../modules/activity/routes");
const routes_9 = require("../modules/notifications/routes");
const routes_10 = require("../modules/dashboard/routes");
const router = (0, express_1.Router)();
// Health check endpoint
router.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'TaskFlow API',
    });
});
router.use('/auth', routes_1.authRoutes);
router.use('/users', routes_2.userRoutes);
router.use('/teams', routes_3.teamRoutes);
router.use('/projects', routes_4.projectRoutes);
router.use('/sprints', routes_5.sprintRoutes);
router.use('/issues', routes_6.issueRoutes);
router.use('/comments', routes_7.commentRoutes);
router.use('/activity', routes_8.activityRoutes);
router.use('/notifications', routes_9.notificationRoutes);
router.use('/dashboard', routes_10.dashboardRoutes);
exports.apiRouter = router;
