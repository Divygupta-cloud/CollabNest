import bcrypt from 'bcrypt';
import { userRepository } from './repository';
import { ActivityModel } from '../activity/model';
import { ConflictError, NotFoundError, BadRequestError } from '../../utils/errors';
import { PaginationOptions } from '../../utils/pagination';

export class UserService {
  async listUsers(query: Record<string, any>, pagination: PaginationOptions) {
    const filter: Record<string, any> = {};

    if (query.role) filter.role = query.role;
    if (query.teamId) filter.teamIds = query.teamId;
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [{ name: searchRegex }, { username: searchRegex }, { email: searchRegex }, { title: searchRegex }];
    }

    return userRepository.findAll(filter, pagination);
  }

  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async createUser(input: any, actorId: string) {
    const existing = await userRepository.findByUsernameOrEmail(input.username, input.email);
    if (existing) {
      if (existing.username === input.username.toLowerCase()) {
        throw new ConflictError('Username is already in use');
      }
      throw new ConflictError('Email is already in use');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    const user = await userRepository.create({
      name: input.name,
      username: input.username.toLowerCase().trim(),
      email: input.email.toLowerCase().trim(),
      passwordHash,
      role: input.role || 'EMPLOYEE',
      teamIds: input.teamIds || [],
      title: input.title || 'Software Engineer',
      department: input.department || 'Engineering',
      avatarUrl:
        input.avatarUrl ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      isActive: true,
    });

    await ActivityModel.create({
      actorId,
      entityType: 'USER',
      entityId: user._id.toString(),
      action: 'USER_CREATED',
      newValue: user.username,
      metadata: { role: user.role, name: user.name },
    });

    return user;
  }

  async updateUser(id: string, updates: any, actorId: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('User not found');

    if (updates.email && updates.email !== user.email) {
      const existing = await userRepository.findByUsernameOrEmail('', updates.email);
      if (existing && existing._id.toString() !== id) {
        throw new ConflictError('Email already in use');
      }
    }

    const updated = await userRepository.update(id, updates);
    return updated;
  }

  async updateStatus(id: string, isActive: boolean, actorId: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('User not found');

    const updated = await userRepository.update(id, { isActive });

    await ActivityModel.create({
      actorId,
      entityType: 'USER',
      entityId: id,
      action: 'STATUS_CHANGED',
      oldValue: user.isActive ? 'ACTIVE' : 'INACTIVE',
      newValue: isActive ? 'ACTIVE' : 'INACTIVE',
    });

    return updated;
  }

  async resetPassword(id: string, newPassword: string, actorId: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('User not found');

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await userRepository.update(id, { passwordHash } as any);

    await ActivityModel.create({
      actorId,
      entityType: 'USER',
      entityId: id,
      action: 'PASSWORD_RESET',
      metadata: { targetUser: user.username },
    });

    return { message: 'Password reset successfully' };
  }

  async deleteUser(id: string, actorId: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('User not found');

    // Soft-deactivate user instead of wiping audit trails
    return this.updateStatus(id, false, actorId);
  }
}

export const userService = new UserService();
