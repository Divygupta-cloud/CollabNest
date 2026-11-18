import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/taskflow'),
  JWT_SECRET: z.string().min(16).default('taskflow_jwt_secret_dev_key_change_in_production_987654321'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  LLM_PROVIDER: z.enum(['openrouter', 'mock']).default('openrouter'),
  LLM_MODEL: z.string().optional().default('poolside/laguna-s-2.1:free'),
  OPENROUTER_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
