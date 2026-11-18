import { z } from 'zod';

export const createSprintSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  name: z.string().min(2, 'Sprint name must be at least 2 characters'),
  goal: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updateSprintSchema = z.object({
  name: z.string().min(2).optional(),
  goal: z.string().optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  status: z.enum(['FUTURE', 'ACTIVE', 'COMPLETED']).optional(),
  issueIds: z.array(z.string()).optional(),
});

export const startSprintSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  goal: z.string().optional(),
});

export const completeSprintSchema = z.object({
  targetSprintId: z.string().optional().nullable(), // If null, incomplete issues go to backlog
});
