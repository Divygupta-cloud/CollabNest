/**
 * Role-Based Access Control (RBAC) Engine
 *
 * This is the single source of truth for all permission logic in CollabNest.
 * UI components AND service-layer mutations must consult this before acting.
 *
 * Roles (from UserRole in types/index.ts):
 *   ADMIN | MANAGER | TEAM_LEAD | DEVELOPER | QA
 */

import { useMemo } from 'react';
import { UserRole, User } from '../types';
import { useCurrentUser } from './auth.service';

// ---------------------------------------------------------------------------
// Permission Catalogue
// ---------------------------------------------------------------------------

export type Permission =
  // ── User & System ──────────────────────────────────────────────────────
  | 'MANAGE_USERS'            // View + create + edit + deactivate users
  | 'VIEW_ALL_USERS'          // Read user list / profiles
  | 'VIEW_SYSTEM_SETTINGS'    // Access system settings page
  | 'EDIT_SYSTEM_SETTINGS'    // Modify system-level settings

  // ── Projects ────────────────────────────────────────────────────────────
  | 'CREATE_PROJECT'           // Create a new project
  | 'EDIT_PROJECT'             // Edit project metadata
  | 'DELETE_PROJECT'           // Archive / delete a project
  | 'VIEW_PROJECT_SETTINGS'    // Access project settings tab
  | 'MANAGE_PROJECT_MEMBERS'   // Add / remove project members

  // ── Teams ───────────────────────────────────────────────────────────────
  | 'CREATE_TEAM'              // Create a new team
  | 'EDIT_TEAM'                // Edit team metadata
  | 'DELETE_TEAM'              // Delete a team
  | 'MANAGE_TEAM_MEMBERS'      // Add / remove team members

  // ── Epics ───────────────────────────────────────────────────────────────
  | 'CREATE_EPIC'              // Create an epic
  | 'EDIT_EPIC'                // Edit an epic
  | 'DELETE_EPIC'              // Delete an epic

  // ── Sprints ─────────────────────────────────────────────────────────────
  | 'CREATE_SPRINT'            // Create a sprint
  | 'START_SPRINT'             // Start (activate) a sprint
  | 'CLOSE_SPRINT'             // Close a sprint
  | 'EDIT_SPRINT'              // Edit sprint dates / goals
  | 'MOVE_ISSUES_TO_SPRINT'    // Drag issues between backlog and sprint

  // ── Issues ──────────────────────────────────────────────────────────────
  | 'CREATE_ISSUE'             // Create stories, tasks, bugs
  | 'EDIT_ANY_ISSUE'           // Edit issues created by others
  | 'EDIT_OWN_ISSUE'           // Edit issues the user created / is assigned
  | 'DELETE_ISSUE'             // Delete issues
  | 'ASSIGN_ISSUE'             // Change the assignee field
  | 'CHANGE_ISSUE_STATUS'      // Move issues across board columns
  | 'CREATE_SUBTASK'           // Add sub-tasks to a parent issue
  | 'LINK_ISSUES'              // Create issue links

  // ── Comments ────────────────────────────────────────────────────────────
  | 'ADD_COMMENT'              // Post a comment (all authenticated users)
  | 'DELETE_OWN_COMMENT'       // Delete own comments
  | 'DELETE_ANY_COMMENT'       // Delete anyone's comment

  // ── AI Features ─────────────────────────────────────────────────────────
  | 'VIEW_AI_ANALYSIS'         // See AI classification badges
  | 'APPLY_AI_SUGGESTIONS';    // Apply / dismiss AI recommendations

// ---------------------------------------------------------------------------
// Role to Permission Matrix
// ---------------------------------------------------------------------------

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  ADMIN: [
    'MANAGE_USERS', 'VIEW_ALL_USERS',
    'VIEW_SYSTEM_SETTINGS', 'EDIT_SYSTEM_SETTINGS',
    'CREATE_PROJECT', 'EDIT_PROJECT', 'DELETE_PROJECT',
    'VIEW_PROJECT_SETTINGS', 'MANAGE_PROJECT_MEMBERS',
    'CREATE_TEAM', 'EDIT_TEAM', 'DELETE_TEAM', 'MANAGE_TEAM_MEMBERS',
    'CREATE_EPIC', 'EDIT_EPIC', 'DELETE_EPIC',
    'CREATE_SPRINT', 'START_SPRINT', 'CLOSE_SPRINT', 'EDIT_SPRINT', 'MOVE_ISSUES_TO_SPRINT',
    'CREATE_ISSUE', 'EDIT_ANY_ISSUE', 'EDIT_OWN_ISSUE', 'DELETE_ISSUE',
    'ASSIGN_ISSUE', 'CHANGE_ISSUE_STATUS', 'CREATE_SUBTASK', 'LINK_ISSUES',
    'ADD_COMMENT', 'DELETE_OWN_COMMENT', 'DELETE_ANY_COMMENT',
    'VIEW_AI_ANALYSIS', 'APPLY_AI_SUGGESTIONS',
  ],

  MANAGER: [
    'VIEW_ALL_USERS',
    'CREATE_PROJECT', 'EDIT_PROJECT',
    'VIEW_PROJECT_SETTINGS', 'MANAGE_PROJECT_MEMBERS',
    'MANAGE_TEAM_MEMBERS',
    'CREATE_EPIC', 'EDIT_EPIC', 'DELETE_EPIC',
    'CREATE_SPRINT', 'START_SPRINT', 'CLOSE_SPRINT', 'EDIT_SPRINT', 'MOVE_ISSUES_TO_SPRINT',
    'CREATE_ISSUE', 'EDIT_ANY_ISSUE', 'EDIT_OWN_ISSUE', 'DELETE_ISSUE',
    'ASSIGN_ISSUE', 'CHANGE_ISSUE_STATUS', 'CREATE_SUBTASK', 'LINK_ISSUES',
    'ADD_COMMENT', 'DELETE_OWN_COMMENT', 'DELETE_ANY_COMMENT',
    'VIEW_AI_ANALYSIS', 'APPLY_AI_SUGGESTIONS',
  ],

  TEAM_LEAD: [
    'VIEW_ALL_USERS',
    'EDIT_TEAM', 'MANAGE_TEAM_MEMBERS',
    'CREATE_EPIC', 'EDIT_EPIC',
    'EDIT_SPRINT', 'MOVE_ISSUES_TO_SPRINT',
    'CREATE_ISSUE', 'EDIT_ANY_ISSUE', 'EDIT_OWN_ISSUE', 'DELETE_ISSUE',
    'ASSIGN_ISSUE', 'CHANGE_ISSUE_STATUS', 'CREATE_SUBTASK', 'LINK_ISSUES',
    'ADD_COMMENT', 'DELETE_OWN_COMMENT',
    'VIEW_AI_ANALYSIS', 'APPLY_AI_SUGGESTIONS',
  ],

  DEVELOPER: [
    'CREATE_ISSUE',       // Can create stories, tasks, bugs (not epics — guarded separately)
    'EDIT_OWN_ISSUE',
    'CHANGE_ISSUE_STATUS',
    'CREATE_SUBTASK',
    'ADD_COMMENT', 'DELETE_OWN_COMMENT',
    'VIEW_AI_ANALYSIS',
  ],

  QA: [
    'CREATE_ISSUE',
    'EDIT_OWN_ISSUE',
    'CHANGE_ISSUE_STATUS',
    'LINK_ISSUES',
    'ADD_COMMENT', 'DELETE_OWN_COMMENT',
    'VIEW_AI_ANALYSIS',
  ],
};

