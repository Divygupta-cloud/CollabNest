import { Request, Response, NextFunction } from 'express';
import { userService } from './service';
import { sendSuccess } from '../../utils/api-response';
import { getPaginationOptions } from '../../utils/pagination';

export class UserController {
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationOptions(req.query, 'name');
      const { users, total } = await userService.listUsers(req.query, pagination);
      return sendSuccess(res, users, 200, {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      });
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id as string);
      return sendSuccess(res, user, 200);
    } catch (err) {
      next(err);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body, req.user!.id);
      return sendSuccess(res, user, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateUser(req.params.id as string, req.body, req.user!.id);
      return sendSuccess(res, user, 200);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateStatus(req.params.id as string, req.body.isActive, req.user!.id);
      return sendSuccess(res, user, 200);
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.resetPassword(req.params.id as string, req.body.newPassword, req.user!.id);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.deleteUser(req.params.id as string, req.user!.id);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

}

export const userController = new UserController();
