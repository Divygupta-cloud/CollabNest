import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, dots, dashes, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'MANAGER', 'TEAM_LEADER', 'TEAM_LEAD', 'DEVELOPER', 'QA', 'EMPLOYEE']).default('EMPLOYEE'),
  teamIds: z.array(z.string()).optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'TEAM_LEADER', 'TEAM_LEAD', 'DEVELOPER', 'QA', 'EMPLOYEE']).optional(),
  teamIds: z.array(z.string()).optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const updateStatusSchema = z.object({
  isActive: z.boolean(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});
