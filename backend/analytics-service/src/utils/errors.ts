import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

// Re-export for convenience
export { AppError };

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Handle known error types
  if (error instanceof AppError) {
    return res.status((error as AppError).statusCode).json({
      success: false,
      error: error.message,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: error.message
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid Token',
      message: 'The provided token is invalid'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token Expired',
      message: 'The provided token has expired'
    });
  }

  // Handle database errors
  if (error.name === 'DatabaseError') {
    return res.status(500).json({
      success: false,
      error: 'Database Error',
      message: 'A database error occurred'
    });
  }

  // Handle rate limiting errors
  if (error.name === 'RateLimitError') {
    return res.status(429).json({
      success: false,
      error: 'Rate Limit Exceeded',
      message: 'Too many requests, please try again later'
    });
  }

  // Default error handler
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
