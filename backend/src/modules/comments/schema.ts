import { z } from 'zod';

export const createCommentSchema = z.object({
  issueId: z.string().min(1, 'Issue ID is required'),
  content: z.string().min(1, 'Comment content cannot be empty'),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment content cannot be empty'),
});
