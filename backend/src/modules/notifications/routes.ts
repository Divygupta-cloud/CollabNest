import { Router } from 'express';
import { notificationController } from './controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => notificationController.getMine(req, res).catch(next));
router.patch('/:id/read', (req, res, next) =>
  notificationController.markAsRead(req, res).catch(next)
);
router.post('/read-all', (req, res, next) =>
  notificationController.markAllAsRead(req, res).catch(next)
);

export const notificationRoutes = router;
