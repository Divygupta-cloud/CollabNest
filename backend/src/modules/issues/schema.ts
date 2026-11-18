import { z } from 'zod';

export const createIssueSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional().default(''),
  issueType: z.enum(['EPIC', 'STORY', 'TASK', 'BUG', 'SUBTASK']).default('STORY'),
  status: z
    .enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'])
    .default('TODO'),
  priority: z.enum(['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST']).default('MEDIUM'),
  assigneeId: z.string().optional().nullable(),
  assigneeIds: z.array(z.string()).optional(),
  sprintId: z.string().optional().nullable(),
  teamId: z.string().optional().nullable(),
  parentIssueId: z.string().optional().nullable(),
  storyPoints: z.number().min(0).optional(),
  labels: z.array(z.string()).optional().default([]),
  rank: z.number().optional(),
});

export const updateIssueSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  issueType: z.enum(['EPIC', 'STORY', 'TASK', 'BUG', 'SUBTASK']).optional(),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']).optional(),
  priority: z.enum(['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST']).optional(),
  assigneeId: z.string().optional().nullable(),
  assigneeIds: z.array(z.string()).optional(),
  sprintId: z.string().optional().nullable(),
  teamId: z.string().optional().nullable(),
  parentIssueId: z.string().optional().nullable(),
  storyPoints: z.number().min(0).optional().nullable(),
  labels: z.array(z.string()).optional(),
  rank: z.number().optional(),
  finalCategory: z
    .enum(['Bug', 'feature', 'docuementation', 'Refactor', 'others', 'BUG', 'FEATURE', 'IMPROVEMENT', 'DOCUMENTATION', 'TASK', 'OTHER'])
    .optional(),
  subtasks: z
    .array(
      z.object({
        key: z.string(),
        title: z.string(),
        completed: z.boolean().default(false),
        assigneeId: z.string().optional().nullable(),
      })
    )
    .optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']),
  rank: z.number().optional(),
  sprintId: z.string().optional().nullable(),
});

export const overrideCategorySchema = z.object({
  category: z.enum(['Bug', 'feature', 'docuementation', 'Refactor', 'others', 'BUG', 'FEATURE', 'IMPROVEMENT', 'DOCUMENTATION', 'TASK', 'OTHER']),
});
