import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../users/model';
import { env } from '../../config/env';
import { UnauthorizedError } from '../../utils/errors';
import { LoginInput } from './schema';

export class AuthService {
  async login(input: LoginInput) {
    const identifier = input.username.toLowerCase().trim();

    // Query user by username OR email, selecting passwordHash
    const user = await UserModel.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    }).select('+passwordHash');

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated. Please contact an administrator.');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const payload = {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      teamIds: (user.teamIds || []).map((t) => t.toString()),
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    const safeUser = user.toJSON();

    return {
      user: safeUser,
      token,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await UserModel.findById(userId).populate('teamIds', 'name department');
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User session expired or user deactivated');
    }
    return user;
  }
}

export const authService = new AuthService();
