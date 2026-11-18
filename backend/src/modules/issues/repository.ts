import { IssueModel, IIssue } from './model';
import { PaginationOptions } from '../../utils/pagination';

export interface IssueFilter {
  projectId?: string;
  sprintId?: string | null;
  assigneeId?: string;
  reporterId?: string;
  teamId?: string;
  issueType?: string;
  status?: string | { $in: string[] };
  priority?: string;
  aiCategory?: string;
  finalCategory?: string;
  search?: string;
  isDeleted?: boolean;
}

export class IssueRepository {
  async findAll(filter: IssueFilter = {}, pagination?: PaginationOptions): Promise<{ issues: IIssue[]; total: number }> {
    const query: Record<string, any> = {
      isDeleted: filter.isDeleted ?? false,
    };

    if (filter.projectId) query.projectId = filter.projectId;
    if (filter.sprintId !== undefined) query.sprintId = filter.sprintId;
    if (filter.assigneeId) query.assigneeId = filter.assigneeId;
    if (filter.reporterId) query.reporterId = filter.reporterId;
    if (filter.teamId) query.teamId = filter.teamId;
    if (filter.issueType) query.issueType = filter.issueType;
    if (filter.status) query.status = filter.status;
    if (filter.priority) query.priority = filter.priority;
    if (filter.aiCategory) query.aiCategory = filter.aiCategory;
    if (filter.finalCategory) query.finalCategory = filter.finalCategory;

    if (filter.search) {
      query.$or = [
        { title: { $regex: filter.search, $options: 'i' } },
        { issueKey: { $regex: filter.search, $options: 'i' } },
        { description: { $regex: filter.search, $options: 'i' } },
        { labels: { $regex: filter.search, $options: 'i' } },
      ];
    }

    const total = await IssueModel.countDocuments(query);

    let mongoQuery = IssueModel.find(query)
      .populate('assigneeId', 'name username email avatarUrl role title')
      .populate('reporterId', 'name username email avatarUrl role title')
      .populate('projectId', 'name key iconBgColor')
      .populate('teamId', 'name department');

    if (pagination?.sortBy) {
      const sortOrder = pagination.sortOrder === 'desc' ? -1 : 1;
      mongoQuery = mongoQuery.sort({ [pagination.sortBy]: sortOrder });
    } else {
      mongoQuery = mongoQuery.sort({ rank: 1, createdAt: -1 });
    }

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit;
      mongoQuery = mongoQuery.skip(skip).limit(pagination.limit);
    }

    const issues = await mongoQuery.exec();
    return { issues, total };
  }

  async findById(id: string): Promise<IIssue | null> {
    return IssueModel.findOne({ _id: id, isDeleted: false })
      .populate('assigneeId', 'name username email avatarUrl role title')
      .populate('reporterId', 'name username email avatarUrl role title')
      .populate('projectId', 'name key iconBgColor')
      .populate('teamId', 'name department')
      .populate('sprintId', 'name status');
  }

  async findByKey(issueKey: string): Promise<IIssue | null> {
    const direct = await IssueModel.findOne({ issueKey: issueKey.toUpperCase(), isDeleted: false })
      .populate('assigneeId', 'name username email avatarUrl role title')
      .populate('reporterId', 'name username email avatarUrl role title')
      .populate('projectId', 'name key iconBgColor')
      .populate('teamId', 'name department')
      .populate('sprintId', 'name status');
    if (direct) return direct;

    // Check if key is a subtask embedded inside any parent issue
    const parent = await IssueModel.findOne({
      'subtasks.key': issueKey.toUpperCase(),
      isDeleted: false,
    })
      .populate('assigneeId', 'name username email avatarUrl role title')
      .populate('reporterId', 'name username email avatarUrl role title')
      .populate('projectId', 'name key iconBgColor')
      .populate('teamId', 'name department')
      .populate('sprintId', 'name status');

    if (parent && parent.subtasks) {
      const sub = parent.subtasks.find((s) => s.key.toUpperCase() === issueKey.toUpperCase());
      if (sub) {
        return {
          _id: (sub as any)._id || parent._id,
          issueKey: sub.key,
          projectId: parent.projectId,
          parentIssueId: parent._id,
          sprintId: parent.sprintId,
          title: sub.title,
          description: `Subtask of ${parent.issueKey}: ${parent.title}`,
          issueType: 'SUBTASK',
          status: sub.completed ? 'DONE' : 'TODO',
          priority: parent.priority,
          reporterId: parent.reporterId,
          assigneeId: sub.assigneeId || parent.assigneeId,
          assigneeIds: parent.assigneeIds,
          teamId: parent.teamId,
          labels: parent.labels,
          subtasks: [],
          rank: 0,
          aiStatus: 'PENDING',
          isDeleted: false,
        } as any;
      }
    }

    return null;
  }

  async create(data: Partial<IIssue>): Promise<IIssue> {
    return IssueModel.create(data);
  }

  async update(id: string, updates: Partial<IIssue>): Promise<IIssue | null> {
    return IssueModel.findByIdAndUpdate(id, updates, { new: true })
      .populate('assigneeId', 'name username email avatarUrl role title')
      .populate('reporterId', 'name username email avatarUrl role title')
      .populate('projectId', 'name key iconBgColor')
      .populate('teamId', 'name department')
      .populate('sprintId', 'name status');
  }

  async softDelete(id: string, userId: string): Promise<IIssue | null> {
    return IssueModel.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
      { new: true }
    );
  }

  async count(query: Record<string, any> = {}): Promise<number> {
    return IssueModel.countDocuments({ isDeleted: false, ...query });
  }
}

export const issueRepository = new IssueRepository();
