import {
  User,
  Team,
  Project,
  Sprint,
  Issue,
  Comment,
  Notification,
  ActivityItem,
  IssueStatus,
} from '../types';
import { mockUsers } from './users.mock';
import { mockTeams } from './teams.mock';
import { mockProjects } from './projects.mock';
import { mockSprints } from './sprints.mock';
import { mockIssues } from './issues.mock';
import { mockComments } from './comments.mock';
import { mockNotifications, mockActivities } from './notifications.mock';
import { getIllustratedAvatarUrl } from '../design-system/components/UserAvatar';

export interface StoreState {
  currentUser: User;
  users: User[];
  teams: Team[];
  projects: Project[];
  sprints: Sprint[];
  issues: Issue[];
  comments: Comment[];
  notifications: Notification[];
  activities: ActivityItem[];
}

const STORAGE_KEY = 'taskflow_store_v2';

class Store {
  private state: StoreState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadInitialState();
  }

  private ensureSubtaskIssues(issues: Issue[]): Issue[] {
    const existingIds = new Set(issues.map((i) => i.id));
    const existingKeys = new Set(issues.map((i) => i.key.toUpperCase()));

    const subIssuesToAdd: Issue[] = [];
    for (const parent of issues) {
      if (parent.subtasks && Array.isArray(parent.subtasks)) {
        for (const sub of parent.subtasks) {
          if (!existingIds.has(sub.id) && !existingKeys.has(sub.key.toUpperCase())) {
            const subAssigneeIds = sub.assigneeIds || (sub.assigneeId ? [sub.assigneeId] : parent.assigneeIds || (parent.assigneeId ? [parent.assigneeId] : []));
            const subIssue: Issue = {
              id: sub.id,
              key: sub.key,
              projectId: parent.projectId,
              sprintId: parent.sprintId,
              epicId: parent.epicId,
              parentIssueId: parent.id,
              title: sub.title,
              description: `Subtask of ${parent.key}: ${parent.title}`,
              type: 'SUBTASK',
              status: sub.status || (sub.completed ? 'DONE' : 'TODO'),
              priority: parent.priority,
              reporterId: parent.reporterId,
              assigneeId: sub.assigneeId || parent.assigneeId,
              assigneeIds: subAssigneeIds,
              labels: parent.labels || [],
              subtasks: [],
              createdAt: parent.createdAt,
              updatedAt: parent.updatedAt,
              order: 0,
            };
            subIssuesToAdd.push(subIssue);
            existingIds.add(sub.id);
            existingKeys.add(sub.key.toUpperCase());
          }
        }
      }
    }
    return subIssuesToAdd.length > 0 ? [...issues, ...subIssuesToAdd] : issues;
  }

  private loadInitialState(): StoreState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic check
        if (parsed.users && parsed.issues) {
          parsed.users = parsed.users.map((u: User) => ({
            ...u,
            avatarUrl: (!u.avatarUrl || u.avatarUrl.includes('unsplash')) ? getIllustratedAvatarUrl(u.id) : u.avatarUrl,
          }));
          if (parsed.currentUser && (!parsed.currentUser.avatarUrl || parsed.currentUser.avatarUrl.includes('unsplash'))) {
            parsed.currentUser.avatarUrl = getIllustratedAvatarUrl(parsed.currentUser.id);
          }
          parsed.issues = this.ensureSubtaskIssues(parsed.issues);
          return parsed;
        }
      }
    } catch {
      // fallback to initial mocks
    }

    const initialIssues = this.ensureSubtaskIssues(mockIssues);
    return {
      currentUser: mockUsers[0], // Default: Alex Rivera (Admin)
      users: mockUsers,
      teams: mockTeams,
      projects: mockProjects,
      sprints: mockSprints,
      issues: initialIssues,
      comments: mockComments,
      notifications: mockNotifications,
      activities: mockActivities,
    };
  }

  private saveState() {
    this.state = {
      ...this.state,
      issues: [...this.state.issues],
      comments: [...this.state.comments],
      projects: [...this.state.projects],
      sprints: [...this.state.sprints],
      activities: [...this.state.activities],
      notifications: [...this.state.notifications],
      users: [...this.state.users],
      teams: [...this.state.teams],
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // ignore
    }
    this.notify();
  }


  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public getState(): StoreState {
    return this.state;
  }

  public resetToDefaults() {
    this.state = {
      currentUser: mockUsers[0],
      users: [...mockUsers],
      teams: [...mockTeams],
      projects: [...mockProjects],
      sprints: [...mockSprints],
      issues: [...mockIssues],
      comments: [...mockComments],
      notifications: [...mockNotifications],
      activities: [...mockActivities],
    };
    this.saveState();
  }

  // --- Auth / Current User ---
  public getCurrentUser(): User {
    return this.state.currentUser;
  }

  public setCurrentUser(user: User) {
    this.state.currentUser = user;
    this.saveState();
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.state.users;
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  public createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.users.push(newUser);
    this.saveState();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.state.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.state.users[idx] = { ...this.state.users[idx], ...updates };
    if (this.state.currentUser.id === id) {
      this.state.currentUser = this.state.users[idx];
    }
    this.saveState();
    return this.state.users[idx];
  }

  // --- Projects ---
  public getProjects(): Project[] {
    return this.state.projects;
  }

  public getProjectByKey(key: string): Project | undefined {
    return this.state.projects.find((p) => p.key.toUpperCase() === key.toUpperCase());
  }

  public getProjectById(id: string): Project | undefined {
    return this.state.projects.find((p) => p.id === id);
  }

  public toggleProjectStar(id: string): Project | undefined {
    const project = this.state.projects.find((p) => p.id === id);
    if (project) {
      project.isStarred = !project.isStarred;
      this.saveState();
    }
    return project;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const idx = this.state.projects.findIndex((p) => p.id === id || p.key.toUpperCase() === id.toUpperCase());
    if (idx === -1) return undefined;
    this.state.projects[idx] = { ...this.state.projects[idx], ...updates };
    this.saveState();
    return this.state.projects[idx];
  }

  // --- Teams ---
  public getTeams(): Team[] {
    return this.state.teams;
  }

  public getTeamById(id: string): Team | undefined {
    return this.state.teams.find((t) => t.id === id);
  }

  // --- Sprints ---
  public getSprintsByProject(projectId: string): Sprint[] {
    return this.state.sprints.filter((s) => s.projectId === projectId);
  }

  public createSprint(sprintData: Omit<Sprint, 'id' | 'createdAt'>): Sprint {
    const newSprint: Sprint = {
      ...sprintData,
      id: `sprint-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.sprints.push(newSprint);
    this.saveState();
    return newSprint;
  }

  public updateSprint(id: string, updates: Partial<Sprint>): Sprint | undefined {
    const idx = this.state.sprints.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.state.sprints[idx] = { ...this.state.sprints[idx], ...updates };
    this.saveState();
    return this.state.sprints[idx];
  }

  // --- Issues ---
  public getIssues(): Issue[] {
    return this.state.issues;
  }

  public getIssuesByProject(projectId: string): Issue[] {
    return this.state.issues.filter((i) => i.projectId === projectId);
  }

  public getIssueByKey(key: string): Issue | undefined {
    if (!key) return undefined;
    const direct = this.state.issues.find((i) => i.key.toUpperCase() === key.toUpperCase());
    if (direct) return direct;

    // Check if key corresponds to a subtask inside any parent issue
    for (const parent of this.state.issues) {
      if (parent.subtasks && Array.isArray(parent.subtasks)) {
        const sub = parent.subtasks.find((s) => s.key.toUpperCase() === key.toUpperCase());
        if (sub) {
          const subAssigneeIds = sub.assigneeIds || (sub.assigneeId ? [sub.assigneeId] : parent.assigneeIds || (parent.assigneeId ? [parent.assigneeId] : []));
          const subIssue: Issue = {
            id: sub.id,
            key: sub.key,
            projectId: parent.projectId,
            sprintId: parent.sprintId,
            epicId: parent.epicId,
            parentIssueId: parent.id,
            title: sub.title,
            description: `Subtask of ${parent.key}: ${parent.title}`,
            type: 'SUBTASK',
            status: sub.status || (sub.completed ? 'DONE' : 'TODO'),
            priority: parent.priority,
            reporterId: parent.reporterId,
            assigneeId: sub.assigneeId || parent.assigneeId,
            assigneeIds: subAssigneeIds,
            labels: parent.labels || [],
            subtasks: [],
            createdAt: parent.createdAt,
            updatedAt: parent.updatedAt,
            order: 0,
          };
          this.state.issues.push(subIssue);
          this.saveState();
          return subIssue;
        }
      }
    }
    return undefined;
  }

  public getIssueById(id: string): Issue | undefined {
    if (!id) return undefined;
    const direct = this.state.issues.find((i) => i.id === id);
    if (direct) return direct;

    for (const parent of this.state.issues) {
      if (parent.subtasks && Array.isArray(parent.subtasks)) {
        const sub = parent.subtasks.find((s) => s.id === id);
        if (sub) {
          return this.getIssueByKey(sub.key);
        }
      }
    }
    return undefined;
  }

  public createIssue(issueData: Omit<Issue, 'id' | 'key' | 'createdAt' | 'updatedAt' | 'order'> & { customKey?: string }): Issue {
    const project = this.getProjectById(issueData.projectId);
    const projKey = project?.key || 'TASK';
    const projectIssues = this.state.issues.filter((i) => i.projectId === issueData.projectId);
    const nextNumber = projectIssues.length + 100;
    const key = issueData.customKey || `${projKey}-${nextNumber}`;

    const initialAssigneeIds = issueData.assigneeIds && issueData.assigneeIds.length > 0
      ? issueData.assigneeIds
      : issueData.assigneeId
      ? [issueData.assigneeId]
      : [];
    const primaryAssigneeId = initialAssigneeIds[0] || issueData.assigneeId;

    const newIssue: Issue = {
      ...issueData,
      id: `issue-${Date.now()}`,
      key,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: projectIssues.length,
      assigneeId: primaryAssigneeId,
      assigneeIds: initialAssigneeIds,
      subtasks: issueData.subtasks || [],
      labels: issueData.labels || [],
    };

    this.state.issues.push(newIssue);

    // If subtask, ensure parent's subtask array is synchronized
    if (newIssue.parentIssueId) {
      const parent = this.state.issues.find((i) => i.id === newIssue.parentIssueId || i.key === newIssue.parentIssueId);
      if (parent) {
        const currentSubs = parent.subtasks || [];
        if (!currentSubs.some((s) => s.id === newIssue.id || s.key === newIssue.key)) {
          parent.subtasks = [
            ...currentSubs,
            {
              id: newIssue.id,
              key: newIssue.key,
              title: newIssue.title,
              completed: newIssue.status === 'DONE',
              status: newIssue.status,
              assigneeId: newIssue.assigneeId,
            },
          ];
        }
      }
    }

    // Add activity record
    this.state.activities.unshift({
      id: `act-${Date.now()}`,
      userId: this.state.currentUser.id,
      issueKey: newIssue.key,
      issueTitle: newIssue.title,
      action: 'CREATED',
      detail: `created ${newIssue.type} ${newIssue.key}`,
      timestamp: new Date().toISOString(),
    });

    this.saveState();
    return newIssue;
  }

  public updateIssue(id: string, updates: Partial<Issue>): Issue | undefined {
    let current = this.state.issues.find((i) => i.id === id || i.key === id);
    if (!current) {
      current = this.getIssueByKey(id) || this.getIssueById(id);
    }
    if (!current) return undefined;

    let nextAssigneeIds = updates.assigneeIds !== undefined ? updates.assigneeIds : current.assigneeIds;
    let nextAssigneeId = updates.assigneeId !== undefined ? updates.assigneeId : current.assigneeId;

    if (updates.assigneeIds !== undefined) {
      nextAssigneeId = updates.assigneeIds[0] || undefined;
    } else if (updates.assigneeId !== undefined) {
      if (updates.assigneeId) {
        if (!nextAssigneeIds?.includes(updates.assigneeId)) {
          nextAssigneeIds = [updates.assigneeId, ...(nextAssigneeIds || [])];
        }
      } else {
        nextAssigneeIds = [];
      }
    }

    const updated: Issue = {
      ...current,
      ...updates,
      assigneeId: nextAssigneeId,
      assigneeIds: nextAssigneeIds || [],
      updatedAt: new Date().toISOString(),
    };

    // If status changed, log activity
    if (updates.status && updates.status !== current.status) {
      this.state.activities.unshift({
        id: `act-${Date.now()}`,
        userId: this.state.currentUser.id,
        issueKey: updated.key,
        issueTitle: updated.title,
        action: 'UPDATED_STATUS',
        detail: `moved to ${updates.status}`,
        timestamp: new Date().toISOString(),
      });
    }

    // Two-way synchronization if updated issue is a subtask
    if (updated.parentIssueId) {
      const parent = this.state.issues.find((i) => i.id === updated.parentIssueId || i.key === updated.parentIssueId);
      if (parent && parent.subtasks) {
        parent.subtasks = parent.subtasks.map((st) =>
          st.id === updated.id || st.key === updated.key
            ? {
                ...st,
                title: updated.title ?? st.title,
                completed: updated.status === 'DONE',
                status: updated.status ?? (updated.status === 'DONE' ? 'DONE' : st.status),
                assigneeId: updated.assigneeId ?? st.assigneeId,
              }
            : st
        );
      }
    }

    // Two-way synchronization if parent updated its subtasks list
    if (updates.subtasks) {
      for (const st of updates.subtasks) {
        const existingSub = this.state.issues.find((i) => i.id === st.id || i.key === st.key);
        if (existingSub) {
          existingSub.title = st.title;
          existingSub.status = st.status || (st.completed ? 'DONE' : 'TODO');
          existingSub.assigneeId = st.assigneeId;
          existingSub.updatedAt = new Date().toISOString();
        } else {
          const newSubIssue: Issue = {
            id: st.id,
            key: st.key,
            projectId: current.projectId,
            sprintId: current.sprintId,
            epicId: current.epicId,
            parentIssueId: current.id,
            title: st.title,
            description: `Subtask of ${current.key}: ${current.title}`,
            type: 'SUBTASK',
            status: st.status || (st.completed ? 'DONE' : 'TODO'),
            priority: current.priority,
            reporterId: current.reporterId,
            assigneeId: st.assigneeId || current.assigneeId,
            assigneeIds: st.assigneeIds || (st.assigneeId ? [st.assigneeId] : current.assigneeIds || []),
            labels: current.labels || [],
            subtasks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            order: 0,
          };
          this.state.issues.push(newSubIssue);
        }
      }
    }

    this.state.issues = this.state.issues.map((i) => (i.id === current.id ? updated : i));
    this.saveState();
    return updated;
  }

  public deleteIssue(id: string): boolean {
    const target = this.state.issues.find((i) => i.id === id || i.key === id);
    if (!target) return false;

    // If subtask, remove from parent's subtask list
    if (target.parentIssueId) {
      const parent = this.state.issues.find((i) => i.id === target.parentIssueId || i.key === target.parentIssueId);
      if (parent && parent.subtasks) {
        parent.subtasks = parent.subtasks.filter((st) => st.id !== target.id && st.key !== target.key);
      }
    }

    this.state.issues = this.state.issues.filter((i) => i.id !== target.id && i.key !== target.key);
    this.saveState();
    return true;
  }


  public moveIssueStatus(id: string, newStatus: IssueStatus): Issue | undefined {
    return this.updateIssue(id, { status: newStatus });
  }

  public moveIssueSprint(id: string, sprintId: string | null): Issue | undefined {
    return this.updateIssue(id, { sprintId });
  }

  // --- Comments ---
  public getCommentsByIssue(issueId: string): Comment[] {
    return this.state.comments.filter((c) => c.issueId === issueId);
  }

  public addComment(issueId: string, content: string): Comment {
    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      issueId,
      authorId: this.state.currentUser.id,
      content,
      createdAt: new Date().toISOString(),
    };
    this.state.comments.push(newComment);

    const issue = this.getIssueById(issueId);
    if (issue) {
      this.state.activities.unshift({
        id: `act-${Date.now()}`,
        userId: this.state.currentUser.id,
        issueKey: issue.key,
        issueTitle: issue.title,
        action: 'COMMENTED',
        detail: 'posted a comment',
        timestamp: new Date().toISOString(),
      });
    }

    this.saveState();
    return newComment;
  }

  public deleteComment(id: string) {
    this.state.comments = this.state.comments.filter((c) => c.id !== id);
    this.saveState();
  }

  public setCommentsForIssue(issueId: string, comments: Comment[]) {
    const others = this.state.comments.filter((c) => c.issueId !== issueId);
    this.state.comments = [...others, ...comments];
    this.saveState();
  }

  public updateCommentId(oldId: string, newId: string) {
    const comm = this.state.comments.find((c) => c.id === oldId);
    if (comm) {
      comm.id = newId;
      this.saveState();
    }
  }

  public syncWithBackend(partial: Partial<StoreState>) {
    this.state = {
      ...this.state,
      ...partial,
    };
    this.saveState();
  }


  // --- Notifications ---
  public getNotifications(): Notification[] {
    return this.state.notifications;
  }

  public markNotificationAsRead(id: string) {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveState();
    }
  }

  public markAllNotificationsAsRead() {
    this.state.notifications.forEach((n) => (n.read = true));
    this.saveState();
  }

  // --- Activities ---
  public getActivities(): ActivityItem[] {
    return this.state.activities;
  }
}

export const mockStore = new Store();
