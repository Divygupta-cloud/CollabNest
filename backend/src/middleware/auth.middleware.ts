import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/errors';
import { AuthUserPayload } from '../types/express';
import { UserModel } from '../modules/users/model';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token is required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Authentication token is malformed');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;

    // Verify user exists and is active
    const user = await UserModel.findById(decoded.id).select('name username email role teamIds isActive');
    if (!user) {
      throw new UnauthorizedError('Authenticated user no longer exists');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('User account is deactivated');
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      teamIds: (user.teamIds || []).map((t) => t.toString()),
    };

    next();
  } catch (err) {
    next(err);
  }
}

export const authenticate = requireAuth;

