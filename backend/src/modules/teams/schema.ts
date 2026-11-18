import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  description: z.string().optional(),
  leaderId: z.string().min(1, 'Leader ID is required'),
  department: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
  projectIds: z.array(z.string()).optional(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  department: z.string().optional(),
  projectIds: z.array(z.string()).optional(),
});

export const assignLeaderSchema = z.object({
  leaderId: z.string().min(1, 'Leader ID is required'),
});

export const addMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});
