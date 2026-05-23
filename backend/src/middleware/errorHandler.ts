import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error & { status?: number; code?: string; name?: string },
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(err.message, { stack: err.stack, path: req.path });

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' },
    });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_ID', message: 'Invalid ID format' },
    });
    return;
  }

  const mongoErr = err as { code?: number };
  if (mongoErr.code === 11000) {
    res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_KEY', message: 'Resource already exists' },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
};
