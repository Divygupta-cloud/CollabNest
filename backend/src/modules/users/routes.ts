import { Router } from 'express';
import { userController } from './controller';
import { createUserSchema, updateUserSchema, updateStatusSchema, resetPasswordSchema } from './schema';
import { validateRequest } from '../../middleware/validate.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', userController.listUsers);
router.post('/', requireRole('ADMIN', 'MANAGER'), validateRequest({ body: createUserSchema }), userController.createUser);

router.get('/:id', userController.getUserById);
router.patch('/:id', requireRole('ADMIN', 'MANAGER'), validateRequest({ body: updateUserSchema }), userController.updateUser);
router.delete('/:id', requireRole('ADMIN'), userController.deleteUser);

router.patch('/:id/status', requireRole('ADMIN', 'MANAGER'), validateRequest({ body: updateStatusSchema }), userController.updateStatus);
router.post('/:id/reset-password', requireRole('ADMIN', 'MANAGER'), validateRequest({ body: resetPasswordSchema }), userController.resetPassword);

export const userRoutes = router;
