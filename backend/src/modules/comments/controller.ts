import { Request, Response } from 'express';
import { commentService } from './service';
import { sendSuccess } from '../../utils/api-response';

export class CommentController {
  async getByIssue(req: Request, res: Response): Promise<void> {
    const comments = await commentService.getByIssue(req.params.issueId as string);
    sendSuccess(res, comments);
  }

  async create(req: Request, res: Response): Promise<void> {
    const comment = await commentService.create(
      req.user!.id,
      req.body.issueId,
      req.body.content
    );
    sendSuccess(res, comment, 201);
  }

  async update(req: Request, res: Response): Promise<void> {
    const comment = await commentService.update(
      req.params.id as string,
      req.user!.id,
      req.user!.role,
      req.body.content
    );
    sendSuccess(res, comment);
  }

  async delete(req: Request, res: Response): Promise<void> {
    await commentService.delete(req.params.id as string, req.user!.id, req.user!.role);
    sendSuccess(res, { message: 'Comment deleted successfully' });
  }

}

export const commentController = new CommentController();
