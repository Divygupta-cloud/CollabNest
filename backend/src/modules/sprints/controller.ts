import { Request, Response } from 'express';
import { sprintService } from './service';
import { sendSuccess } from '../../utils/api-response';

export class SprintController {
  async getByProject(req: Request, res: Response): Promise<void> {
    const projectId = (req.params.projectId || req.query.projectId) as string;
    const sprints = await sprintService.getSprintsByProject(projectId);
    sendSuccess(res, sprints);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const sprint = await sprintService.getSprintById(req.params.id as string);
    sendSuccess(res, sprint);
  }

  async create(req: Request, res: Response): Promise<void> {
    const sprint = await sprintService.createSprint(req.body);
    sendSuccess(res, sprint, 201);
  }

  async update(req: Request, res: Response): Promise<void> {
    const sprint = await sprintService.updateSprint(req.params.id as string, req.body);
    sendSuccess(res, sprint);
  }

  async start(req: Request, res: Response): Promise<void> {
    const sprint = await sprintService.startSprint(req.params.id as string, req.body);
    sendSuccess(res, sprint);
  }

  async complete(req: Request, res: Response): Promise<void> {
    const sprint = await sprintService.completeSprint(req.params.id as string, req.body.targetSprintId);
    sendSuccess(res, sprint);
  }

  async delete(req: Request, res: Response): Promise<void> {
    await sprintService.deleteSprint(req.params.id as string);
    sendSuccess(res, { message: 'Sprint deleted successfully' });
  }

  async addIssues(req: Request, res: Response): Promise<void> {
    const sprint = await sprintService.addIssuesToSprint(req.params.id as string, req.body.issueIds);
    sendSuccess(res, sprint);
  }

  async removeIssues(req: Request, res: Response): Promise<void> {
    const sprint = await sprintService.removeIssuesFromSprint(req.params.id as string, req.body.issueIds);
    sendSuccess(res, sprint);
  }

}

export const sprintController = new SprintController();
