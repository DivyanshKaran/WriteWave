import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { logger } from '@/config/logger';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

// JWT Authentication middleware
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        error: 'UNAUTHORIZED',
        timestamp: new Date().toISOString()
      });
    }

    // Verify JWT token
    jwt.verify(token, config.JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        logger.warn('JWT verification failed', { error: err.message });
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired token',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
      }

      // Add user info to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'user'
      };

      next();
    });
  } catch (error) {
    logger.error('Authentication middleware error', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

// Optional JWT Authentication middleware (doesn't fail if no token)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without authentication
    }

    // Verify JWT token
    jwt.verify(token, config.JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        logger.warn('Optional JWT verification failed', { error: err.message });
        return next(); // Continue without authentication
      }

      // Add user info to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'user'
      };

      next();
    });
  } catch (error) {
    logger.error('Optional authentication middleware error', { error: error.message });
    next(); // Continue without authentication
  }
};

// Role-based authorization middleware
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED',
        timestamp: new Date().toISOString()
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Authorization failed', { 
        userId: req.user.id, 
        userRole: req.user.role, 
        requiredRoles: roles 
      });
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN',
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

// Admin only middleware
export const adminOnly = authorize(['admin']);

// User or admin middleware
export const userOrAdmin = authorize(['user', 'admin']);

// Check if user can access their own data
export const checkUserAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'UNAUTHORIZED',
      timestamp: new Date().toISOString()
    });
  }

  const { userId } = req.params;
  
  // Admin can access any user's data
  if (req.user.role === 'admin') {
    return next();
  }

  // User can only access their own data
  if (req.user.id !== userId) {
    logger.warn('User access denied', { 
      requestingUser: req.user.id, 
      targetUser: userId 
    });
    return res.status(403).json({
      success: false,
      message: 'Access denied',
      error: 'FORBIDDEN',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Rate limiting middleware (basic implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number = 100, windowMs: number = 900000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.user?.id || req.ip || 'anonymous';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up expired entries
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.resetTime < now) {
        rateLimitMap.delete(k);
      }
    }

    // Get or create rate limit entry
    let entry = rateLimitMap.get(key);
    if (!entry || entry.resetTime < now) {
      entry = { count: 0, resetTime: now + windowMs };
      rateLimitMap.set(key, entry);
    }

    // Check if limit exceeded
    if (entry.count >= maxRequests) {
      logger.warn('Rate limit exceeded', { 
        key, 
        count: entry.count, 
        maxRequests,
        windowMs 
      });
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded',
        error: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        timestamp: new Date().toISOString()
      });
    }

    // Increment counter
    entry.count++;
    rateLimitMap.set(key, entry);

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - entry.count).toString(),
      'X-RateLimit-Reset': Math.ceil(entry.resetTime / 1000).toString()
    });

    next();
  };
};

// API key authentication middleware
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required',
        error: 'UNAUTHORIZED',
        timestamp: new Date().toISOString()
      });
    }

    // In a real implementation, you would validate the API key against a database
    // For now, we'll use a simple check
    const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
    
    if (!validApiKeys.includes(apiKey)) {
      logger.warn('Invalid API key', { apiKey: apiKey.substring(0, 8) + '...' });
      return res.status(403).json({
        success: false,
        message: 'Invalid API key',
        error: 'FORBIDDEN',
        timestamp: new Date().toISOString()
      });
    }

    // Add API key info to request
    req.user = {
      id: 'api-user',
      email: 'api@system',
      role: 'api'
    };

    next();
  } catch (error) {
    logger.error('API key authentication error', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

// Service-to-service authentication middleware
export const authenticateService = (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceToken = req.headers['x-service-token'] as string;

    if (!serviceToken) {
      return res.status(401).json({
        success: false,
        message: 'Service token is required',
        error: 'UNAUTHORIZED',
        timestamp: new Date().toISOString()
      });
    }

    // Verify service token
    jwt.verify(serviceToken, config.JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        logger.warn('Service token verification failed', { error: err.message });
        return res.status(403).json({
          success: false,
          message: 'Invalid service token',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
      }

      // Check if it's a service token
      if (decoded.type !== 'service') {
        return res.status(403).json({
          success: false,
          message: 'Invalid token type',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
      }

      // Add service info to request
      req.user = {
        id: decoded.serviceId,
        email: decoded.serviceEmail || 'service@system',
        role: 'service'
      };

      next();
    });
  } catch (error) {
    logger.error('Service authentication error', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

// Generate JWT token
export const generateToken = (payload: any, expiresIn: string = '15m'): string => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn });
};

// Generate refresh token
export const generateRefreshToken = (payload: any, expiresIn: string = '7d'): string => {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn });
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.JWT_SECRET);
};

// Verify refresh token
export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
};