// ---------------------------------------------------------------------------
// Core permission check
// ---------------------------------------------------------------------------

/**
 * Synchronous, pure function - safe to call from services or components.
 *
 * @param user   The user whose permissions to check
 * @param action The permission being requested
 * @returns      true if the user's role grants this permission
 */
export function can(user: User | null | undefined, action: Permission): boolean {
  if (!user) return false;
  const allowed = ROLE_PERMISSIONS[user.role] ?? [];
  return (allowed as Permission[]).includes(action);
}

/**
 * Throws a 403-style error if the current user lacks the given permission.
 * Call this at the top of service-layer mutators that need server-side enforcement.
 */
export function requirePermission(user: User | null | undefined, action: Permission): void {
  if (!can(user, action)) {
    const role = user?.role ?? 'UNKNOWN';
    throw new Error(
      `[RBAC] 403 Forbidden - role "${role}" does not have permission "${action}".`
    );
  }
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

export interface PermissionsHook {
  /** The currently authenticated user */
  currentUser: User;
  /** Check a single permission */
  can: (action: Permission) => boolean;
  /** Check that ALL of the supplied permissions are granted */
  canAll: (...actions: Permission[]) => boolean;
  /** Check that AT LEAST ONE of the supplied permissions is granted */
  canAny: (...actions: Permission[]) => boolean;
  /** The set of all permissions for this user (for debugging) */
  allPermissions: readonly Permission[];
}

export function usePermissions(): PermissionsHook {
  const currentUser = useCurrentUser();

  return useMemo<PermissionsHook>(() => {
    const allPermissions = ROLE_PERMISSIONS[currentUser.role] ?? [];

    return {
      currentUser,
      can: (action: Permission) => (allPermissions as Permission[]).includes(action),
      canAll: (...actions: Permission[]) =>
        actions.every((a) => (allPermissions as Permission[]).includes(a)),
      canAny: (...actions: Permission[]) =>
        actions.some((a) => (allPermissions as Permission[]).includes(a)),
      allPermissions,
    };
  }, [currentUser]);
}

// ---------------------------------------------------------------------------
// Role metadata helpers (labels, colours, descriptions)
// ---------------------------------------------------------------------------

export interface RoleMeta {
  label: string;
  description: string;
  color: string;
  bg: string;
  border: string;
}

export const ROLE_META: Record<UserRole, RoleMeta> = {
  ADMIN: {
    label: 'Admin',
    description: 'Full system access',
    color: '#F87171',
    bg: 'rgba(248, 113, 113, 0.15)',
    border: 'rgba(248, 113, 113, 0.3)',
  },
  MANAGER: {
    label: 'Project Manager',
    description: 'Manage projects & sprints',
    color: '#34D399',
    bg: 'rgba(52, 211, 153, 0.15)',
    border: 'rgba(52, 211, 153, 0.3)',
  },
  TEAM_LEAD: {
    label: 'Team Lead',
    description: 'Lead team & assign issues',
    color: '#C084FC',
    bg: 'rgba(192, 132, 252, 0.15)',
    border: 'rgba(192, 132, 252, 0.3)',
  },
  DEVELOPER: {
    label: 'Developer',
    description: 'Work on assigned issues',
    color: '#60A5FA',
    bg: 'rgba(96, 165, 250, 0.15)',
    border: 'rgba(96, 165, 250, 0.3)',
  },
  QA: {
    label: 'QA Engineer',
    description: 'Test & file bug reports',
    color: '#FBBF24',
    bg: 'rgba(251, 191, 36, 0.15)',
    border: 'rgba(251, 191, 36, 0.3)',
  },
};
