import { TeamModel, ITeam } from './model';

export class TeamRepository {
  async findAll(): Promise<ITeam[]> {
    return TeamModel.find()
      .populate('leaderId', 'name username email avatarUrl role title')
      .populate('memberIds', 'name username email avatarUrl role title department')
      .populate('projectIds', 'name key category iconBgColor');
  }

  async findById(id: string): Promise<ITeam | null> {
    return TeamModel.findById(id)
      .populate('leaderId', 'name username email avatarUrl role title')
      .populate('memberIds', 'name username email avatarUrl role title department')
      .populate('projectIds', 'name key category iconBgColor');
  }

  async create(data: Partial<ITeam>): Promise<ITeam> {
    return TeamModel.create(data);
  }

  async update(id: string, updates: Partial<ITeam>): Promise<ITeam | null> {
    return TeamModel.findByIdAndUpdate(id, updates, { new: true })
      .populate('leaderId', 'name username email avatarUrl role title')
      .populate('memberIds', 'name username email avatarUrl role title department')
      .populate('projectIds', 'name key category iconBgColor');
  }

  async delete(id: string): Promise<ITeam | null> {
    return TeamModel.findByIdAndDelete(id);
  }
}

export const teamRepository = new TeamRepository();
