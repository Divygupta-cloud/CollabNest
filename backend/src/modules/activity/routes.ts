import { Router } from 'express';
import { activityController } from './controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/recent', (req, res, next) => activityController.getRecent(req, res).catch(next));
router.get('/:entityType/:entityId', (req, res, next) =>
  activityController.getByEntity(req, res).catch(next)
);

export const activityRoutes = router;
