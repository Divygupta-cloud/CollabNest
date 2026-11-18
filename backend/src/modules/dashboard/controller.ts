import { Request, Response } from 'express';
import { dashboardService } from './service';
import { sendSuccess } from '../../utils/api-response';

export class DashboardController {
  async getMetrics(req: Request, res: Response): Promise<void> {
    const dashboardData = await dashboardService.getDashboardForUser({
      id: req.user!.id,
      role: req.user!.role,
    });
    sendSuccess(res, dashboardData);
  }
}

export const dashboardController = new DashboardController();
