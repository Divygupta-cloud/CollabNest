/**
 * Workflow Engine
 *
 * Defines valid status transitions per issue type.
 * Both the frontend (drag-drop guard) and backend service layer use this.
 *
 * Bug flow:     TODO → IN_PROGRESS → IN_REVIEW → QA_TESTING → DONE
 *                                              QA_TESTING → IN_PROGRESS (reject)
 *
 * Story/Task:   TODO → IN_PROGRESS → IN_REVIEW → DONE
 *               (QA_TESTING allowed but optional)
 *
 * Subtask:      TODO → IN_PROGRESS → DONE
 */

import { IssueType, IssueStatus } from '../types';

// Map of: fromStatus → array of valid toStatuses
export type TransitionMap = Record<IssueStatus, IssueStatus[]>;

const BUG_TRANSITIONS: Partial<TransitionMap> = {
  TODO:         ['IN_PROGRESS', 'BACKLOG'],
  IN_PROGRESS:  ['TODO', 'IN_REVIEW', 'DONE'],
  IN_REVIEW:    ['IN_PROGRESS', 'QA_TESTING', 'DONE'],
  QA_TESTING:   ['DONE', 'IN_PROGRESS'],   // pass → DONE, reject → IN_PROGRESS
  DONE:         ['IN_PROGRESS', 'TODO'],
  BACKLOG:      ['TODO', 'IN_PROGRESS'],
  CANCELLED:    ['TODO'],
};

const STORY_TASK_TRANSITIONS: Partial<TransitionMap> = {
  TODO:         ['IN_PROGRESS', 'BACKLOG'],
  IN_PROGRESS:  ['TODO', 'IN_REVIEW', 'QA_TESTING', 'DONE'],
  IN_REVIEW:    ['IN_PROGRESS', 'QA_TESTING', 'DONE'],
  QA_TESTING:   ['DONE', 'IN_PROGRESS'],
  DONE:         ['IN_PROGRESS', 'TODO'],
  BACKLOG:      ['TODO', 'IN_PROGRESS'],
  CANCELLED:    ['TODO'],
};

const SUBTASK_TRANSITIONS: Partial<TransitionMap> = {
  TODO:         ['IN_PROGRESS', 'DONE'],
  IN_PROGRESS:  ['TODO', 'IN_REVIEW', 'DONE'],
  IN_REVIEW:    ['IN_PROGRESS', 'DONE'],
  DONE:         ['IN_PROGRESS', 'TODO'],
  BACKLOG:      ['TODO'],
  CANCELLED:    ['TODO'],
};

// For board display: the ordered board columns (left → right)
export const BOARD_COLUMNS: { status: IssueStatus; label: string }[] = [
  { status: 'TODO',        label: 'TO DO' },
  { status: 'IN_PROGRESS', label: 'IN PROGRESS' },
  { status: 'IN_REVIEW',   label: 'IN REVIEW' },
  { status: 'QA_TESTING',  label: 'QA TESTING' },
  { status: 'DONE',        label: 'DONE' },
];

// All statuses shown on the board (excludes BACKLOG and CANCELLED)
export const BOARD_STATUSES = BOARD_COLUMNS.map((c) => c.status);

/**
 * Returns valid target statuses for an issue type + current status.
 * If the transition is unconfigured, allow all board statuses (permissive fallback).
 */
export function getAllowedTransitions(
  issueType: IssueType,
  currentStatus: IssueStatus
): IssueStatus[] {
  let map: Partial<TransitionMap>;

  switch (issueType) {
    case 'BUG':
      map = BUG_TRANSITIONS;
      break;
    case 'SUBTASK':
      map = SUBTASK_TRANSITIONS;
      break;
    default:
      map = STORY_TASK_TRANSITIONS;
  }

  return map[currentStatus] ?? BOARD_STATUSES;
}

/**
 * Returns true if the transition from → to is valid for the given issue type.
 * Admins/Managers bypass workflow restrictions.
 */
export function isValidTransition(
  issueType: IssueType,
  from: IssueStatus,
  to: IssueStatus,
  bypassWorkflow = false
): boolean {
  if (bypassWorkflow) return true;
  if (from === to) return false;
  const allowed = getAllowedTransitions(issueType, from);
  return allowed.includes(to);
}

/**
 * Column styling metadata.
 */
export const COLUMN_META: Record<
  IssueStatus,
  { accent: string; accentBg: string; headerColor: string }
> = {
  BACKLOG:     { accent: '#738496', accentBg: 'rgba(115, 132, 150, 0.1)', headerColor: '#738496' },
  TODO:        { accent: '#9FADBC', accentBg: 'rgba(159, 173, 188, 0.08)', headerColor: '#9FADBC' },
  IN_PROGRESS: { accent: '#579DFF', accentBg: 'rgba(87, 157, 255, 0.08)', headerColor: '#579DFF' },
  IN_REVIEW:   { accent: '#C084FC', accentBg: 'rgba(192, 132, 252, 0.08)', headerColor: '#C084FC' },
  QA_TESTING:  { accent: '#FBBF24', accentBg: 'rgba(251, 191, 36, 0.08)', headerColor: '#FBBF24' },
  DONE:        { accent: '#22A06B', accentBg: 'rgba(34, 160, 107, 0.08)', headerColor: '#22A06B' },
  CANCELLED:   { accent: '#F87171', accentBg: 'rgba(248, 113, 113, 0.08)', headerColor: '#F87171' },
};

/**
 * Color/label metadata per issue type (for type badge on card).
 */
export const ISSUE_TYPE_META: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  EPIC:    { label: 'EPIC',    color: '#B8ACF6', bg: 'rgba(184, 172, 246, 0.15)', border: 'rgba(184, 172, 246, 0.3)' },
  STORY:   { label: 'STORY',   color: '#4CADE6', bg: 'rgba(76, 173, 230, 0.15)', border: 'rgba(76, 173, 230, 0.3)' },
  TASK:    { label: 'TASK',    color: '#579DFF', bg: 'rgba(87, 157, 255, 0.15)', border: 'rgba(87, 157, 255, 0.3)' },
  BUG:     { label: 'BUG',     color: '#F87171', bg: 'rgba(248, 113, 113, 0.15)', border: 'rgba(248, 113, 113, 0.3)' },
  SUBTASK: { label: 'SUBTASK', color: '#9FADBC', bg: 'rgba(159, 173, 188, 0.1)', border: 'rgba(159, 173, 188, 0.2)' },
};
