import { Schema, model, Document, Types } from 'mongoose';
import { UserRole } from '../../types/express';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  teamIds: Types.ObjectId[];
  title?: string;
  department?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: [
        'ADMIN',
        'MANAGER',
        'TEAM_LEADER',
        'TEAM_LEAD',
        'DEVELOPER',
        'QA',
        'EMPLOYEE',
      ],
      default: 'EMPLOYEE',
      index: true,
    },
    teamIds: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
    title: { type: String, default: 'Software Engineer' },
    department: { type: String, default: 'Engineering' },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.passwordHash;
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const UserModel = model<IUser>('User', userSchema);
