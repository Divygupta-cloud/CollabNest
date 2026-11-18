import { Issue, Project, Sprint, Comment, User, Team } from '../types';

export function adaptBackendIssue(raw: any): Issue {
  const id = raw._id || raw.id;
  const key = raw.issueKey || raw.key || '';
  const projectId =
    typeof raw.projectId === 'object' && raw.projectId?._id
      ? raw.projectId._id
      : raw.projectId || '';
  const sprintId =
    typeof raw.sprintId === 'object' && raw.sprintId?._id
      ? raw.sprintId._id
      : raw.sprintId || null;
  const reporterId =
    typeof raw.reporterId === 'object' && raw.reporterId?._id
      ? raw.reporterId._id
      : raw.reporterId || '';
  const rawAssigneeIds: string[] = Array.isArray(raw.assigneeIds)
    ? raw.assigneeIds.map((a: any) => (typeof a === 'object' && a?._id ? a._id : a))
    : raw.assigneeId
    ? [typeof raw.assigneeId === 'object' && raw.assigneeId?._id ? raw.assigneeId._id : raw.assigneeId]
    : [];

  const assigneeId =
    rawAssigneeIds[0] ||
    (typeof raw.assigneeId === 'object' && raw.assigneeId?._id
      ? raw.assigneeId._id
      : raw.assigneeId || undefined);

  return {
    id,
    key,
    projectId,
    sprintId,
    title: raw.title || '',
    description: raw.description || '',
    type: raw.issueType || raw.type || 'STORY',
    status: raw.status || 'TODO',
    priority: raw.priority || 'MEDIUM',
    storyPoints: raw.storyPoints,
    reporterId,
    assigneeId,
    assigneeIds: rawAssigneeIds.length > 0 ? rawAssigneeIds : assigneeId ? [assigneeId] : [],
    labels: raw.labels || [],
    subtasks: (raw.subtasks || []).map((s: any) => {
      const subAssigneeIds: string[] = Array.isArray(s.assigneeIds)
        ? s.assigneeIds.map((a: any) => (typeof a === 'object' && a?._id ? a._id : a))
        : s.assigneeId
        ? [typeof s.assigneeId === 'object' && s.assigneeId?._id ? s.assigneeId._id : s.assigneeId]
        : [];
      return {
        id: s._id || s.id || s.key,
        key: s.key,
        title: s.title,
        completed: s.completed,
        assigneeId: subAssigneeIds[0] || (typeof s.assigneeId === 'object' ? s.assigneeId?._id : s.assigneeId),
        assigneeIds: subAssigneeIds,
      };
    }),
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
    order: raw.rank || raw.order || 0,
    aiClassification: raw.aiCategory
      ? {
          category: raw.finalCategory || raw.aiCategory,
          confidence: raw.aiConfidence ?? 0.95,
          suggestedLabels: [raw.finalCategory || raw.aiCategory],
          summaryInsight: raw.aiReason || `AI classified as ${raw.finalCategory || raw.aiCategory}`,
          analyzedAt: raw.updatedAt || new Date().toISOString(),
        }
      : undefined,
  };
}

export function adaptBackendProject(raw: any): Project {
  return {
    id: raw._id || raw.id,
    key: raw.key,
    name: raw.name,
    description: raw.description || '',
    category: raw.category || 'SOFTWARE',
    leadId: typeof raw.leadId === 'object' ? raw.leadId?._id : raw.leadId,
    iconBgColor: raw.iconBgColor || '#0052CC',
    isStarred: raw.isStarred || false,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export function adaptBackendSprint(raw: any): Sprint {
  return {
    id: raw._id || raw.id,
    projectId: typeof raw.projectId === 'object' ? raw.projectId?._id : raw.projectId,
    name: raw.name,
    goal: raw.goal,
    status: raw.status === 'COMPLETED' ? 'CLOSED' : raw.status,
    startDate: raw.startDate,
    endDate: raw.endDate,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export function adaptBackendComment(raw: any): Comment {
  return {
    id: raw._id || raw.id,
    issueId: typeof raw.issueId === 'object' ? raw.issueId?._id : raw.issueId,
    authorId: typeof raw.authorId === 'object' ? raw.authorId?._id : raw.authorId,
    content: raw.content,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt,
  };
}

import { getIllustratedAvatarUrl } from '../design-system/components/UserAvatar';

export function adaptBackendUser(raw: any): User {
  const userId = raw._id || raw.id || 'user';
  return {
    id: userId,
    name: raw.name,
    email: raw.email,
    avatarUrl: (!raw.avatarUrl || raw.avatarUrl.includes('unsplash')) ? getIllustratedAvatarUrl(userId) : raw.avatarUrl,
    role:
      raw.role === 'ADMIN'
        ? 'ADMIN'
        : raw.role === 'MANAGER'
        ? 'MANAGER'
        : raw.role === 'TEAM_LEADER' || raw.role === 'TEAM_LEAD'
        ? 'TEAM_LEAD'
        : raw.role === 'QA'
        ? 'QA'
        : 'DEVELOPER',
    title: raw.title || 'Engineer',
    department: raw.department || 'Engineering',
    status: raw.isActive ? 'ACTIVE' : 'INACTIVE',
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export function adaptBackendTeam(raw: any): Team {
  return {
    id: raw._id || raw.id,
    name: raw.name,
    description: raw.description || '',
    leadId: typeof raw.leaderId === 'object' ? raw.leaderId?._id : raw.leaderId,
    memberIds: (raw.memberIds || []).map((m: any) => (typeof m === 'object' ? m._id : m)),
    department: raw.department || 'Engineering',
    projectIds: (raw.projectIds || []).map((p: any) => (typeof p === 'object' ? p._id : p)),
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}
