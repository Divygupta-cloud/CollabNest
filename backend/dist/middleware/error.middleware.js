"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const errors_1 = require("../utils/errors");
const api_response_1 = require("../utils/api-response");
const logger_1 = require("../config/logger");
const zod_1 = require("zod");
function errorHandler(err, req, res, next) {
    // If headers are already sent, delegate to Express default handler
    if (res.headersSent) {
        return next(err);
    }
    // Handle known AppError
    if (err instanceof errors_1.AppError) {
        return (0, api_response_1.sendError)(res, err.message, err.statusCode, err.code);
    }
    // Handle Zod Validation Error
    if (err instanceof zod_1.ZodError) {
        const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return (0, api_response_1.sendError)(res, message, 400, 'VALIDATION_ERROR', err.errors);
    }
    // Handle Mongoose duplicate key error (code 11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || 'field';
        return (0, api_response_1.sendError)(res, `Duplicate entry for ${field}`, 409, 'DUPLICATE_KEY_ERROR');
    }
    // Handle Mongoose ValidationError
    if (err.name === 'ValidationError') {
        return (0, api_response_1.sendError)(res, err.message, 400, 'VALIDATION_ERROR');
    }
    // Handle Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        return (0, api_response_1.sendError)(res, `Invalid ID format: ${err.value}`, 400, 'INVALID_ID');
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return (0, api_response_1.sendError)(res, 'Invalid or expired authentication token', 401, 'INVALID_TOKEN');
    }
    // Catch-all Internal Server Error
    logger_1.logger.error('Unhandled server error', err);
    const isDev = process.env.NODE_ENV === 'development';
    return (0, api_response_1.sendError)(res, isDev ? err.message : 'An unexpected internal server error occurred.', 500, 'INTERNAL_SERVER_ERROR', isDev ? err.stack : undefined);
}
