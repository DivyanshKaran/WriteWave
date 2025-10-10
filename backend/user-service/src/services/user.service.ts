import { prisma } from '@/config/database';
import { cacheService } from '@/config/redis';
import { logger, userActionLogger } from '@/config/logger';
import { 
  UserProfileUpdateData, 
  UserSettingsUpdateData, 
  ServiceResponse,
  PaginationParams,
  PaginatedResponse 
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

// User service class
export class UserService {
  // Get user profile
  async getUserProfile(userId: string): Promise<ServiceResponse<any>> {
    try {
      // Try to get from cache first
      const cacheKey = `user_profile:${userId}`;
      const cachedProfile = await cacheService.get(cacheKey);
      
      if (cachedProfile) {
        return {
          success: true,
          data: cachedProfile,
          message: 'User profile retrieved successfully'
        };
      }

      // Get from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          settings: true,
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          message: 'User profile not found'
        };
      }

      const profileData = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: user.profile,
        settings: user.settings,
      };

      // Cache for 5 minutes
      await cacheService.set(cacheKey, profileData, 300);

      return {
        success: true,
        data: profileData,
        message: 'User profile retrieved successfully'
      };
    } catch (error) {
      logger.error('Get user profile failed', { error: error.message, userId });
      return {
        success: false,
        error: 'Get profile failed',
        message: 'An error occurred while retrieving user profile'
      };
    }
  }

  // Update user profile
  async updateUserProfile(
    userId: string, 
    data: UserProfileUpdateData
  ): Promise<ServiceResponse<any>> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          message: 'User not found'
        };
      }

      // Update user and profile in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update user basic info
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
          },
          include: {
            profile: true,
            settings: true,
          }
        });

        // Update or create profile
        if (data.bio !== undefined || data.dateOfBirth !== undefined || 
            data.country !== undefined || data.timezone !== undefined || 
            data.language !== undefined || data.learningGoals !== undefined || 
            data.difficultyLevel !== undefined || data.studyTime !== undefined || 
            data.interests !== undefined) {
          
          await tx.userProfile.upsert({
            where: { userId },
            update: {
              bio: data.bio,
              dateOfBirth: data.dateOfBirth,
              country: data.country,
              timezone: data.timezone,
              language: data.language,
              learningGoals: data.learningGoals,
              difficultyLevel: data.difficultyLevel,
              studyTime: data.studyTime,
              interests: data.interests,
            },
            create: {
              userId,
              bio: data.bio,
              dateOfBirth: data.dateOfBirth,
              country: data.country,
              timezone: data.timezone,
              language: data.language || 'en',
              learningGoals: data.learningGoals || [],
              difficultyLevel: data.difficultyLevel || 'beginner',
              studyTime: data.studyTime,
              interests: data.interests || [],
            }
          });
        }

        return updatedUser;
      });

      // Clear cache
      await cacheService.del(`user_profile:${userId}`);

      userActionLogger('profile_updated', userId, {
        updatedFields: Object.keys(data),
      });

      return {
        success: true,
        data: {
          id: result.id,
          email: result.email,
          username: result.username,
          firstName: result.firstName,
          lastName: result.lastName,
          isEmailVerified: result.isEmailVerified,
          isActive: result.isActive,
          lastLoginAt: result.lastLoginAt,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          profile: result.profile,
          settings: result.settings,
        },
        message: 'User profile updated successfully'
      };
    } catch (error) {
      logger.error('Update user profile failed', { error: error.message, userId, data });
      return {
        success: false,
        error: 'Update profile failed',
        message: 'An error occurred while updating user profile'
      };
    }
  }

  // Get user settings
  async getUserSettings(userId: string): Promise<ServiceResponse<any>> {
    try {
      // Try to get from cache first
      const cacheKey = `user_settings:${userId}`;
      const cachedSettings = await cacheService.get(cacheKey);
      
      if (cachedSettings) {
        return {
          success: true,
          data: cachedSettings,
          message: 'User settings retrieved successfully'
        };
      }

      // Get from database
      const settings = await prisma.userSettings.findUnique({
        where: { userId }
      });

      if (!settings) {
        // Create default settings if not found
        const defaultSettings = await prisma.userSettings.create({
          data: { userId }
        });
        
        return {
          success: true,
          data: defaultSettings,
          message: 'User settings retrieved successfully'
        };
      }

      // Cache for 10 minutes
      await cacheService.set(cacheKey, settings, 600);

      return {
        success: true,
        data: settings,
        message: 'User settings retrieved successfully'
      };
    } catch (error) {
      logger.error('Get user settings failed', { error: error.message, userId });
      return {
        success: false,
        error: 'Get settings failed',
        message: 'An error occurred while retrieving user settings'
      };
    }
  }

  // Update user settings
  async updateUserSettings(
    userId: string, 
    data: UserSettingsUpdateData
  ): Promise<ServiceResponse<any>> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          message: 'User not found'
        };
      }

      // Update settings
      const settings = await prisma.userSettings.upsert({
        where: { userId },
        update: data,
        create: {
          userId,
          ...data,
        }
      });

      // Clear cache
      await cacheService.del(`user_settings:${userId}`);

      userActionLogger('settings_updated', userId, {
        updatedFields: Object.keys(data),
      });

      return {
        success: true,
        data: settings,
        message: 'User settings updated successfully'
      };
    } catch (error) {
      logger.error('Update user settings failed', { error: error.message, userId, data });
      return {
        success: false,
        error: 'Update settings failed',
        message: 'An error occurred while updating user settings'
      };
    }
  }

  // Get user sessions
  async getUserSessions(userId: string): Promise<ServiceResponse<any[]>> {
    try {
      const sessions = await prisma.session.findMany({
        where: { userId, isActive: true },
        orderBy: { lastActivityAt: 'desc' },
        take: 10,
      });

      const sessionData = sessions.map(session => ({
        id: session.id,
        deviceInfo: session.deviceInfo ? JSON.parse(session.deviceInfo) : null,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        lastActivityAt: session.lastActivityAt,
        createdAt: session.createdAt,
      }));

      return {
        success: true,
        data: sessionData,
        message: 'User sessions retrieved successfully'
      };
    } catch (error) {
      logger.error('Get user sessions failed', { error: error.message, userId });
      return {
        success: false,
        error: 'Get sessions failed',
        message: 'An error occurred while retrieving user sessions'
      };
    }
  }

  // Deactivate user account
  async deactivateUser(userId: string): Promise<ServiceResponse<void>> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          message: 'User not found'
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          error: 'Account already deactivated',
          message: 'Account is already deactivated'
        };
      }

      // Deactivate user and revoke all sessions
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { isActive: false }
        });

        await tx.session.updateMany({
          where: { userId },
          data: { isActive: false }
        });

        await tx.refreshToken.updateMany({
          where: { userId },
          data: { isRevoked: true }
        });
      });

      // Clear cache
      await cacheService.del(`user_profile:${userId}`);
      await cacheService.del(`user_settings:${userId}`);

      userActionLogger('account_deactivated', userId);

      return {
        success: true,
        message: 'Account deactivated successfully'
      };
    } catch (error) {
      logger.error('Deactivate user failed', { error: error.message, userId });
      return {
        success: false,
        error: 'Deactivate account failed',
        message: 'An error occurred while deactivating account'
      };
    }
  }

  // Reactivate user account
  async reactivateUser(userId: string): Promise<ServiceResponse<void>> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          message: 'User not found'
        };
      }

      if (user.isActive) {
        return {
          success: false,
          error: 'Account already active',
          message: 'Account is already active'
        };
      }

      // Reactivate user
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: true }
      });

      // Clear cache
      await cacheService.del(`user_profile:${userId}`);
      await cacheService.del(`user_settings:${userId}`);

      userActionLogger('account_reactivated', userId);

      return {
        success: true,
        message: 'Account reactivated successfully'
      };
    } catch (error) {
      logger.error('Reactivate user failed', { error: error.message, userId });
      return {
        success: false,
        error: 'Reactivate account failed',
        message: 'An error occurred while reactivating account'
      };
    }
  }

  // Delete user account
  async deleteUser(userId: string): Promise<ServiceResponse<void>> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          message: 'User not found'
        };
      }

      // Delete user and all related data
      await prisma.$transaction(async (tx) => {
        // Delete related records first (due to foreign key constraints)
        await tx.emailVerification.deleteMany({ where: { userId } });
        await tx.passwordReset.deleteMany({ where: { userId } });
        await tx.refreshToken.deleteMany({ where: { userId } });
        await tx.session.deleteMany({ where: { userId } });
        await tx.userSettings.deleteMany({ where: { userId } });
        await tx.userProfile.deleteMany({ where: { userId } });
        
        // Delete user
        await tx.user.delete({ where: { id: userId } });
      });

      // Clear cache
      await cacheService.del(`user_profile:${userId}`);
      await cacheService.del(`user_settings:${userId}`);

      userActionLogger('account_deleted', userId);

      return {
        success: true,
        message: 'Account deleted successfully'
      };
    } catch (error) {
      logger.error('Delete user failed', { error: error.message, userId });
      return {
        success: false,
        error: 'Delete account failed',
        message: 'An error occurred while deleting account'
      };
    }
  }

  // Search users
  async searchUsers(
    query: string, 
    pagination: PaginationParams = {}
  ): Promise<ServiceResponse<PaginatedResponse<any>>> {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
      const skip = (page - 1) * limit;

      const where = {
        AND: [
          { isActive: true },
          {
            OR: [
              { email: { contains: query, mode: 'insensitive' as const } },
              { username: { contains: query, mode: 'insensitive' as const } },
              { firstName: { contains: query, mode: 'insensitive' as const } },
              { lastName: { contains: query, mode: 'insensitive' as const } },
            ]
          }
        ]
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            isEmailVerified: true,
            createdAt: true,
            profile: {
              select: {
                bio: true,
                country: true,
                language: true,
                difficultyLevel: true,
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.user.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          data: users,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          }
        },
        message: 'Users retrieved successfully'
      };
    } catch (error) {
      logger.error('Search users failed', { error: error.message, query, pagination });
      return {
        success: false,
        error: 'Search users failed',
        message: 'An error occurred while searching users'
      };
    }
  }

  // Get user statistics
  async getUserStats(userId: string): Promise<ServiceResponse<any>> {
    try {
      const [
        totalSessions,
        activeSessions,
        totalRefreshTokens,
        activeRefreshTokens,
        emailVerifications,
        passwordResets,
      ] = await Promise.all([
        prisma.session.count({ where: { userId } }),
        prisma.session.count({ where: { userId, isActive: true } }),
        prisma.refreshToken.count({ where: { userId } }),
        prisma.refreshToken.count({ where: { userId, isRevoked: false } }),
        prisma.emailVerification.count({ where: { userId } }),
        prisma.passwordReset.count({ where: { userId } }),
      ]);

      const stats = {
        sessions: {
          total: totalSessions,
          active: activeSessions,
        },
        tokens: {
          total: totalRefreshTokens,
          active: activeRefreshTokens,
        },
        security: {
          emailVerifications,
          passwordResets,
        },
      };

      return {
        success: true,
        data: stats,
        message: 'User statistics retrieved successfully'
      };
    } catch (error) {
      logger.error('Get user stats failed', { error: error.message, userId });
      return {
        success: false,
        error: 'Get stats failed',
        message: 'An error occurred while retrieving user statistics'
      };
    }
  }

  // Update user avatar
  async updateUserAvatar(userId: string, avatarUrl: string): Promise<ServiceResponse<any>> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          message: 'User not found'
        };
      }

      // Update avatar in profile
      const profile = await prisma.userProfile.upsert({
        where: { userId },
        update: { avatar: avatarUrl },
        create: {
          userId,
          avatar: avatarUrl,
          language: 'en',
          difficultyLevel: 'beginner',
        }
      });

      // Clear cache
      await cacheService.del(`user_profile:${userId}`);

      userActionLogger('avatar_updated', userId, {
        avatarUrl,
      });

      return {
        success: true,
        data: { avatar: avatarUrl },
        message: 'Avatar updated successfully'
      };
    } catch (error) {
      logger.error('Update user avatar failed', { error: error.message, userId, avatarUrl });
      return {
        success: false,
        error: 'Update avatar failed',
        message: 'An error occurred while updating avatar'
      };
    }
  }

  // Get user by ID (admin only)
  async getUserById(userId: string): Promise<ServiceResponse<any>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          settings: true,
          sessions: {
            where: { isActive: true },
            orderBy: { lastActivityAt: 'desc' },
            take: 5,
          },
          refreshTokens: {
            where: { isRevoked: false },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          message: 'User not found'
        };
      }

      return {
        success: true,
        data: user,
        message: 'User retrieved successfully'
      };
    } catch (error) {
      logger.error('Get user by ID failed', { error: error.message, userId });
      return {
        success: false,
        error: 'Get user failed',
        message: 'An error occurred while retrieving user'
      };
    }
  }

  // Get all users (admin only)
  async getAllUsers(pagination: PaginationParams = {}): Promise<ServiceResponse<PaginatedResponse<any>>> {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            isEmailVerified: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
            profile: {
              select: {
                bio: true,
                country: true,
                language: true,
                difficultyLevel: true,
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.user.count()
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          data: users,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          }
        },
        message: 'Users retrieved successfully'
      };
    } catch (error) {
      logger.error('Get all users failed', { error: error.message, pagination });
      return {
        success: false,
        error: 'Get users failed',
        message: 'An error occurred while retrieving users'
      };
    }
  }
}

// Export user service instance
export const userService = new UserService();

// Export default
export default userService;
