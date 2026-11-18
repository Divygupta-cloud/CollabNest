import { Schema, model, Document, Types } from 'mongoose';

export interface ITeam extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  leaderId: Types.ObjectId;
  memberIds: Types.ObjectId[];
  projectIds: Types.ObjectId[];
  department: string;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: '' },
    leaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    memberIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    projectIds: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    department: { type: String, default: 'Engineering' },
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

export const TeamModel = model<ITeam>('Team', teamSchema);
