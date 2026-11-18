import { Request, Response } from 'express';
import { projectService } from './service';
import { sendSuccess } from '../../utils/api-response';

export class ProjectController {
  async getAll(req: Request, res: Response): Promise<void> {
    const filter: Record<string, any> = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.leadId) filter.leadId = req.query.leadId;
    if (req.query.teamId) filter.teamId = req.query.teamId;

    const projects = await projectService.getAllProjects(filter);
    sendSuccess(res, projects);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const project = await projectService.getProjectById(req.params.id as string);
    sendSuccess(res, project);
  }

  async getByKey(req: Request, res: Response): Promise<void> {
    const project = await projectService.getProjectByKey(req.params.key as string);
    sendSuccess(res, project);
  }

  async create(req: Request, res: Response): Promise<void> {
    const project = await projectService.createProject(req.body);
    sendSuccess(res, project, 201);
  }

  async update(req: Request, res: Response): Promise<void> {
    const project = await projectService.updateProject(req.params.id as string, req.body);
    sendSuccess(res, project);
  }

  async delete(req: Request, res: Response): Promise<void> {
    await projectService.deleteProject(req.params.id as string);
    sendSuccess(res, { message: 'Project deleted successfully' });
  }

  async getBoard(req: Request, res: Response): Promise<void> {
    const sprintId = req.query.sprintId as string | undefined;
    const board = await projectService.getProjectBoard(req.params.idOrKey as string, sprintId);
    sendSuccess(res, board);
  }

}

export const projectController = new ProjectController();
