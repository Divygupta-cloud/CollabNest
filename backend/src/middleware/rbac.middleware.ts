import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { UserRole } from '../types/express';

export function normalizeRole(role: string): string {
  if (role === 'TEAM_LEAD') return 'TEAM_LEADER';
  if (role === 'DEVELOPER') return 'EMPLOYEE';
  return role;
}

export function isRoleAllowed(userRole?: string, ...allowedRolesArgs: (UserRole | UserRole[] | string | string[])[]): boolean {
  if (!userRole) return false;
  const allowed = allowedRolesArgs.flat().map((r) => normalizeRole(r));
  const normUserRole = normalizeRole(userRole);
  return allowed.includes(normUserRole);
}

export function requireRole(...args: (UserRole | UserRole[] | string | string[])[]) {
  const allowedRoles = args.flat();
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!isRoleAllowed(req.user.role, allowedRoles)) {
      return next(
        new ForbiddenError(
          `Access denied. Role ${req.user.role} does not have required permissions for this action.`
        )
      );
    }

    next();
  };
}


