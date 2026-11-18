"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
// Load .env
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(5000),
    MONGODB_URI: zod_1.z.string().default('mongodb://127.0.0.1:27017/taskflow'),
    JWT_SECRET: zod_1.z.string().min(16).default('taskflow_jwt_secret_dev_key_change_in_production_987654321'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    CLIENT_URL: zod_1.z.string().default('http://localhost:5173'),
    LLM_PROVIDER: zod_1.z.enum(['openrouter', 'mock']).default('openrouter'),
    LLM_MODEL: zod_1.z.string().optional().default('poolside/laguna-s-2.1:free'),
    OPENROUTER_API_KEY: zod_1.z.string().optional(),
});
exports.env = envSchema.parse(process.env);
