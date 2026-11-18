import { Schema, model, Document, Types } from 'mongoose';

export interface IActivity extends Document {
  _id: Types.ObjectId;
  actorId: Types.ObjectId;
  entityType: 'ISSUE' | 'PROJECT' | 'TEAM' | 'USER' | 'COMMENT' | 'SPRINT';
  entityId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    entityType: {
      type: String,
      enum: ['ISSUE', 'PROJECT', 'TEAM', 'USER', 'COMMENT', 'SPRINT'],
      required: true,
      index: true,
    },
    entityId: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    oldValue: { type: String },
    newValue: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const ActivityModel = model<IActivity>('Activity', activitySchema);
