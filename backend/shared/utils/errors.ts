import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

/**
 * Base error class for all application errors
 */
export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly requestId?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    requestId?: string
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON representation
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      timestamp: this.timestamp,
      requestId: this.requestId,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }
}

/**
 * Validation error for input validation failures
 */
export class ValidationError extends AppError {
  public readonly errors: ValidationErrorDetail[];

  constructor(message: string, errors: ValidationErrorDetail[] = []) {
    super(message, 400, true);
    this.errors = errors;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      errors: this.errors
    };
  }
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: unknown;
  code?: string;
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, true);
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, true);
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, true);
  }
}

/**
 * Conflict error for duplicate resources
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, true);
  }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429, true);
    this.retryAfter = retryAfter;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter
    };
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  public readonly query?: string;
  public readonly originalError?: Error;

  constructor(message: string, originalError?: Error, query?: string) {
    super(message, 500, false);
    this.originalError = originalError;
    this.query = query;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      ...(process.env.NODE_ENV === 'development' && {
        query: this.query,
        originalError: this.originalError?.message
      })
    };
  }
}

/**
 * External service error
 */
export class ExternalServiceError extends AppError {
  public readonly service: string;
  public readonly endpoint?: string;

  constructor(service: string, message: string, endpoint?: string) {
    super(`External service error: ${message}`, 502, true);
    this.service = service;
    this.endpoint = endpoint;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      service: this.service,
      endpoint: this.endpoint
    };
  }
}

/**
 * Service unavailable error
 */
export class ServiceUnavailableError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Service temporarily unavailable', retryAfter?: number) {
    super(message, 503, true);
    this.retryAfter = retryAfter;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter
    };
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends AppError {
  public readonly timeout: number;

  constructor(message: string = 'Request timeout', timeout: number = 30000) {
    super(message, 408, true);
    this.timeout = timeout;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      timeout: this.timeout
    };
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(`Configuration error: ${message}`, 500, false);
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = (req as any).id;
  
  // Log error
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    requestId,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle known error types
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.toJSON()
    });
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: {
        name: 'AuthenticationError',
        message: 'Invalid token',
        statusCode: 401,
        timestamp: new Date().toISOString(),
        requestId
      }
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        name: 'AuthenticationError',
        message: 'Token expired',
        statusCode: 401,
        timestamp: new Date().toISOString(),
        requestId
      }
    });
    return;
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    let statusCode = 500;
    let message = 'Database error occurred';

    switch (prismaError.code) {
      case 'P2002':
        statusCode = 409;
        message = 'Resource already exists';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Resource not found';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Invalid reference';
        break;
    }

    res.status(statusCode).json({
      success: false,
      error: {
        name: 'DatabaseError',
        message,
        statusCode,
        timestamp: new Date().toISOString(),
        requestId,
        ...(process.env.NODE_ENV === 'development' && { code: prismaError.code })
      }
    });
    return;
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: {
        name: 'ValidationError',
        message: error.message,
        statusCode: 400,
        timestamp: new Date().toISOString(),
        requestId
      }
    });
    return;
  }

  // Default error handler
  res.status(500).json({
    success: false,
    error: {
      name: 'InternalServerError',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      requestId,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
};

/**
 * 404 handler for unmatched routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const requestId = (req as any).id;
  
  logger.warn('Route not found', {
    requestId,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(404).json({
    success: false,
    error: {
      name: 'NotFoundError',
      message: `Route ${req.method} ${req.url} not found`,
      statusCode: 404,
      timestamp: new Date().toISOString(),
      requestId
    }
  });
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Error factory for creating specific error types
 */
export const createError = {
  validation: (message: string, errors: ValidationErrorDetail[] = []) => 
    new ValidationError(message, errors),
  
  authentication: (message?: string) => 
    new AuthenticationError(message),
  
  authorization: (message?: string) => 
    new AuthorizationError(message),
  
  notFound: (resource?: string) => 
    new NotFoundError(resource),
  
  conflict: (message?: string) => 
    new ConflictError(message),
  
  rateLimit: (message?: string, retryAfter?: number) => 
    new RateLimitError(message, retryAfter),
  
  database: (message: string, originalError?: Error, query?: string) => 
    new DatabaseError(message, originalError, query),
  
  externalService: (service: string, message: string, endpoint?: string) => 
    new ExternalServiceError(service, message, endpoint),
  
  serviceUnavailable: (message?: string, retryAfter?: number) => 
    new ServiceUnavailableError(message, retryAfter),
  
  timeout: (message?: string, timeout?: number) => 
    new TimeoutError(message, timeout),
  
  configuration: (message: string) => 
    new ConfigurationError(message)
};
