import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/api-response';
import { logger } from '../config/logger';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // If headers are already sent, delegate to Express default handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle known AppError
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.code);
  }

  // Handle Zod Validation Error
  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return sendError(res, message, 400, 'VALIDATION_ERROR', err.errors);
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return sendError(res, `Duplicate entry for ${field}`, 409, 'DUPLICATE_KEY_ERROR');
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    return sendError(res, err.message, 400, 'VALIDATION_ERROR');
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, `Invalid ID format: ${err.value}`, 400, 'INVALID_ID');
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return sendError(res, 'Invalid or expired authentication token', 401, 'INVALID_TOKEN');
  }

  // Catch-all Internal Server Error
  logger.error('Unhandled server error', err);
  const isDev = process.env.NODE_ENV === 'development';
  return sendError(
    res,
    isDev ? err.message : 'An unexpected internal server error occurred.',
    500,
    'INTERNAL_SERVER_ERROR',
    isDev ? err.stack : undefined
  );
}
