/**
 * RBAC compatibility layer
 *
 * This file previously contained standalone role-checking functions.
 * It now delegates entirely to the centralized RBAC engine at:
 *   src/services/rbac.ts
 *
 * Existing callers (pages, modals, etc.) continue to work without modification.
 * New code should import directly from '../../services/rbac' and use `can()` or `usePermissions()`.
 */

import { User, UserRole, IssueType } from '../types';
import { can, ROLE_META } from '../services/rbac';

// ─── Role predicates ─────────────────────────────────────────────────────────

export function isUserAdmin(user?: User | null): boolean {
  return user?.role === 'ADMIN';
}

export function isUserManager(user?: User | null): boolean {
  return user?.role === 'MANAGER';
}

export function isUserTeamLead(user?: User | null): boolean {
  return user?.role === 'TEAM_LEAD';
}

export function isUserDeveloper(user?: User | null): boolean {
  return user?.role === 'DEVELOPER';
}

export function isUserQA(user?: User | null): boolean {
  return user?.role === 'QA';
}

// ─── Semantic helpers (delegating to RBAC engine) ────────────────────────────

export function canCreateEpic(user?: User | null): boolean {
  return can(user, 'CREATE_EPIC');
}

export function canAssignEpic(user?: User | null): boolean {
  return can(user, 'ASSIGN_ISSUE');
}

export function canCreateTeam(user?: User | null): boolean {
  return can(user, 'CREATE_TEAM');
}

export function canAssignTeamLeader(user?: User | null): boolean {
  return can(user, 'MANAGE_TEAM_MEMBERS');
}

export function canManageTeamMembers(user?: User | null, _teamLeadId?: string): boolean {
  return can(user, 'MANAGE_TEAM_MEMBERS');
}

export function canManageSprints(user?: User | null): boolean {
  // Team Lead can edit sprints and move issues; Manager/Admin can create/start/close
  return can(user, 'EDIT_SPRINT') || can(user, 'CREATE_SPRINT');
}

export function canDeleteIssue(user?: User | null): boolean {
  return can(user, 'DELETE_ISSUE');
}

export function canDeleteProject(user?: User | null): boolean {
  return can(user, 'DELETE_PROJECT');
}

export function canCreateProject(user?: User | null): boolean {
  return can(user, 'CREATE_PROJECT');
}

export function canManageUsers(user?: User | null): boolean {
  return can(user, 'MANAGE_USERS');
}

export function canOverrideAI(user?: User | null): boolean {
  return can(user, 'APPLY_AI_SUGGESTIONS');
}

export function canAssignIssue(user?: User | null): boolean {
  return can(user, 'ASSIGN_ISSUE');
}

export function canChangeIssueStatus(user?: User | null): boolean {
  return can(user, 'CHANGE_ISSUE_STATUS');
}

export function canCreateIssue(user?: User | null): boolean {
  return can(user, 'CREATE_ISSUE');
}

/**
 * Returns the permitted issue types for a user role.
 * - Admin, Manager, Team Lead: [EPIC, STORY, TASK, BUG]
 * - Developer: [STORY, TASK, BUG]
 * - QA: [BUG, TASK]
 */
export function getAllowedIssueTypes(user?: User | null): IssueType[] {
  if (!user) return ['STORY', 'TASK', 'BUG'];
  if (can(user, 'CREATE_EPIC')) {
    return ['EPIC', 'STORY', 'TASK', 'BUG'];
  }
  if (user.role === 'QA') {
    return ['BUG', 'TASK'];
  }
  return ['STORY', 'TASK', 'BUG'];
}

/**
 * Visual badge styling helper for role indicators.
 * Now delegates to the ROLE_META constants from the RBAC engine.
 */
export function getRoleBadge(role?: UserRole): {
  label: string;
  bg: string;
  text: string;
  border: string;
} {
  if (!role) {
    return {
      label: 'Developer',
      bg: 'rgba(96, 165, 250, 0.15)',
      text: '#60A5FA',
      border: 'rgba(96, 165, 250, 0.3)',
    };
  }
  const meta = ROLE_META[role];
  return {
    label: meta.label,
    bg: meta.bg,
    text: meta.color,
    border: meta.border,
  };
}
