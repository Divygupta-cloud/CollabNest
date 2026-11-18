import { SprintModel, ISprint } from './model';

export class SprintRepository {
  async findByProjectId(projectId: string): Promise<ISprint[]> {
    return SprintModel.find({ projectId })
      .populate({
        path: 'issueIds',
        populate: [
          { path: 'assigneeId', select: 'name username avatarUrl role' },
          { path: 'reporterId', select: 'name username avatarUrl role' },
        ],
      })
      .sort({ createdAt: 1 });
  }

  async findById(id: string): Promise<ISprint | null> {
    return SprintModel.findById(id).populate({
      path: 'issueIds',
      populate: [
        { path: 'assigneeId', select: 'name username avatarUrl role' },
        { path: 'reporterId', select: 'name username avatarUrl role' },
      ],
    });
  }

  async findActiveSprint(projectId: string): Promise<ISprint | null> {
    return SprintModel.findOne({ projectId, status: 'ACTIVE' });
  }

  async create(data: Partial<ISprint>): Promise<ISprint> {
    return SprintModel.create(data);
  }

  async update(id: string, updates: any): Promise<ISprint | null> {
    return SprintModel.findByIdAndUpdate(id, updates, { new: true }).populate({
      path: 'issueIds',
      populate: [
        { path: 'assigneeId', select: 'name username avatarUrl role' },
        { path: 'reporterId', select: 'name username avatarUrl role' },
      ],
    });
  }

  async delete(id: string): Promise<ISprint | null> {
    return SprintModel.findByIdAndDelete(id);
  }
}

export const sprintRepository = new SprintRepository();
