import { Router } from 'express';
import { authController } from './controller';
import { loginSchema } from './schema';
import { validateRequest } from '../../middleware/validate.middleware';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.post('/login', validateRequest({ body: loginSchema }), authController.login);
router.get('/me', requireAuth, authController.getMe);

export const authRoutes = router;
