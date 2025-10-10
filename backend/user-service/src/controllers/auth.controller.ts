import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/types';
import { authService } from '@/services/auth.service';
import { logger } from '@/config/logger';

// Authentication controller class
export class AuthController {
  // User registration
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.registerUser(req.body);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Registration controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // User login
  async login(req: Request, res: Response): Promise<void> {
    try {
      const deviceInfo = {
        deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
        os: req.headers['user-agent'] || 'unknown',
        browser: req.headers['user-agent'] || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      };

      const result = await authService.loginUser(req.body, deviceInfo);

      if (!result.success) {
        res.status(401).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Login controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // OAuth login (Google)
  async googleLogin(req: Request, res: Response): Promise<void> {
    try {
      // This would typically be handled by Passport.js middleware
      // For now, we'll return a placeholder response
      res.status(501).json({
        success: false,
        message: 'Google OAuth not implemented yet',
        error: 'NOT_IMPLEMENTED',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Google OAuth controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // OAuth login (Apple)
  async appleLogin(req: Request, res: Response): Promise<void> {
    try {
      // This would typically be handled by Passport.js middleware
      // For now, we'll return a placeholder response
      res.status(501).json({
        success: false,
        message: 'Apple OAuth not implemented yet',
        error: 'NOT_IMPLEMENTED',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Apple OAuth controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Refresh token
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.refreshToken(req.body);

      if (!result.success) {
        res.status(401).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Refresh token controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Logout
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const refreshToken = req.body.refreshToken;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await authService.logout(refreshToken);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Logout controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Logout all devices
  async logoutAllDevices(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await authService.logoutAllDevices(req.user.id);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Logout all devices controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Password reset request
  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.requestPasswordReset(req.body);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Password reset request controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Password reset confirm
  async confirmPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.confirmPasswordReset(req.body);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Password reset confirm controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Email verification
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.verifyEmail(req.body);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Email verification controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Resend email verification
  async resendEmailVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await authService.resendEmailVerification(email);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Resend email verification controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get current user
  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Current user retrieved successfully',
        data: {
          id: req.user.id,
          email: req.user.email,
          username: req.user.username,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          isEmailVerified: req.user.isEmailVerified,
          isActive: req.user.isActive,
          lastLoginAt: req.user.lastLoginAt,
          createdAt: req.user.createdAt,
          updatedAt: req.user.updatedAt,
          profile: req.user.profile,
          settings: req.user.settings,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get current user controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Export auth controller instance
export const authController = new AuthController();

// Export default
export default authController;
