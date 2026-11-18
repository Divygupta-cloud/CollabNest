import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { issueService } from './service';
import { IssueModel } from './model';
import { aiClassificationService } from '../ai/service';
import { sendSuccess, sendPaginated } from '../../utils/api-response';
import { parsePaginationParams } from '../../utils/pagination';

export class IssueController {
  async getAll(req: Request, res: Response): Promise<void> {
    const pagination = parsePaginationParams(req.query);
    const filter = {
      projectId: req.query.projectId as string | undefined,
      sprintId: req.query.sprintId as string | undefined,
      assigneeId: req.query.assigneeId as string | undefined,
      reporterId: req.query.reporterId as string | undefined,
      teamId: req.query.teamId as string | undefined,
      issueType: req.query.issueType as string | undefined,
      status: req.query.status as string | undefined,
      priority: req.query.priority as string | undefined,
      aiCategory: req.query.aiCategory as string | undefined,
      finalCategory: req.query.finalCategory as string | undefined,
      search: req.query.search as string | undefined,
    };

    const { issues, total } = await issueService.getAll(filter, pagination);
    sendPaginated(res, issues, total, pagination.page, pagination.limit);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const issue = await issueService.getById(req.params.id as string);
    sendSuccess(res, issue);
  }

  async getByKey(req: Request, res: Response): Promise<void> {
    const issue = await issueService.getByKey(req.params.key as string);
    sendSuccess(res, issue);
  }

  async create(req: Request, res: Response): Promise<void> {
    const issue = await issueService.create(req.user!.id, req.body, req.user!.role);
    sendSuccess(res, issue, 201);
  }

  async update(req: Request, res: Response): Promise<void> {
    const issue = await issueService.update(req.params.id as string, req.user!.id, req.body, req.user!.role);
    sendSuccess(res, issue);
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    const { status, rank, sprintId } = req.body;
    const issue = await issueService.updateStatus(
      req.params.id as string,
      req.user!.id,
      status,
      rank,
      sprintId,
      req.user!.role
    );
    sendSuccess(res, issue);
  }

  async overrideCategory(req: Request, res: Response): Promise<void> {
    const { category } = req.body;
    const issue = await issueService.overrideCategory(
      req.params.id as string,
      req.user!.id,
      category,
      req.user!.role
    );
    sendSuccess(res, issue);
  }

  async reclassify(req: Request, res: Response): Promise<void> {
    const result = await issueService.reclassify(req.params.id as string, req.user!.role);
    sendSuccess(res, result);
  }

  async aiClassify(req: Request, res: Response): Promise<void> {
    const { title, description, issueType, issueId, key } = req.body;
    if (issueType === 'EPIC') {
      res.status(400).json({
        success: false,
        error: { message: 'AI classification is only supported for Stories and Subtasks, not for Epics' },
      });
      return;
    }

    const result = await aiClassificationService.classifyTicket(title || '', description || '');

    // If an issueId or key exists in DB, update it asynchronously
    try {
      if (issueId && Types.ObjectId.isValid(issueId)) {
        await IssueModel.findByIdAndUpdate(issueId, {
          aiCategory: result.category,
          aiConfidence: result.confidence,
          aiReason: result.reason,
          aiStatus: 'COMPLETED',
          finalCategory: result.category,
        });
      } else if (key) {
        await IssueModel.findOneAndUpdate(
          { issueKey: key.toUpperCase() },
          {
            aiCategory: result.category,
            aiConfidence: result.confidence,
            aiReason: result.reason,
            aiStatus: 'COMPLETED',
            finalCategory: result.category,
          }
        );
      }
    } catch {
      // Non-fatal if local mock issue key does not exist in MongoDB
    }

    sendSuccess(res, result);
  }

  async delete(req: Request, res: Response): Promise<void> {
    await issueService.delete(req.params.id as string, req.user!.id, req.user!.role);
    sendSuccess(res, { message: 'Issue deleted successfully' });
  }

}

export const issueController = new IssueController();
