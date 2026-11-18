import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, pagination?: ApiResponse['pagination']) {
  const responseBody: ApiResponse<T> = {
    success: true,
    data,
    ...(pagination ? { pagination } : {}),
  };
  return res.status(statusCode).json(responseBody);
}

export function sendError(res: Response, message: string, statusCode = 500, code = 'ERROR', details?: any) {
  const responseBody: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
  return res.status(statusCode).json(responseBody);
}

export function sendPaginated<T>(
  res: Response,
  data: T,
  total: number,
  page: number,
  limit: number,
  statusCode = 200
) {
  return sendSuccess(res, data, statusCode, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

