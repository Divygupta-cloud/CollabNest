import { Request, Response, NextFunction } from 'express';
import { teamService } from './service';
import { sendSuccess } from '../../utils/api-response';

export class TeamController {
  async listTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const teams = await teamService.listTeams();
      return sendSuccess(res, teams, 200);
    } catch (err) {
      next(err);
    }
  }

  async getTeamById(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await teamService.getTeamById(req.params.id as string);
      return sendSuccess(res, team, 200);
    } catch (err) {
      next(err);
    }
  }

  async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await teamService.createTeam(req.body, req.user!.id);
      return sendSuccess(res, team, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await teamService.updateTeam(
        req.params.id as string,
        req.body,
        req.user!.id,
        req.user!.role
      );
      return sendSuccess(res, team, 200);
    } catch (err) {
      next(err);
    }
  }

  async assignLeader(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await teamService.assignLeader(req.params.id as string, req.body.leaderId, req.user!.id);
      return sendSuccess(res, team, 200);
    } catch (err) {
      next(err);
    }
  }

  async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await teamService.addMember(
        req.params.id as string,
        req.body.userId,
        req.user!.id,
        req.user!.role
      );
      return sendSuccess(res, team, 200);
    } catch (err) {
      next(err);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await teamService.removeMember(
        req.params.id as string,
        req.params.userId as string,
        req.user!.id,
        req.user!.role
      );
      return sendSuccess(res, team, 200);
    } catch (err) {
      next(err);
    }
  }

}

export const teamController = new TeamController();
