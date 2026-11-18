import { Router } from 'express';
import { dashboardController } from './controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => dashboardController.getMetrics(req, res).catch(next));

export const dashboardRoutes = router;
