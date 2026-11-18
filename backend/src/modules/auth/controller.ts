import { Request, Response, NextFunction } from 'express';
import { authService } from './service';
import { sendSuccess } from '../../utils/api-response';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getCurrentUser(req.user!.id);
      return sendSuccess(res, user, 200);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
