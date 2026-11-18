import { Schema, model, Document, Types } from 'mongoose';

export type SprintStatus = 'FUTURE' | 'ACTIVE' | 'COMPLETED';

export interface ISprint extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  name: string;
  goal?: string;
  startDate?: Date;
  endDate?: Date;
  status: SprintStatus;
  issueIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const sprintSchema = new Schema<ISprint>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    name: { type: String, required: true, trim: true },
    goal: { type: String, default: '' },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ['FUTURE', 'ACTIVE', 'COMPLETED'],
      default: 'FUTURE',
      index: true,
    },
    issueIds: [{ type: Schema.Types.ObjectId, ref: 'Issue' }],
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

export const SprintModel = model<ISprint>('Sprint', sprintSchema);
