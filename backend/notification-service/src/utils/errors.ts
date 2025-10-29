import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export class AppError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, 409);
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Handle known error types
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
    return;
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: error.message
    });
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'Invalid Token',
      message: 'The provided token is invalid'
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Token Expired',
      message: 'The provided token has expired'
    });
    return;
  }

  // Handle database errors
  if (error.name === 'DatabaseError') {
    res.status(500).json({
      success: false,
      error: 'Database Error',
      message: 'A database error occurred'
    });
    return;
  }

  // Handle rate limiting errors
  if (error.name === 'RateLimitError') {
    res.status(429).json({
      success: false,
      error: 'Rate Limit Exceeded',
      message: 'Too many requests, please try again later'
    });
    return;
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