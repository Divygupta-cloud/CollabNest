import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType =
  | 'ISSUE_ASSIGNED'
  | 'ISSUE_STATUS_CHANGED'
  | 'COMMENT_ADDED'
  | 'MENTION'
  | 'TEAM_ASSIGNED'
  | 'TEAM_LEADER_ASSIGNED';

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipientId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'ISSUE_ASSIGNED',
        'ISSUE_STATUS_CHANGED',
        'COMMENT_ADDED',
        'MENTION',
        'TEAM_ASSIGNED',
        'TEAM_LEADER_ASSIGNED',
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    entityType: { type: String },
    entityId: { type: String },
    link: { type: String },
    isRead: { type: Boolean, default: false, index: true },
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

export const NotificationModel = model<INotification>('Notification', notificationSchema);
