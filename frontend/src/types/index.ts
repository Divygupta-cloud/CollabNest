// Core TypeScript Domain Models for CollabNest (Jira-style Project Management)

export type UserRole = 'ADMIN' | 'MANAGER' | 'TEAM_LEAD' | 'DEVELOPER' | 'QA';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  teamId?: string;
  title: string;
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  leadId: string;
  memberIds: string[];
  department: string;
  projectIds: string[];
  createdAt: string;
}

export type ProjectCategory = 'SOFTWARE' | 'OPERATIONS' | 'MARKETING' | 'BUSINESS';

export interface Project {
  id: string;
  key: string;
  name: string;
  description: string;
  category: ProjectCategory;
  leadId: string;
  avatarUrl?: string;
  iconBgColor?: string;
  isStarred?: boolean;
  activeSprintId?: string;
  createdAt: string;
}

export type SprintStatus = 'ACTIVE' | 'FUTURE' | 'CLOSED';

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string;
  status: SprintStatus;
  startDate?: string;
  endDate?: string;
  totalPoints?: number;
  completedPoints?: number;
  createdAt: string;
}

export type IssueType = 'EPIC' | 'STORY' | 'TASK' | 'BUG' | 'SUBTASK';

export type IssueStatus =
  | 'BACKLOG'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'QA_TESTING'
  | 'DONE'
  | 'CANCELLED';

export type IssuePriority = 'HIGHEST' | 'HIGH' | 'MEDIUM' | 'LOW' | 'LOWEST';

export type AIClassification =
  | 'Bug'
  | 'feature'
  | 'docuementation'
  | 'Refactor'
  | 'others'
  | 'BUG'
  | 'FEATURE'
  | 'IMPROVEMENT'
  | 'DOCUMENTATION'
  | 'TASK'
  | 'OTHER';

export interface Subtask {
  id: string;
  key: string;
  title: string;
  completed: boolean;
  assigneeId?: string;
  assigneeIds?: string[];
  status?: IssueStatus;
}

export interface IssueAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export type LinkRelationship =
  | 'blocks'
  | 'is blocked by'
  | 'relates to'
  | 'duplicates'
  | 'is duplicated by';

export interface LinkedIssue {
  id: string;
  relationship: LinkRelationship;
  targetIssueId: string;
  targetIssueKey: string;
  targetIssueTitle: string;
}

export interface AISuggestionItem {
  suggestedType?: IssueType;
  suggestedEpicId?: string;
  suggestedPriority?: IssuePriority;
  suggestedLabels?: string[];
  confidence: number;
  reason: string;
  applied?: boolean;
}

export interface Issue {
  id: string;
  key: string; // e.g. CRM-101
  projectId: string;
  sprintId?: string | null; // null or undefined means backlog
  epicId?: string;
  parentIssueId?: string;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  storyPoints?: number;
  reporterId: string;
  assigneeId?: string;
  assigneeIds?: string[];
  labels: string[];
  subtasks: Subtask[];
  dueDate?: string;
  attachments?: IssueAttachment[];
  linkedIssues?: LinkedIssue[];
  aiSuggestions?: AISuggestionItem;
  createdAt: string;
  updatedAt: string;
  order: number; // for board/backlog reordering

  // Mocked AI Classification preview fields (per frontent.md §27, §43)
  aiClassification?: {
    category: AIClassification;
    confidence: number; // 0 to 1 (e.g. 0.94)
    suggestedLabels: string[];
    summaryInsight?: string;
    analyzedAt?: string;
  };
}

export interface Comment {
  id: string;
  issueId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'MENTION' | 'ASSIGN' | 'STATUS_CHANGE' | 'COMMENT';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  userId: string;
  issueKey: string;
  issueTitle: string;
  action: 'CREATED' | 'UPDATED_STATUS' | 'COMMENTED' | 'ASSIGNED' | 'MOVED';
  detail: string;
  timestamp: string;
}
