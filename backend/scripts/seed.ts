import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { env } from '../src/config/env';
import { logger } from '../src/config/logger';
import { UserModel } from '../src/modules/users/model';
import { TeamModel } from '../src/modules/teams/model';
import { ProjectModel } from '../src/modules/projects/model';
import { SprintModel } from '../src/modules/sprints/model';
import { IssueModel } from '../src/modules/issues/model';
import { CommentModel } from '../src/modules/comments/model';
import { ActivityModel } from '../src/modules/activity/model';
import { NotificationModel } from '../src/modules/notifications/model';

async function seed() {
  try {
    logger.info(`Connecting to database: ${env.MONGODB_URI}`);
    await mongoose.connect(env.MONGODB_URI);
    logger.info('Connected to MongoDB.');

    logger.info('Clearing existing collections...');
    await Promise.all([
      UserModel.deleteMany({}),
      TeamModel.deleteMany({}),
      ProjectModel.deleteMany({}),
      SprintModel.deleteMany({}),
      IssueModel.deleteMany({}),
      CommentModel.deleteMany({}),
      ActivityModel.deleteMany({}),
      NotificationModel.deleteMany({}),
    ]);

    const passwordHash = await bcrypt.hash('password123', 10);

    logger.info('Seeding Users...');
    const users = await UserModel.create([
      {
        name: 'Sarah Chen',
        username: 'admin',
        email: 'admin@taskflow.dev',
        passwordHash,
        role: 'ADMIN',
        title: 'Chief Technology Officer',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        department: 'Executive',
        isActive: true,
      },
      {
        name: 'Michael Scott',
        username: 'manager',
        email: 'manager@taskflow.dev',
        passwordHash,
        role: 'MANAGER',
        title: 'Engineering Director',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        department: 'Engineering',
        isActive: true,
      },
      {
        name: 'David Kim',
        username: 'teamlead',
        email: 'teamlead@taskflow.dev',
        passwordHash,
        role: 'TEAM_LEADER',
        title: 'Lead Platform Engineer',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        department: 'Platform',
        isActive: true,
      },
      {
        name: 'Jessica Taylor',
        username: 'employee',
        email: 'employee@taskflow.dev',
        passwordHash,
        role: 'EMPLOYEE',
        title: 'Senior Frontend Engineer',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        department: 'Frontend',
        isActive: true,
      },
      {
        name: 'Alex Rivera',
        username: 'arivera',
        email: 'arivera@taskflow.dev',
        passwordHash,
        role: 'EMPLOYEE',
        title: 'Backend Systems Engineer',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        department: 'Platform',
        isActive: true,
      },
    ]);

    const [admin, manager, teamLead, employee, alex] = users;

    logger.info('Seeding Teams...');
    const coreTeam = await TeamModel.create({
      name: 'Core Platform Team',
      description: 'Responsible for core API microservices, data ingestion, and cloud infra',
      leaderId: teamLead._id,
      memberIds: [teamLead._id, employee._id, alex._id],
      department: 'Platform Engineering',
    });

    const frontendTeam = await TeamModel.create({
      name: 'Frontend Experiences',
      description: 'Atlassian design system UI, web dashboard, and client performance',
      leaderId: employee._id,
      memberIds: [employee._id, alex._id],
      department: 'Frontend Engineering',
    });

    // Update users with their team memberships
    await UserModel.findByIdAndUpdate(teamLead._id, { $addToSet: { teamIds: coreTeam._id } });
    await UserModel.findByIdAndUpdate(employee._id, {
      $addToSet: { teamIds: { $each: [coreTeam._id, frontendTeam._id] } },
    });
    await UserModel.findByIdAndUpdate(alex._id, {
      $addToSet: { teamIds: { $each: [coreTeam._id, frontendTeam._id] } },
    });

    logger.info('Seeding Projects...');
    const crmProject = await ProjectModel.create({
      name: 'Customer CRM Platform',
      key: 'CRM',
      description: 'Next-gen enterprise CRM platform with live metrics and AI triage',
      leadId: teamLead._id,
      teamId: coreTeam._id,
      category: 'SOFTWARE',
      status: 'ACTIVE',
      iconBgColor: '#0052CC',
      nextIssueNumber: 106,
    });

    const cloudProject = await ProjectModel.create({
      name: 'Cloud Infrastructure',
      key: 'CLOUD',
      description: 'Multi-region AWS cluster deployment, Kubernetes observability, and IAM',
      leadId: manager._id,
      teamId: coreTeam._id,
      category: 'OPERATIONS',
      status: 'ACTIVE',
      iconBgColor: '#5243AA',
      nextIssueNumber: 104,
    });

    const mobileProject = await ProjectModel.create({
      name: 'Mobile App Redesign',
      key: 'MOBILE',
      description: 'React Native enterprise application with offline syncing',
      leadId: employee._id,
      teamId: frontendTeam._id,
      category: 'SOFTWARE',
      status: 'PLANNING',
      iconBgColor: '#00875A',
      nextIssueNumber: 101,
    });

    logger.info('Seeding Sprints for CRM...');
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const fourWeeksFromNow = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000);

    const completedSprint = await SprintModel.create({
      projectId: crmProject._id,
      name: 'Sprint 1 - Foundation & Auth',
      goal: 'Establish baseline database schema, authentication, and core UI layouts',
      startDate: twoWeeksAgo,
      endDate: now,
      status: 'COMPLETED',
      issueIds: [],
    });

    const activeSprint = await SprintModel.create({
      projectId: crmProject._id,
      name: 'Sprint 2 - Board & AI Triage',
      goal: 'Deliver interactive Kanban board, real-time ticket categorization, and filters',
      startDate: now,
      endDate: twoWeeksFromNow,
      status: 'ACTIVE',
      issueIds: [],
    });

    const futureSprint = await SprintModel.create({
      projectId: crmProject._id,
      name: 'Sprint 3 - Advanced Analytics',
      goal: 'Burn-down charts, team velocity reports, and export integrations',
      startDate: twoWeeksFromNow,
      endDate: fourWeeksFromNow,
      status: 'FUTURE',
      issueIds: [],
    });

    logger.info('Seeding Issues...');
    const issuesData = [
      {
        issueKey: 'CRM-101',
        projectId: crmProject._id,
        sprintId: activeSprint._id,
        title: 'Implement drag-and-drop status transitions on Kanban board',
        description:
          'Users should be able to drag issue cards between columns (TODO -> IN_PROGRESS -> IN_REVIEW -> DONE) with optimistic UI updates.',
        issueType: 'STORY',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        reporterId: manager._id,
        assigneeId: employee._id,
        teamId: coreTeam._id,
        storyPoints: 5,
        labels: ['frontend', 'ux', 'kanban'],
        rank: 1,
        aiCategory: 'FEATURE',
        aiConfidence: 0.94,
        aiReason: 'Describes interactive user interface drag-and-drop capability.',
        aiStatus: 'COMPLETED',
        finalCategory: 'FEATURE',
        subtasks: [
          { key: 'CRM-101-1', title: 'Add HTML5 drag event listeners', completed: true },
          { key: 'CRM-101-2', title: 'Handle API status update and rollback on failure', completed: false },
        ],
      },
      {
        issueKey: 'CRM-102',
        projectId: crmProject._id,
        sprintId: activeSprint._id,
        title: 'Fix race condition during concurrent issue key generation',
        description:
          'Under simultaneous ticket creation requests, duplicate issue keys can be generated if non-atomic increments are used.',
        issueType: 'BUG',
        status: 'TODO',
        priority: 'HIGHEST',
        reporterId: admin._id,
        assigneeId: alex._id,
        teamId: coreTeam._id,
        storyPoints: 3,
        labels: ['backend', 'concurrency', 'database'],
        rank: 2,
        aiCategory: 'BUG',
        aiConfidence: 0.98,
        aiReason: 'Explicitly identifies a race condition bug causing duplicate keys.',
        aiStatus: 'COMPLETED',
        finalCategory: 'BUG',
        subtasks: [
          { key: 'CRM-102-1', title: 'Use MongoDB $inc atomic update on Project document', completed: false },
        ],
      },
      {
        issueKey: 'CRM-103',
        projectId: crmProject._id,
        sprintId: activeSprint._id,
        title: 'Add AI ticket classification preview pill in issue details modal',
        description:
          'Display the auto-predicted category, confidence score, and explanation with an Atlassian Lozenge badge.',
        issueType: 'STORY',
        status: 'IN_REVIEW',
        priority: 'MEDIUM',
        reporterId: teamLead._id,
        assigneeId: employee._id,
        teamId: frontendTeam._id,
        storyPoints: 2,
        labels: ['ai', 'ui', 'atlassian'],
        rank: 3,
        aiCategory: 'IMPROVEMENT',
        aiConfidence: 0.91,
        aiReason: 'Enhances issue details modal with visual AI confidence metrics.',
        aiStatus: 'COMPLETED',
        finalCategory: 'IMPROVEMENT',
      },
      {
        issueKey: 'CRM-104',
        projectId: crmProject._id,
        sprintId: activeSprint._id,
        title: 'Configure JWT session token refresh and cookie authentication',
        description:
          'Set up secure HTTP-only cookies and bearer header verification for seamless authenticated requests.',
        issueType: 'TASK',
        status: 'DONE',
        priority: 'HIGH',
        reporterId: admin._id,
        assigneeId: teamLead._id,
        teamId: coreTeam._id,
        storyPoints: 5,
        labels: ['security', 'auth', 'jwt'],
        rank: 4,
        aiCategory: 'TASK',
        aiConfidence: 0.95,
        aiReason: 'Technical security configuration task without business feature changes.',
        aiStatus: 'COMPLETED',
        finalCategory: 'TASK',
      },
      {
        issueKey: 'CRM-105',
        projectId: crmProject._id,
        sprintId: completedSprint._id,
        title: 'Design initial schema models for users, teams, and projects',
        description:
          'Create relational Mongoose models with indexes on key lookup fields and validation rules.',
        issueType: 'TASK',
        status: 'DONE',
        priority: 'MEDIUM',
        reporterId: manager._id,
        assigneeId: teamLead._id,
        teamId: coreTeam._id,
        storyPoints: 8,
        labels: ['database', 'architecture'],
        rank: 5,
        aiCategory: 'TASK',
        aiConfidence: 0.92,
        aiReason: 'Architectural database schema design task.',
        aiStatus: 'COMPLETED',
        finalCategory: 'TASK',
      },
      {
        issueKey: 'CLOUD-101',
        projectId: cloudProject._id,
        sprintId: null,
        title: 'Setup Kubernetes staging ingress and TLS certificates',
        description: 'Provision Let’s Encrypt cert-manager on staging AWS EKS cluster.',
        issueType: 'TASK',
        status: 'TODO',
        priority: 'HIGH',
        reporterId: manager._id,
        assigneeId: alex._id,
        teamId: coreTeam._id,
        storyPoints: 3,
        labels: ['infra', 'k8s', 'security'],
        rank: 1,
        aiCategory: 'TASK',
        aiConfidence: 0.96,
        aiReason: 'Infrastructure provisioning and SSL setup.',
        aiStatus: 'COMPLETED',
        finalCategory: 'TASK',
      },
    ];

    const createdIssues = await IssueModel.create(issuesData);

    // Update active sprint issue IDs
    const activeSprintIssues = createdIssues.filter(
      (i) => i.sprintId?.toString() === activeSprint._id.toString()
    );
    await SprintModel.findByIdAndUpdate(activeSprint._id, {
      issueIds: activeSprintIssues.map((i) => i._id),
    });

    logger.info('Seeding Comments and Activities...');
    const firstIssue = createdIssues[0];
    await CommentModel.create({
      issueId: firstIssue._id,
      authorId: teamLead._id,
      content: 'I verified the drag preview looks great! Let us make sure touch events work on mobile too.',
    });

    await ActivityModel.create([
      {
        actorId: manager._id,
        entityType: 'ISSUE',
        entityId: firstIssue._id.toString(),
        action: 'ISSUE_CREATED',
        newValue: firstIssue.issueKey,
        metadata: { title: firstIssue.title },
      },
      {
        actorId: employee._id,
        entityType: 'ISSUE',
        entityId: firstIssue._id.toString(),
        action: 'STATUS_CHANGED',
        oldValue: 'TODO',
        newValue: 'IN_PROGRESS',
      },
    ]);

    await NotificationModel.create({
      recipientId: employee._id,
      type: 'ISSUE_ASSIGNED',
      title: 'New Issue Assigned',
      message: `You were assigned to ${firstIssue.issueKey}: ${firstIssue.title}`,
      entityType: 'ISSUE',
      entityId: firstIssue._id.toString(),
      link: `/issue/${firstIssue.issueKey}`,
      isRead: false,
    });

    logger.info('✅ Database successfully seeded with demo accounts and data!');
    logger.info('------------------------------------------------------------');
    logger.info('Demo Credentials:');
    logger.info('  Admin:       admin / password123       (admin@taskflow.dev)');
    logger.info('  Manager:     manager / password123     (manager@taskflow.dev)');
    logger.info('  Team Leader: teamlead / password123    (teamlead@taskflow.dev)');
    logger.info('  Employee:    employee / password123    (employee@taskflow.dev)');
    logger.info('------------------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Failed to seed database', error);
    process.exit(1);
  }
}

seed();
