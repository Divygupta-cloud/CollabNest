import { Router } from 'express';
import { projectController } from './controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createProjectSchema, updateProjectSchema } from './schema';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => projectController.getAll(req, res).catch(next));
router.get('/key/:key', (req, res, next) => projectController.getByKey(req, res).catch(next));
router.get('/:idOrKey/board', (req, res, next) => projectController.getBoard(req, res).catch(next));
router.get('/:id', (req, res, next) => projectController.getById(req, res).catch(next));

router.post(
  '/',
  requireRole(['ADMIN', 'MANAGER']),
  validate(createProjectSchema),
  (req, res, next) => projectController.create(req, res).catch(next)
);

router.put(
  '/:id',
  requireRole(['ADMIN', 'MANAGER', 'TEAM_LEADER']),
  validate(updateProjectSchema),
  (req, res, next) => projectController.update(req, res).catch(next)
);

router.delete(
  '/:id',
  requireRole(['ADMIN']),
  (req, res, next) => projectController.delete(req, res).catch(next)
);

export const projectRoutes = router;
