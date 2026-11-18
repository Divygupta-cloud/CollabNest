"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const routes_1 = require("./routes");
const error_middleware_1 = require("./middleware/error.middleware");
const errors_1 = require("./utils/errors");
exports.app = (0, express_1.default)();
// Security headers
exports.app.use((0, helmet_1.default)());
// CORS configuration
const allowedOrigins = [
    env_1.env.CLIENT_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
];
exports.app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || env_1.env.NODE_ENV === 'development') {
            callback(null, true);
        }
        else {
            callback(new Error('Blocked by CORS policy'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Body parsing
exports.app.use(express_1.default.json({ limit: '10mb' }));
exports.app.use(express_1.default.urlencoded({ extended: true }));
exports.app.use((0, cookie_parser_1.default)());
// Request logging in dev
if (env_1.env.NODE_ENV !== 'test') {
    exports.app.use((0, morgan_1.default)('dev'));
}
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Max 1000 requests per 15 min per IP in general
    standardHeaders: true,
    legacyHeaders: false,
});
exports.app.use('/api', limiter);
// Mount main API router
exports.app.use('/api', routes_1.apiRouter);
// 404 handler for unknown routes
exports.app.use((req, _res, next) => {
    next(new errors_1.NotFoundError(`Endpoint not found: ${req.method} ${req.originalUrl}`));
});
// Central error handler
exports.app.use(error_middleware_1.errorHandler);
