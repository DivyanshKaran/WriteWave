import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { UnauthorizedError, ForbiddenError } from '@/utils/errors';
import { JWTPayload } from '@/types';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          throw new UnauthorizedError('Token expired');
        } else if (err.name === 'JsonWebTokenError') {
          throw new UnauthorizedError('Invalid token');
        } else {
          throw new UnauthorizedError('Token verification failed');
        }
      }

      req.user = decoded as JWTPayload;
      next();
    });

  } catch (error) {
    logger.warn('Authentication failed', { 
      error: error.message, 
      url: req.url, 
      method: req.method 
    });
    next(error);
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret) {
        jwt.verify(token, jwtSecret, (err, decoded) => {
          if (!err) {
            req.user = decoded as JWTPayload;
          }
        });
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const userRoles = req.user.roles || [];
      const requiredRoles = Array.isArray(roles) ? roles : [roles];

      const hasRole = requiredRoles.some(role => userRoles.includes(role));

      if (!hasRole) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      logger.warn('Authorization failed', { 
        error: error.message, 
        userId: req.user?.userId, 
        requiredRoles: roles 
      });
      next(error);
    }
  };
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  return requireRole(['admin'])(req, res, next);
};

export const requireModerator = (req: Request, res: Response, next: NextFunction) => {
  return requireRole(['admin', 'moderator'])(req, res, next);
};

export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Check if user is accessing their own resource
    const resourceUserId = req.params.userId || req.body.userId;
    if (resourceUserId && req.user.userId !== resourceUserId) {
      // Check if user is admin or moderator
      const userRoles = req.user.roles || [];
      if (!userRoles.includes('admin') && !userRoles.includes('moderator')) {
        throw new ForbiddenError('Access denied to other user resources');
      }
    }

    next();
  } catch (error) {
    logger.warn('User authorization failed', { 
      error: error.message, 
      userId: req.user?.userId, 
      resourceUserId: req.params.userId 
    });
    next(error);
  }
};

export const generateToken = (payload: JWTPayload): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign(payload, jwtSecret, { expiresIn });
};

export const verifyToken = (token: string): JWTPayload => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.verify(token, jwtSecret) as JWTPayload;
};

export const decodeToken = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

export const getTokenFromRequest = (req: Request): string | null => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const refreshToken = (oldToken: string): string | null => {
  try {
    const decoded = jwt.decode(oldToken) as any;
    if (!decoded || isTokenExpired(oldToken)) {
      return null;
    }

    const payload: JWTPayload = {
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username,
      roles: decoded.roles || []
    };

    return generateToken(payload);
  } catch (error) {
    return null;
  }
};

// API Key authentication for service-to-service communication
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      throw new UnauthorizedError('API key required');
    }

    const validApiKeys = process.env.API_KEYS?.split(',') || [];
    if (!validApiKeys.includes(apiKey)) {
      throw new UnauthorizedError('Invalid API key');
    }

    // Set service user for API key requests
    req.user = {
      userId: 'service',
      email: 'service@writewave.com',
      username: 'service',
      roles: ['service']
    };

    next();
  } catch (error) {
    logger.warn('API key authentication failed', { 
      error: error.message, 
      url: req.url, 
      method: req.method 
    });
    next(error);
  }
};

// Webhook signature verification
export const verifyWebhookSignature = (secret: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers['x-webhook-signature'] as string;
      
      if (!signature) {
        throw new UnauthorizedError('Webhook signature required');
      }

      // Simple signature verification (implement proper HMAC verification)
      const expectedSignature = `sha256=${Buffer.from(secret).toString('base64')}`;
      
      if (signature !== expectedSignature) {
        throw new UnauthorizedError('Invalid webhook signature');
      }

      next();
    } catch (error) {
      logger.warn('Webhook signature verification failed', { 
        error: error.message, 
        url: req.url 
      });
      next(error);
    }
  };
};

export default {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireModerator,
  requireUser,
  generateToken,
  verifyToken,
  decodeToken,
  getTokenFromRequest,
  isTokenExpired,
  refreshToken,
  authenticateApiKey,
  verifyWebhookSignature
};
