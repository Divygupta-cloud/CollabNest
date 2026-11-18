import { Request } from 'express';

export type UserRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'TEAM_LEADER'
  | 'TEAM_LEAD'
  | 'DEVELOPER'
  | 'QA'
  | 'EMPLOYEE';

export interface AuthUserPayload {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  teamIds: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}
