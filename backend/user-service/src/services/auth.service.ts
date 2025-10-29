import { prisma } from '../config/database';
import { getCacheService } from '../config/redis';
import { jwtService } from '../utils/jwt';
import { passwordService } from '../utils/password';
import { emailService } from '../utils/email';
import { logger, authLogger } from '../config/logger';
import { 
  UserRegistrationData, 
  UserLoginData, 
  OAuthUserData, 
  RefreshTokenData,
  PasswordResetData,
  PasswordResetConfirmData,
  EmailVerificationData,
  ServiceResponse 
} from '../types';
import { v4 as uuidv4 } from 'uuid';
import { publish, Topics } from '../utils/events';

// Authentication service class
export class AuthService {
  // User registration
  async registerUser(data: UserRegistrationData): Promise<ServiceResponse<{
    user: any;
    accessToken: string;
    refreshToken: string;
  }>> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: data.email },
            ...(data.username ? [{ username: data.username }] : [])
          ]
        }
      });

      if (existingUser) {
        if (existingUser.email === data.email) {
          return {
            success: false,
            error: 'User with this email already exists',
            message: 'Email is already registered'
          };
        }
        if (existingUser.username === data.username) {
          return {
            success: false,
            error: 'User with this username already exists',
            message: 'Username is already taken'
          };
        }
      }

      // Hash password
      const hashedPassword = await passwordService.hashPassword(data.password);

      // Create user with transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email: data.email,
            username: data.username,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
            isEmailVerified: false,
            isActive: true,
          },
          include: {
            profile: true,
            settings: true,
          }
        });

        // Create user profile
        await tx.userProfile.create({
          data: {
            userId: user.id,
            language: 'en',
            difficultyLevel: 'beginner',
          }
        });

        // Create user settings
        await tx.userSettings.create({
          data: {
            userId: user.id,
          }
        });

        return user;
      });

      // Generate email verification token
      const verificationToken = passwordService.generateEmailVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await prisma.emailVerification.create({
        data: {
          userId: result.id,
          token: verificationToken,
          email: result.email,
          expiresAt,
        }
      });

      // Generate tokens
      const refreshTokenId = passwordService.generateRefreshTokenId();
      const { accessToken, refreshToken } = jwtService.generateTokenPair(
        result.id,
        result.email,
        refreshTokenId
      );

      // Store refresh token
      const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await prisma.refreshToken.create({
        data: {
          userId: result.id,
          token: refreshToken,
          expiresAt: refreshTokenExpiresAt,
        }
      });

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(
          result.email,
          result.firstName || 'User',
          verificationToken
        );
      } catch (emailError) {
        logger.warn('Failed to send welcome email', { 
          userId: result.id, 
          error: emailError.message 
        });
      }

      authLogger('user_registered', result.id, {
        email: result.email,
        username: result.username,
      });

      // emit user.created
      await publish(Topics.USER_EVENTS, result.id, {
        type: 'user.created',
        id: result.id,
        email: result.email,
        username: result.username,
        occurredAt: new Date().toISOString(),
      });

      return {
        success: true,
        data: {
          user: {
            id: result.id,
            email: result.email,
            username: result.username,
            firstName: result.firstName,
            lastName: result.lastName,
            isEmailVerified: result.isEmailVerified,
            isActive: result.isActive,
            createdAt: result.createdAt,
          },
          accessToken,
          refreshToken,
        },
        message: 'User registered successfully'
      };
    } catch (error) {
      logger.error('User registration failed', { error: error.message, data });
      return {
        success: false,
        error: 'Registration failed',
        message: 'An error occurred during registration'
      };
    }
  }

  // User login
  async loginUser(
    data: UserLoginData, 
    deviceInfo?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ServiceResponse<{
    user: any;
    accessToken: string;
    refreshToken: string;
  }>> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: {
          profile: true,
          settings: true,
        }
      });

      if (!user) {
        authLogger('login_failed', undefined, {
          email: data.email,
          reason: 'user_not_found',
        });
        return {
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        };
      }

      if (!user.isActive) {
        authLogger('login_failed', user.id, {
          email: data.email,
          reason: 'account_deactivated',
        });
        return {
          success: false,
          error: 'Account deactivated',
          message: 'Your account has been deactivated'
        };
      }

      if (!user.password) {
        authLogger('login_failed', user.id, {
          email: data.email,
          reason: 'no_password_set',
        });
        return {
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        };
      }

      // Verify password
      const isPasswordValid = await passwordService.comparePassword(
        data.password,
        user.password
      );

      if (!isPasswordValid) {
        authLogger('login_failed', user.id, {
          email: data.email,
          reason: 'invalid_password',
        });
        return {
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        };
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Generate tokens
      const refreshTokenId = passwordService.generateRefreshTokenId();
      const { accessToken, refreshToken } = jwtService.generateTokenPair(
        user.id,
        user.email,
        refreshTokenId
      );

      // Store refresh token
      const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: refreshTokenExpiresAt,
          deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : null,
        }
      });

      // Create session record
      const sessionToken = accessToken.split('.')[2]; // Use token signature as unique identifier
      const sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await prisma.session.create({
        data: {
          userId: user.id,
          token: sessionToken,
          deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : null,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          expiresAt: sessionExpiresAt,
          isActive: true,
        }
      });

      authLogger('user_logged_in', user.id, {
        email: user.email,
        deviceInfo,
      });

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            isEmailVerified: user.isEmailVerified,
            isActive: user.isActive,
            lastLoginAt: new Date(),
            profile: user.profile,
            settings: user.settings,
          },
          accessToken,
          refreshToken,
        },
        message: 'Login successful'
      };
    } catch (error) {
      logger.error('User login failed', { error: error.message, email: data.email });
      return {
        success: false,
        error: 'Login failed',
        message: 'An error occurred during login'
      };
    }
  }

  // OAuth login/registration
  async oauthLogin(
    data: OAuthUserData, 
    deviceInfo?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ServiceResponse<{
    user: any;
    accessToken: string;
    refreshToken: string;
    isNewUser: boolean;
  }>> {
    try {
      // Find existing user by provider ID
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { [`${data.provider}Id`]: data.providerId },
            { email: data.email }
          ]
        },
        include: {
          profile: true,
          settings: true,
        }
      });

      let isNewUser = false;

      if (!user) {
        // Create new user
        isNewUser = true;
        user = await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              [`${data.provider}Id`]: data.providerId,
              oauthProvider: data.provider,
              isEmailVerified: true, // OAuth users are considered verified
              isActive: true,
            },
            include: {
              profile: true,
              settings: true,
            }
          });

          // Create user profile
          await tx.userProfile.create({
            data: {
              userId: newUser.id,
              language: 'en',
              difficultyLevel: 'beginner',
            }
          });

          // Create user settings
          await tx.userSettings.create({
            data: {
              userId: newUser.id,
            }
          });

          return newUser;
        });
      } else {
        // Update existing user with OAuth info if not already set
        if (!user[`${data.provider}Id`]) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              [`${data.provider}Id`]: data.providerId,
              oauthProvider: data.provider,
              isEmailVerified: true,
            },
            include: {
              profile: true,
              settings: true,
            }
          });
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });
      }

      if (!user.isActive) {
        authLogger('oauth_login_failed', user.id, {
          provider: data.provider,
          reason: 'account_deactivated',
        });
        return {
          success: false,
          error: 'Account deactivated',
          message: 'Your account has been deactivated'
        };
      }

      // Generate tokens
      const refreshTokenId = passwordService.generateRefreshTokenId();
      const { accessToken, refreshToken } = jwtService.generateTokenPair(
        user.id,
        user.email,
        refreshTokenId
      );

      // Store refresh token
      const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: refreshTokenExpiresAt,
          deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : null,
        }
      });

      // Create session record
      const sessionToken = accessToken.split('.')[2]; // Use token signature as unique identifier
      const sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await prisma.session.create({
        data: {
          userId: user.id,
          token: sessionToken,
          deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : null,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          expiresAt: sessionExpiresAt,
          isActive: true,
        }
      });

      authLogger('oauth_login_success', user.id, {
        provider: data.provider,
        isNewUser,
        deviceInfo,
      });

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            isEmailVerified: user.isEmailVerified,
            isActive: user.isActive,
            lastLoginAt: new Date(),
            profile: user.profile,
            settings: user.settings,
          },
          accessToken,
          refreshToken,
          isNewUser,
        },
        message: isNewUser ? 'Account created and logged in successfully' : 'Login successful'
      };
    } catch (error) {
      logger.error('OAuth login failed', { error: error.message, provider: data.provider });
      return {
        success: false,
        error: 'OAuth login failed',
        message: 'An error occurred during OAuth login'
      };
    }
  }

  // Refresh token
  async refreshToken(data: RefreshTokenData): Promise<ServiceResponse<{
    accessToken: string;
    refreshToken: string;
  }>> {
    try {
      // Verify refresh token
      const decoded = jwtService.verifyRefreshToken(data.refreshToken);

      // Find refresh token in database
      const refreshTokenRecord = await prisma.refreshToken.findUnique({
        where: { token: data.refreshToken },
        include: { user: true }
      });

      if (!refreshTokenRecord || refreshTokenRecord.isRevoked) {
        authLogger('refresh_token_invalid', decoded.userId, {
          reason: 'token_not_found_or_revoked',
        });
        return {
          success: false,
          error: 'Invalid refresh token',
          message: 'Refresh token is invalid or has been revoked'
        };
      }

      if (refreshTokenRecord.expiresAt < new Date()) {
        authLogger('refresh_token_expired', decoded.userId, {
          reason: 'token_expired',
        });
        return {
          success: false,
          error: 'Refresh token expired',
          message: 'Refresh token has expired'
        };
      }

      if (!refreshTokenRecord.user.isActive) {
        authLogger('refresh_token_failed', decoded.userId, {
          reason: 'user_inactive',
        });
        return {
          success: false,
          error: 'Account deactivated',
          message: 'Your account has been deactivated'
        };
      }

      // Revoke old refresh token
      await prisma.refreshToken.update({
        where: { id: refreshTokenRecord.id },
        data: { isRevoked: true }
      });

      // Generate new tokens
      const newRefreshTokenId = passwordService.generateRefreshTokenId();
      const { accessToken, refreshToken } = jwtService.generateTokenPair(
        refreshTokenRecord.user.id,
        refreshTokenRecord.user.email,
        newRefreshTokenId
      );

      // Store new refresh token
      const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await prisma.refreshToken.create({
        data: {
          userId: refreshTokenRecord.user.id,
          token: refreshToken,
          expiresAt: refreshTokenExpiresAt,
          deviceInfo: refreshTokenRecord.deviceInfo,
        }
      });

      authLogger('token_refreshed', refreshTokenRecord.user.id);

      return {
        success: true,
        data: {
          accessToken,
          refreshToken,
        },
        message: 'Token refreshed successfully'
      };
    } catch (error) {
      logger.error('Token refresh failed', { error: error.message });
      return {
        success: false,
        error: 'Token refresh failed',
        message: 'An error occurred during token refresh'
      };
    }
  }

  // Logout
  async logout(refreshToken: string): Promise<ServiceResponse<void>> {
    try {
      // Revoke refresh token
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { isRevoked: true }
      });

      authLogger('user_logged_out', undefined, {
        refreshToken: refreshToken.substring(0, 10) + '...',
      });

      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      logger.error('Logout failed', { error: error.message });
      return {
        success: false,
        error: 'Logout failed',
        message: 'An error occurred during logout'
      };
    }
  }

  // Logout all devices
  async logoutAllDevices(userId: string): Promise<ServiceResponse<void>> {
    try {
      // Revoke all refresh tokens for user
      await prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true }
      });

      authLogger('user_logged_out_all', userId);

      return {
        success: true,
        message: 'Logged out from all devices successfully'
      };
    } catch (error) {
      logger.error('Logout all devices failed', { error: error.message, userId });
      return {
        success: false,
        error: 'Logout all devices failed',
        message: 'An error occurred during logout'
      };
    }
  }

  // Password reset request
  async requestPasswordReset(data: PasswordResetData): Promise<ServiceResponse<void>> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (!user) {
        // Don't reveal if user exists or not
        return {
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent'
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          error: 'Account deactivated',
          message: 'Your account has been deactivated'
        };
      }

      // Generate reset token
      const resetToken = passwordService.generatePasswordResetToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt,
        }
      });

      // Send reset email
      try {
        await emailService.sendPasswordResetEmail(
          user.email,
          user.firstName || 'User',
          resetToken
        );
      } catch (emailError) {
        logger.warn('Failed to send password reset email', { 
          userId: user.id, 
          error: emailError.message 
        });
      }

      authLogger('password_reset_requested', user.id, {
        email: user.email,
      });

      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      };
    } catch (error) {
      logger.error('Password reset request failed', { error: error.message, email: data.email });
      return {
        success: false,
        error: 'Password reset request failed',
        message: 'An error occurred while processing your request'
      };
    }
  }

  // Password reset confirm
  async confirmPasswordReset(data: PasswordResetConfirmData): Promise<ServiceResponse<void>> {
    try {
      // Find reset token
      const resetRecord = await prisma.passwordReset.findUnique({
        where: { token: data.token },
        include: { user: true }
      });

      if (!resetRecord || resetRecord.isUsed) {
        return {
          success: false,
          error: 'Invalid reset token',
          message: 'Reset token is invalid or has already been used'
        };
      }

      if (resetRecord.expiresAt < new Date()) {
        return {
          success: false,
          error: 'Reset token expired',
          message: 'Reset token has expired'
        };
      }

      if (!resetRecord.user.isActive) {
        return {
          success: false,
          error: 'Account deactivated',
          message: 'Your account has been deactivated'
        };
      }

      // Hash new password
      const hashedPassword = await passwordService.hashPassword(data.newPassword);

      // Update password and mark token as used
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: resetRecord.user.id },
          data: { password: hashedPassword }
        });

        await tx.passwordReset.update({
          where: { id: resetRecord.id },
          data: { isUsed: true }
        });

        // Revoke all refresh tokens for security
        await tx.refreshToken.updateMany({
          where: { userId: resetRecord.user.id },
          data: { isRevoked: true }
        });
      });

      // Send password changed notification
      try {
        await emailService.sendPasswordChangedNotification(
          resetRecord.user.email,
          resetRecord.user.firstName || 'User'
        );
      } catch (emailError) {
        logger.warn('Failed to send password changed notification', { 
          userId: resetRecord.user.id, 
          error: emailError.message 
        });
      }

      authLogger('password_reset_completed', resetRecord.user.id);

      return {
        success: true,
        message: 'Password has been reset successfully'
      };
    } catch (error) {
      logger.error('Password reset confirm failed', { error: error.message });
      return {
        success: false,
        error: 'Password reset failed',
        message: 'An error occurred while resetting your password'
      };
    }
  }

  // Email verification
  async verifyEmail(data: EmailVerificationData): Promise<ServiceResponse<void>> {
    try {
      // Find verification token
      const verificationRecord = await prisma.emailVerification.findUnique({
        where: { token: data.token },
        include: { user: true }
      });

      if (!verificationRecord || verificationRecord.isUsed) {
        return {
          success: false,
          error: 'Invalid verification token',
          message: 'Verification token is invalid or has already been used'
        };
      }

      if (verificationRecord.expiresAt < new Date()) {
        return {
          success: false,
          error: 'Verification token expired',
          message: 'Verification token has expired'
        };
      }

      // Mark email as verified and token as used
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: verificationRecord.user.id },
          data: { isEmailVerified: true }
        });

        await tx.emailVerification.update({
          where: { id: verificationRecord.id },
          data: { isUsed: true }
        });
      });

      authLogger('email_verified', verificationRecord.user.id, {
        email: verificationRecord.email,
      });

      return {
        success: true,
        message: 'Email has been verified successfully'
      };
    } catch (error) {
      logger.error('Email verification failed', { error: error.message });
      return {
        success: false,
        error: 'Email verification failed',
        message: 'An error occurred while verifying your email'
      };
    }
  }

  // Resend email verification
  async resendEmailVerification(email: string): Promise<ServiceResponse<void>> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          message: 'No account found with this email address'
        };
      }

      if (user.isEmailVerified) {
        return {
          success: false,
          error: 'Email already verified',
          message: 'Email address is already verified'
        };
      }

      // Generate new verification token
      const verificationToken = passwordService.generateEmailVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store verification token
      await prisma.emailVerification.create({
        data: {
          userId: user.id,
          token: verificationToken,
          email: user.email,
          expiresAt,
        }
      });

      // Send verification email
      try {
        await emailService.sendEmailVerificationEmail(
          user.email,
          user.firstName || 'User',
          verificationToken
        );
      } catch (emailError) {
        logger.warn('Failed to send email verification', { 
          userId: user.id, 
          error: emailError.message 
        });
      }

      authLogger('email_verification_resent', user.id, {
        email: user.email,
      });

      return {
        success: true,
        message: 'Verification email has been sent'
      };
    } catch (error) {
      logger.error('Resend email verification failed', { error: error.message, email });
      return {
        success: false,
        error: 'Resend verification failed',
        message: 'An error occurred while sending verification email'
      };
    }
  }
}

// Export auth service instance
export const authService = new AuthService();

// Export default
export default authService;
