import { UserModel, IUser } from './model';
import { PaginationOptions } from '../../utils/pagination';

export class UserRepository {
  async findAll(filter: Record<string, any>, pagination: PaginationOptions): Promise<{ users: IUser[]; total: number }> {
    const [users, total] = await Promise.all([
      UserModel.find(filter)
        .populate('teamIds', 'name department')
        .sort({ [pagination.sortBy]: pagination.order === 'asc' ? 1 : -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      UserModel.countDocuments(filter),
    ]);
    return { users, total };
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).populate('teamIds', 'name department');
  }

  async findByUsernameOrEmail(username: string, email: string): Promise<IUser | null> {
    return UserModel.findOne({
      $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
    });
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    return UserModel.create(data);
  }

  async update(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, updates, { new: true }).populate('teamIds', 'name department');
  }

  async delete(id: string): Promise<IUser | null> {
    return UserModel.findByIdAndDelete(id);
  }
}

export const userRepository = new UserRepository();
