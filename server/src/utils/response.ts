import type { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: null,
  });
}

export function sendCreated<T>(res: Response, data: T, message = 'Created successfully') {
  sendSuccess(res, data, message, 201);
}

export function sendError(res: Response, message: string, statusCode = 400, errors: string[] | null = null) {
  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors,
  });
}
