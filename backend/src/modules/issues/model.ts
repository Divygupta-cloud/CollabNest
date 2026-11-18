import { Schema, model, Document, Types } from 'mongoose';

export type IssueType = 'EPIC' | 'STORY' | 'TASK' | 'BUG' | 'SUBTASK';
export type IssueStatus =
  | 'BACKLOG'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'DONE'
  | 'CANCELLED';
export type IssuePriority = 'HIGHEST' | 'HIGH' | 'MEDIUM' | 'LOW' | 'LOWEST';
export type AICategory =
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
export type AIStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ISubtask {
  id?: string;
  key: string;
  title: string;
  completed: boolean;
  assigneeId?: Types.ObjectId;
}

export interface IIssue extends Document {
  _id: Types.ObjectId;
  issueKey: string;
  projectId: Types.ObjectId;
  parentIssueId?: Types.ObjectId;
  sprintId?: Types.ObjectId | null;
  title: string;
  description: string;
  issueType: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  reporterId: Types.ObjectId;
  assigneeId?: Types.ObjectId;
  assigneeIds?: Types.ObjectId[];
  teamId?: Types.ObjectId;
  storyPoints?: number;
  labels: string[];
  subtasks: ISubtask[];
  rank: number;

  // AI Classification fields
  aiCategory?: AICategory;
  aiConfidence?: number;
  aiReason?: string;
  aiStatus: AIStatus;
  finalCategory?: AICategory;

  // Soft delete fields
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const subtaskSchema = new Schema<ISubtask>(
  {
    key: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: true }
);

const issueSchema = new Schema<IIssue>(
  {
    issueKey: { type: String, required: true, unique: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    parentIssueId: { type: Schema.Types.ObjectId, ref: 'Issue' },
    sprintId: { type: Schema.Types.ObjectId, ref: 'Sprint', default: null, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    issueType: {
      type: String,
      enum: ['EPIC', 'STORY', 'TASK', 'BUG', 'SUBTASK'],
      default: 'STORY',
      index: true,
    },
    status: {
      type: String,
      enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'],
      default: 'TODO',
      index: true,
    },
    priority: {
      type: String,
      enum: ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'],
      default: 'MEDIUM',
      index: true,
    },
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    assigneeIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', index: true },
    storyPoints: { type: Number },
    labels: [{ type: String, trim: true, lowercase: true }],
    subtasks: [subtaskSchema],
    rank: { type: Number, default: 0, index: true },

    aiCategory: {
      type: String,
      enum: ['Bug', 'feature', 'docuementation', 'Refactor', 'others', 'BUG', 'FEATURE', 'IMPROVEMENT', 'DOCUMENTATION', 'TASK', 'OTHER'],
      index: true,
    },
    aiConfidence: { type: Number },
    aiReason: { type: String },
    aiStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    finalCategory: {
      type: String,
      enum: ['Bug', 'feature', 'docuementation', 'Refactor', 'others', 'BUG', 'FEATURE', 'IMPROVEMENT', 'DOCUMENTATION', 'TASK', 'OTHER'],
      index: true,
    },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound text index for search
issueSchema.index({ title: 'text', description: 'text', issueKey: 'text' });

export const IssueModel = model<IIssue>('Issue', issueSchema);
