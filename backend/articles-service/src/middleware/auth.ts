import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { userServiceClient } from '../../../shared/utils/user-service-client';
import { getUserProfileCached } from '../../../shared/utils/profile-cache';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Access token required' });
      return;
    }

    const token = authHeader.substring(7);
    if (!token) {
      res.status(401).json({ success: false, error: 'Access token required' });
      return;
    }

    // Verify signature only; authoritative user comes from user-service
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const remoteUser = await getUserProfileCached(`user:${decoded.userId}`, async () => {
      return await userServiceClient.getCurrentUser(token);
    });

    if (!remoteUser) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    req.user = {
      id: remoteUser.id,
      name: remoteUser.displayName || remoteUser.username || remoteUser.email,
      username: remoteUser.username || remoteUser.email,
    } as any;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, error: 'Access token expired' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, error: 'Invalid access token' });
      return;
    }
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
};
