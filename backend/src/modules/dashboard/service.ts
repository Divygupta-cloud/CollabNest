import { UserModel } from '../users/model';
import { TeamModel } from '../teams/model';
import { ProjectModel } from '../projects/model';
import { SprintModel } from '../sprints/model';
import { IssueModel } from '../issues/model';
import { ActivityModel } from '../activity/model';
import { Types } from 'mongoose';

export class DashboardService {
  async getDashboardForUser(user: { id: string; role: string }) {
    switch (user.role) {
      case 'ADMIN':
        return this.getAdminDashboard();
      case 'MANAGER':
        return this.getManagerDashboard(user.id);
      case 'TEAM_LEADER':
        return this.getTeamLeaderDashboard(user.id);
      case 'EMPLOYEE':
      default:
        return this.getEmployeeDashboard(user.id);
    }
  }

  private async getAdminDashboard() {
    const [
      totalUsers,
      activeUsers,
      totalTeams,
      totalProjects,
      totalIssues,
      openIssues,
      completedIssues,
      roleAggregation,
      deptAggregation,
      aiCategoryAggregation,
      recentActivity,
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ status: 'ACTIVE' }),
      TeamModel.countDocuments(),
      ProjectModel.countDocuments(),
      IssueModel.countDocuments({ isDeleted: false }),
      IssueModel.countDocuments({ isDeleted: false, status: { $ne: 'DONE' } }),
      IssueModel.countDocuments({ isDeleted: false, status: 'DONE' }),
      UserModel.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      TeamModel.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]),
      IssueModel.aggregate([
        { $match: { isDeleted: false, aiCategory: { $exists: true } } },
        { $group: { _id: '$aiCategory', count: { $sum: 1 } } },
      ]),
      ActivityModel.find()
        .populate('actorId', 'name username email avatarUrl role')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const roleBreakdown: Record<string, number> = {};
    roleAggregation.forEach((r) => {
      roleBreakdown[r._id] = r.count;
    });

    const departmentBreakdown: Record<string, number> = {};
    deptAggregation.forEach((d) => {
      departmentBreakdown[d._id] = d.count;
    });

    const aiDistribution: Record<string, number> = {};
    aiCategoryAggregation.forEach((a) => {
      aiDistribution[a._id] = a.count;
    });

    return {
      role: 'ADMIN',
      systemOverview: {
        totalUsers,
        activeUsers,
        totalTeams,
        totalProjects,
        totalIssues,
        openIssues,
        completedIssues,
      },
      roleBreakdown,
      departmentBreakdown,
      aiDistribution,
      recentActivity,
    };
  }

  private async getManagerDashboard(userId: string) {
    // Find all projects and active sprints
    const projects = await ProjectModel.find().populate('leadId', 'name username avatarUrl');
    const projectSummaries = await Promise.all(
      projects.map(async (project) => {
        const total = await IssueModel.countDocuments({ projectId: project._id, isDeleted: false });
        const completed = await IssueModel.countDocuments({
          projectId: project._id,
          status: 'DONE',
          isDeleted: false,
        });
        const open = total - completed;
        return {
          id: project._id,
          name: project.name,
          key: project.key,
          category: project.category,
          status: project.status,
          totalIssues: total,
          openIssues: open,
          completedIssues: completed,
          completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      })
    );

    const activeSprints = await SprintModel.find({ status: 'ACTIVE' }).populate(
      'projectId',
      'name key'
    );

    const memberWorkload = await IssueModel.aggregate([
      { $match: { isDeleted: false, status: { $ne: 'DONE' }, assigneeId: { $exists: true } } },
      { $group: { _id: '$assigneeId', count: { $sum: 1 }, storyPoints: { $sum: '$storyPoints' } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          username: '$user.username',
          avatarUrl: '$user.avatarUrl',
          openIssueCount: '$count',
          storyPoints: '$storyPoints',
        },
      },
      { $sort: { openIssueCount: -1 } },
      { $limit: 10 },
    ]);

    return {
      role: 'MANAGER',
      projectSummaries,
      activeSprints,
      memberWorkload,
    };
  }

  private async getTeamLeaderDashboard(userId: string) {
    // Find teams led by this user or user's assigned team
    const team = await TeamModel.findOne({ leaderId: userId });
    const teamProjects = team ? await ProjectModel.find({ teamId: team._id }) : [];
    const projectIds = teamProjects.map((p) => p._id);

    // Active sprints for these projects
    const activeSprint = await SprintModel.findOne({
      projectId: { $in: projectIds },
      status: 'ACTIVE',
    });

    let sprintIssues: any[] = [];
    let sprintProgress = { totalPoints: 0, completedPoints: 0, totalIssues: 0, completedIssues: 0 };

    if (activeSprint) {
      sprintIssues = await IssueModel.find({ sprintId: activeSprint._id, isDeleted: false }).populate(
        'assigneeId',
        'name username avatarUrl'
      );

      sprintIssues.forEach((issue) => {
        const pts = issue.storyPoints || 0;
        sprintProgress.totalPoints += pts;
        sprintProgress.totalIssues += 1;
        if (issue.status === 'DONE') {
          sprintProgress.completedPoints += pts;
          sprintProgress.completedIssues += 1;
        }
      });
    }

    const unassignedCount = await IssueModel.countDocuments({
      projectId: { $in: projectIds },
      isDeleted: false,
      assigneeId: { $exists: false },
      status: { $ne: 'DONE' },
    });

    const urgentIssues = await IssueModel.find({
      projectId: { $in: projectIds },
      isDeleted: false,
      priority: { $in: ['HIGHEST', 'HIGH'] },
      status: { $ne: 'DONE' },
    })
      .populate('assigneeId', 'name username avatarUrl')
      .limit(5);

    return {
      role: 'TEAM_LEADER',
      team,
      activeSprint,
      sprintProgress,
      sprintIssues,
      unassignedCount,
      urgentIssues,
    };
  }

  private async getEmployeeDashboard(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    const [assignedIssues, completedThisWeek, recentActivity] = await Promise.all([
      IssueModel.find({
        assigneeId: userObjectId,
        isDeleted: false,
        status: { $ne: 'DONE' },
      })
        .populate('projectId', 'name key iconBgColor')
        .populate('sprintId', 'name status')
        .sort({ priority: 1, createdAt: -1 }),

      IssueModel.countDocuments({
        assigneeId: userObjectId,
        isDeleted: false,
        status: 'DONE',
        updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),

      ActivityModel.find({
        actorId: userObjectId,
      })
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const highPriority = assignedIssues.filter(
      (i) => i.priority === 'HIGHEST' || i.priority === 'HIGH'
    );

    return {
      role: 'EMPLOYEE',
      totalAssigned: assignedIssues.length,
      completedThisWeek,
      highPriorityCount: highPriority.length,
      assignedIssues,
      recentActivity,
    };
  }
}

export const dashboardService = new DashboardService();
