import { Router } from 'express';
import { authRoutes } from '../modules/auth/routes';
import { userRoutes } from '../modules/users/routes';
import { teamRoutes } from '../modules/teams/routes';
import { projectRoutes } from '../modules/projects/routes';
import { sprintRoutes } from '../modules/sprints/routes';
import { issueRoutes } from '../modules/issues/routes';
import { commentRoutes } from '../modules/comments/routes';
import { activityRoutes } from '../modules/activity/routes';
import { notificationRoutes } from '../modules/notifications/routes';
import { dashboardRoutes } from '../modules/dashboard/routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TaskFlow API',
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/teams', teamRoutes);
router.use('/projects', projectRoutes);
router.use('/sprints', sprintRoutes);
router.use('/issues', issueRoutes);
router.use('/comments', commentRoutes);
router.use('/activity', activityRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);

export const apiRouter = router;
