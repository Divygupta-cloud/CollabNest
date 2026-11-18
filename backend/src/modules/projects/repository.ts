import { ProjectModel, IProject } from './model';

export class ProjectRepository {
  async findAll(filter: Record<string, any> = {}): Promise<IProject[]> {
    return ProjectModel.find(filter)
      .populate('leadId', 'name username email avatarUrl role title')
      .populate('teamId', 'name department')
      .sort({ name: 1 });
  }

  async findById(id: string): Promise<IProject | null> {
    return ProjectModel.findById(id)
      .populate('leadId', 'name username email avatarUrl role title')
      .populate('teamId', 'name department');
  }

  async findByKey(key: string): Promise<IProject | null> {
    return ProjectModel.findOne({ key: key.toUpperCase() })
      .populate('leadId', 'name username email avatarUrl role title')
      .populate('teamId', 'name department');
  }

  async create(data: Partial<IProject>): Promise<IProject> {
    return ProjectModel.create(data);
  }

  async update(id: string, updates: Partial<IProject>): Promise<IProject | null> {
    return ProjectModel.findByIdAndUpdate(id, updates, { new: true })
      .populate('leadId', 'name username email avatarUrl role title')
      .populate('teamId', 'name department');
  }

  async delete(id: string): Promise<IProject | null> {
    return ProjectModel.findByIdAndDelete(id);
  }

  // Atomic counter increment for collision-safe issue key generation
  async getNextIssueNumber(projectId: string): Promise<number> {
    const updated = await ProjectModel.findByIdAndUpdate(
      projectId,
      { $inc: { nextIssueNumber: 1 } },
      { new: true }
    );
    return updated ? updated.nextIssueNumber - 1 : 101;
  }
}

export const projectRepository = new ProjectRepository();
