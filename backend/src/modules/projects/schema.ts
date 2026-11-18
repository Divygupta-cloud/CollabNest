import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  key: z
    .string()
    .min(2, 'Key must be at least 2 characters')
    .max(10, 'Key must be at most 10 characters')
    .regex(/^[a-zA-Z0-9]{2,10}$/, 'Key must be 2-10 alphanumeric characters')
    .transform((val) => val.toUpperCase()),
  description: z.string().optional(),
  leadId: z.string().min(1, 'Lead ID is required'),
  teamId: z.string().optional(),
  category: z.enum(['SOFTWARE', 'OPERATIONS', 'MARKETING', 'BUSINESS']).default('SOFTWARE'),
  iconBgColor: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  leadId: z.string().optional(),
  teamId: z.string().optional(),
  category: z.enum(['SOFTWARE', 'OPERATIONS', 'MARKETING', 'BUSINESS']).optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']).optional(),
  iconBgColor: z.string().optional(),
  isStarred: z.boolean().optional(),
});
