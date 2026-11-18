import { CommentModel, IComment } from './model';
import { IssueModel } from '../issues/model';
import { ActivityModel } from '../activity/model';
import { NotificationModel } from '../notifications/model';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { Types } from 'mongoose';

export class CommentService {
  async getByIssue(issueId: string): Promise<IComment[]> {
    return CommentModel.find({ issueId })
      .populate('authorId', 'name username email avatarUrl role title')
      .sort({ createdAt: 1 });
  }

  async create(userId: string, issueId: string, content: string): Promise<IComment> {
    const issue = await IssueModel.findById(issueId);
    if (!issue) {
      throw new NotFoundError(`Issue not found with id ${issueId}`);
    }

    const comment = await CommentModel.create({
      issueId: new Types.ObjectId(issueId),
      authorId: new Types.ObjectId(userId),
      content,
    });

    await ActivityModel.create({
      actorId: new Types.ObjectId(userId),
      entityType: 'ISSUE',
      entityId: issueId,
      action: 'COMMENT_ADDED',
      newValue: content.slice(0, 80),
      metadata: { commentId: comment._id },
    });

    // Notify assignee and reporter
    const recipients = [issue.assigneeId?.toString(), issue.reporterId?.toString()].filter(
      (id): id is string => Boolean(id) && id !== userId
    );

    for (const recId of [...new Set(recipients)]) {
      await NotificationModel.create({
        recipientId: new Types.ObjectId(recId),
        type: 'COMMENT_ADDED',
        title: 'New Comment on Issue',
        message: `New comment on ${issue.issueKey}: "${content.slice(0, 50)}..."`,
        entityType: 'ISSUE',
        entityId: issueId,
        link: `/issue/${issue.issueKey}`,
      });
    }

    return (await CommentModel.findById(comment._id).populate(
      'authorId',
      'name username email avatarUrl role title'
    ))!;
  }

  async update(commentId: string, userId: string, userRole: string, content: string): Promise<IComment> {
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundError(`Comment not found with id ${commentId}`);
    }

    if (comment.authorId.toString() !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('You can only edit your own comments');
    }

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    return (await CommentModel.findById(comment._id).populate(
      'authorId',
      'name username email avatarUrl role title'
    ))!;
  }

  async delete(commentId: string, userId: string, userRole: string): Promise<void> {
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundError(`Comment not found with id ${commentId}`);
    }

    if (comment.authorId.toString() !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('You can only delete your own comments');
    }

    await CommentModel.findByIdAndDelete(commentId);
  }
}

export const commentService = new CommentService();
