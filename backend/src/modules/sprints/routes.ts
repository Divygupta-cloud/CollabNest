import { Router } from 'express';
import { sprintController } from './controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createSprintSchema,
  updateSprintSchema,
  startSprintSchema,
  completeSprintSchema,
} from './schema';

const router = Router();

router.use(authenticate);

router.get('/project/:projectId', (req, res, next) =>
  sprintController.getByProject(req, res).catch(next)
);
router.get('/:id', (req, res, next) => sprintController.getById(req, res).catch(next));

router.post(
  '/',
  requireRole(['ADMIN', 'MANAGER', 'TEAM_LEADER']),
  validate(createSprintSchema),
  (req, res, next) => sprintController.create(req, res).catch(next)
);

router.put(
  '/:id',
  requireRole(['ADMIN', 'MANAGER', 'TEAM_LEADER']),
  validate(updateSprintSchema),
  (req, res, next) => sprintController.update(req, res).catch(next)
);

router.post(
  '/:id/start',
  requireRole(['ADMIN', 'MANAGER', 'TEAM_LEADER']),
  validate(startSprintSchema),
  (req, res, next) => sprintController.start(req, res).catch(next)
);

router.post(
  '/:id/complete',
  requireRole(['ADMIN', 'MANAGER', 'TEAM_LEADER']),
  validate(completeSprintSchema),
  (req, res, next) => sprintController.complete(req, res).catch(next)
);

router.post(
  '/:id/issues',
  requireRole(['ADMIN', 'MANAGER', 'TEAM_LEADER']),
  (req, res, next) => sprintController.addIssues(req, res).catch(next)
);

router.delete(
  '/:id/issues',
  requireRole(['ADMIN', 'MANAGER', 'TEAM_LEADER']),
  (req, res, next) => sprintController.removeIssues(req, res).catch(next)
);

router.delete(
  '/:id',
  requireRole(['ADMIN', 'MANAGER']),
  (req, res, next) => sprintController.delete(req, res).catch(next)
);

export const sprintRoutes = router;
