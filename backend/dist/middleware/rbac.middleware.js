"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeRole = normalizeRole;
exports.isRoleAllowed = isRoleAllowed;
exports.requireRole = requireRole;
const errors_1 = require("../utils/errors");
function normalizeRole(role) {
    if (role === 'TEAM_LEAD')
        return 'TEAM_LEADER';
    if (role === 'DEVELOPER')
        return 'EMPLOYEE';
    return role;
}
function isRoleAllowed(userRole, ...allowedRolesArgs) {
    if (!userRole)
        return false;
    const allowed = allowedRolesArgs.flat().map((r) => normalizeRole(r));
    const normUserRole = normalizeRole(userRole);
    return allowed.includes(normUserRole);
}
function requireRole(...args) {
    const allowedRoles = args.flat();
    return (req, res, next) => {
        if (!req.user) {
            return next(new errors_1.UnauthorizedError('Authentication required'));
        }
        if (!isRoleAllowed(req.user.role, allowedRoles)) {
            return next(new errors_1.ForbiddenError(`Access denied. Role ${req.user.role} does not have required permissions for this action.`));
        }
        next();
    };
}
