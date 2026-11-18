"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentService = exports.CommentService = void 0;
const model_1 = require("./model");
const model_2 = require("../issues/model");
const model_3 = require("../activity/model");
const model_4 = require("../notifications/model");
const errors_1 = require("../../utils/errors");
const mongoose_1 = require("mongoose");
class CommentService {
    async getByIssue(issueId) {
        return model_1.CommentModel.find({ issueId })
            .populate('authorId', 'name username email avatarUrl role title')
            .sort({ createdAt: 1 });
    }
    async create(userId, issueId, content) {
        const issue = await model_2.IssueModel.findById(issueId);
        if (!issue) {
            throw new errors_1.NotFoundError(`Issue not found with id ${issueId}`);
        }
        const comment = await model_1.CommentModel.create({
            issueId: new mongoose_1.Types.ObjectId(issueId),
            authorId: new mongoose_1.Types.ObjectId(userId),
            content,
        });
        await model_3.ActivityModel.create({
            actorId: new mongoose_1.Types.ObjectId(userId),
            entityType: 'ISSUE',
            entityId: issueId,
            action: 'COMMENT_ADDED',
            newValue: content.slice(0, 80),
            metadata: { commentId: comment._id },
        });
        // Notify assignee and reporter
        const recipients = [issue.assigneeId?.toString(), issue.reporterId?.toString()].filter((id) => Boolean(id) && id !== userId);
        for (const recId of [...new Set(recipients)]) {
            await model_4.NotificationModel.create({
                recipientId: new mongoose_1.Types.ObjectId(recId),
                type: 'COMMENT_ADDED',
                title: 'New Comment on Issue',
                message: `New comment on ${issue.issueKey}: "${content.slice(0, 50)}..."`,
                entityType: 'ISSUE',
                entityId: issueId,
                link: `/issue/${issue.issueKey}`,
            });
        }
        return (await model_1.CommentModel.findById(comment._id).populate('authorId', 'name username email avatarUrl role title'));
    }
    async update(commentId, userId, userRole, content) {
        const comment = await model_1.CommentModel.findById(commentId);
        if (!comment) {
            throw new errors_1.NotFoundError(`Comment not found with id ${commentId}`);
        }
        if (comment.authorId.toString() !== userId && userRole !== 'ADMIN') {
            throw new errors_1.ForbiddenError('You can only edit your own comments');
        }
        comment.content = content;
        comment.isEdited = true;
        await comment.save();
        return (await model_1.CommentModel.findById(comment._id).populate('authorId', 'name username email avatarUrl role title'));
    }
    async delete(commentId, userId, userRole) {
        const comment = await model_1.CommentModel.findById(commentId);
        if (!comment) {
            throw new errors_1.NotFoundError(`Comment not found with id ${commentId}`);
        }
        if (comment.authorId.toString() !== userId && userRole !== 'ADMIN') {
            throw new errors_1.ForbiddenError('You can only delete your own comments');
        }
        await model_1.CommentModel.findByIdAndDelete(commentId);
    }
}
exports.CommentService = CommentService;
exports.commentService = new CommentService();
