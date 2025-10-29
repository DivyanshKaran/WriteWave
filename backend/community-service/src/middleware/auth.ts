import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../models';
import { userServiceClient } from '../../../shared/utils/user-service-client';
import { getUserProfileCached } from '../../../shared/utils/profile-cache';

// Extend Express Request interface
declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				externalUserId: string;
				username: string;
				email: string;
				isModerator: boolean;
			};
		}
	}
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const authHeader = req.headers.authorization;
		
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			res.status(401).json({
				success: false,
				error: 'Access token required'
			});
			return;
		}

		const token = authHeader.substring(7); // Remove 'Bearer ' prefix
		
		if (!token) {
			res.status(401).json({
				success: false,
				error: 'Access token required'
			});
			return;
		}

		// Verify JWT token (signature only); identity comes from user-service
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

		// Fetch authoritative user profile from user-service with cache
		const remoteUser = await getUserProfileCached(`user:${decoded.userId}`, async () => {
			return await userServiceClient.getCurrentUser(token);
		});

		// Optionally fetch local community user for moderation/ban flags
		const user = await prisma.user.findFirst({
			where: { externalUserId: decoded.userId },
			select: {
				id: true,
				externalUserId: true,
				username: true,
				isModerator: true,
				isBanned: true,
				banExpiresAt: true
			}
		});

		if (!remoteUser) {
			res.status(401).json({
				success: false,
				error: 'User not found'
			});
			return;
		}

		// Check if user is banned
		if (user?.isBanned) {
			if (user.banExpiresAt && user.banExpiresAt > new Date()) {
				res.status(403).json({
					success: false,
					error: 'Account is suspended',
					banExpiresAt: user.banExpiresAt
				});
				return;
			} else if (!user.banExpiresAt) {
				res.status(403).json({
					success: false,
					error: 'Account is permanently banned'
				});
				return;
			}
		}

		// Update last active timestamp
		if (user?.id) {
			await prisma.user.update({
				where: { id: user.id },
				data: { lastActiveAt: new Date() }
			});
		}

		// Attach user to request
		req.user = {
			id: user?.id || remoteUser.id,
			externalUserId: user?.externalUserId || decoded.userId,
			username: user?.username || remoteUser.username!,
			email: remoteUser.email,
			isModerator: user?.isModerator || false
		};

		next();
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			res.status(401).json({
				success: false,
				error: 'Invalid access token'
			});
			return;
		}

		if (error instanceof jwt.TokenExpiredError) {
			res.status(401).json({
				success: false,
				error: 'Access token expired'
			});
			return;
		}

		console.error('Authentication error:', error);
		res.status(500).json({
			success: false,
			error: 'Authentication failed'
		});
	}
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      next();
      return;
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      next();
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        externalUserId: true,
        username: true,
        isModerator: true,
        isBanned: true,
        banExpiresAt: true
      }
    });

    if (user && !user.isBanned) {
      // Update last active timestamp
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() }
      });

      // Attach user to request (email comes from remote service, not local DB)
      // For optional auth, we may not have remote user, so email might be undefined
      req.user = {
        id: user.id,
        externalUserId: user.externalUserId,
        username: user.username,
        email: '', // Email is only available from remote service in full auth flow
        isModerator: user.isModerator
      };
    }

    next();
  } catch (error) {
    // Token is invalid, but we continue without user
    next();
  }
};

export const requireModerator = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  if (!req.user.isModerator) {
    res.status(403).json({
      success: false,
      error: 'Moderator privileges required'
    });
    return;
  }

  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  // For now, treat moderators as admins
  // In a real system, you might have separate admin roles
  if (!req.user.isModerator) {
    res.status(403).json({
      success: false,
      error: 'Admin privileges required'
    });
    return;
  }

  next();
};
