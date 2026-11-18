import { Schema, model, Document, Types } from 'mongoose';

export interface IProject extends Document {
  _id: Types.ObjectId;
  name: string;
  key: string;
  description: string;
  leadId: Types.ObjectId;
  teamId?: Types.ObjectId;
  category: 'SOFTWARE' | 'OPERATIONS' | 'MARKETING' | 'BUSINESS';
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
  iconBgColor?: string;
  isStarred: boolean;
  nextIssueNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    key: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 10,
      match: /^[A-Z0-9]{2,10}$/,
      index: true,
    },
    description: { type: String, default: '' },
    leadId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', index: true },
    category: {
      type: String,
      enum: ['SOFTWARE', 'OPERATIONS', 'MARKETING', 'BUSINESS'],
      default: 'SOFTWARE',
    },
    status: {
      type: String,
      enum: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'],
      default: 'ACTIVE',
    },
    iconBgColor: { type: String, default: '#0C66E4' },
    isStarred: { type: Boolean, default: false },
    nextIssueNumber: { type: Number, default: 101 },
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

export const ProjectModel = model<IProject>('Project', projectSchema);
