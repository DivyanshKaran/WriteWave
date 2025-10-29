import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      id?: string;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please provide a valid Bearer token'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const jwtSecret = process.env.JWT_SECRET || 'default-secret';

    try {
      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
      req.user = decoded;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const jwtSecret = process.env.JWT_SECRET || 'default-secret';

      try {
        const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
        req.user = decoded;
      } catch (jwtError) {
        // Token is invalid, but we continue without user
        req.user = undefined;
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please provide a valid Bearer token'
      });
    }

    const userRoles = req.user.roles || [];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireModerator = requireRole(['moderator', 'admin']);
export const requireAnalyst = requireRole(['analyst', 'moderator', 'admin']);
