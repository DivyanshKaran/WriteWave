"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const database_1 = require("../config/database");
const redis_1 = require("../config/redis");
const logger_1 = require("../config/logger");
const events_1 = require("../utils/events");
class UserService {
    async getUserProfile(userId) {
        try {
            const cacheKey = `user_profile:${userId}`;
            const cachedProfile = await (0, redis_1.getCacheService)().get(cacheKey);
            if (cachedProfile) {
                return {
                    success: true,
                    data: cachedProfile,
                    message: 'User profile retrieved successfully'
                };
            }
            const user = await database_1.prisma.user.findUnique({
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
            await (0, redis_1.getCacheService)().set(cacheKey, profileData, 300);
            return {
                success: true,
                data: profileData,
                message: 'User profile retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get user profile failed', { error: error.message, userId });
            return {
                success: false,
                error: 'Get profile failed',
                message: 'An error occurred while retrieving user profile'
            };
        }
    }
    async updateUserProfile(userId, data) {
        try {
            const user = await database_1.prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                return {
                    success: false,
                    error: 'User not found',
                    message: 'User not found'
                };
            }
            const result = await database_1.prisma.$transaction(async (tx) => {
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
            await (0, redis_1.getCacheService)().del(`user_profile:${userId}`);
            (0, logger_1.userActionLogger)('profile_updated', userId, {
                updatedFields: Object.keys(data),
            });
            await (0, events_1.publish)(events_1.Topics.USER_EVENTS, userId, {
                type: 'user.updated',
                id: userId,
                changes: data,
                occurredAt: new Date().toISOString(),
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
        }
        catch (error) {
            logger_1.logger.error('Update user profile failed', { error: error.message, userId, data });
            return {
                success: false,
                error: 'Update profile failed',
                message: 'An error occurred while updating user profile'
            };
        }
    }
    async getUserSettings(userId) {
        try {
            const cacheKey = `user_settings:${userId}`;
            const cachedSettings = await (0, redis_1.getCacheService)().get(cacheKey);
            if (cachedSettings) {
                return {
                    success: true,
                    data: cachedSettings,
                    message: 'User settings retrieved successfully'
                };
            }
            const settings = await database_1.prisma.userSettings.findUnique({
                where: { userId }
            });
            if (!settings) {
                const defaultSettings = await database_1.prisma.userSettings.create({
                    data: { userId }
                });
                return {
                    success: true,
                    data: defaultSettings,
                    message: 'User settings retrieved successfully'
                };
            }
            await (0, redis_1.getCacheService)().set(cacheKey, settings, 600);
            return {
                success: true,
                data: settings,
                message: 'User settings retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get user settings failed', { error: error.message, userId });
            return {
                success: false,
                error: 'Get settings failed',
                message: 'An error occurred while retrieving user settings'
            };
        }
    }
    async updateUserSettings(userId, data) {
        try {
            const user = await database_1.prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                return {
                    success: false,
                    error: 'User not found',
                    message: 'User not found'
                };
            }
            const settings = await database_1.prisma.userSettings.upsert({
                where: { userId },
                update: data,
                create: {
                    userId,
                    ...data,
                }
            });
            await (0, redis_1.getCacheService)().del(`user_settings:${userId}`);
            (0, logger_1.userActionLogger)('settings_updated', userId, {
                updatedFields: Object.keys(data),
            });
            await (0, events_1.publish)(events_1.Topics.USER_EVENTS, userId, {
                type: 'user.updated',
                id: userId,
                changes: data,
                occurredAt: new Date().toISOString(),
            });
            return {
                success: true,
                data: settings,
                message: 'User settings updated successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Update user settings failed', { error: error.message, userId, data });
            return {
                success: false,
                error: 'Update settings failed',
                message: 'An error occurred while updating user settings'
            };
        }
    }
    async getUserSessions(userId) {
        try {
            const now = new Date();
            const sessions = await database_1.prisma.session.findMany({
                where: {
                    userId,
                    isActive: true,
                    expiresAt: { gt: now }
                },
                orderBy: { lastActivityAt: 'desc' },
                take: 10,
            });
            const sessionData = sessions.map(session => ({
                id: session.id,
                deviceInfo: session.deviceInfo ? JSON.parse(session.deviceInfo) : null,
                ipAddress: session.ipAddress,
                userAgent: session.userAgent,
                isActive: session.isActive,
                expiresAt: session.expiresAt,
                lastActivityAt: session.lastActivityAt,
                createdAt: session.createdAt,
            }));
            return {
                success: true,
                data: sessionData,
                message: 'User sessions retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get user sessions failed', { error: error.message, userId });
            return {
                success: false,
                error: 'Get sessions failed',
                message: 'An error occurred while retrieving user sessions'
            };
        }
    }
    async deactivateUser(userId) {
        try {
            const user = await database_1.prisma.user.findUnique({
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
            await database_1.prisma.$transaction(async (tx) => {
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
            await (0, redis_1.getCacheService)().del(`user_profile:${userId}`);
            await (0, redis_1.getCacheService)().del(`user_settings:${userId}`);
            (0, logger_1.userActionLogger)('account_deactivated', userId);
            await (0, events_1.publish)(events_1.Topics.USER_EVENTS, userId, {
                type: 'user.updated',
                id: userId,
                changes: { isActive: false },
                occurredAt: new Date().toISOString(),
            });
            return {
                success: true,
                message: 'Account deactivated successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Deactivate user failed', { error: error.message, userId });
            return {
                success: false,
                error: 'Deactivate account failed',
                message: 'An error occurred while deactivating account'
            };
        }
    }
    async reactivateUser(userId) {
        try {
            const user = await database_1.prisma.user.findUnique({
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
            await database_1.prisma.user.update({
                where: { id: userId },
                data: { isActive: true }
            });
            await (0, redis_1.getCacheService)().del(`user_profile:${userId}`);
            await (0, redis_1.getCacheService)().del(`user_settings:${userId}`);
            (0, logger_1.userActionLogger)('account_reactivated', userId);
            await (0, events_1.publish)(events_1.Topics.USER_EVENTS, userId, {
                type: 'user.updated',
                id: userId,
                changes: { isActive: true },
                occurredAt: new Date().toISOString(),
            });
            return {
                success: true,
                message: 'Account reactivated successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Reactivate user failed', { error: error.message, userId });
            return {
                success: false,
                error: 'Reactivate account failed',
                message: 'An error occurred while reactivating account'
            };
        }
    }
    async deleteUser(userId) {
        try {
            const user = await database_1.prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                return {
                    success: false,
                    error: 'User not found',
                    message: 'User not found'
                };
            }
            await database_1.prisma.$transaction(async (tx) => {
                await tx.emailVerification.deleteMany({ where: { userId } });
                await tx.passwordReset.deleteMany({ where: { userId } });
                await tx.refreshToken.deleteMany({ where: { userId } });
                await tx.session.deleteMany({ where: { userId } });
                await tx.userSettings.deleteMany({ where: { userId } });
                await tx.userProfile.deleteMany({ where: { userId } });
                await tx.user.delete({ where: { id: userId } });
            });
            await (0, redis_1.getCacheService)().del(`user_profile:${userId}`);
            await (0, redis_1.getCacheService)().del(`user_settings:${userId}`);
            (0, logger_1.userActionLogger)('account_deleted', userId);
            await (0, events_1.publish)(events_1.Topics.USER_EVENTS, userId, {
                type: 'user.updated',
                id: userId,
                changes: { isActive: false },
                occurredAt: new Date().toISOString(),
            });
            return {
                success: true,
                message: 'Account deleted successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Delete user failed', { error: error.message, userId });
            return {
                success: false,
                error: 'Delete account failed',
                message: 'An error occurred while deleting account'
            };
        }
    }
    async searchUsers(query, pagination = {}) {
        try {
            const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
            const skip = (page - 1) * limit;
            const where = {
                AND: [
                    { isActive: true },
                    {
                        OR: [
                            { email: { contains: query, mode: 'insensitive' } },
                            { username: { contains: query, mode: 'insensitive' } },
                            { firstName: { contains: query, mode: 'insensitive' } },
                            { lastName: { contains: query, mode: 'insensitive' } },
                        ]
                    }
                ]
            };
            const [users, total] = await Promise.all([
                database_1.prisma.user.findMany({
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
                database_1.prisma.user.count({ where })
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: 'Users retrieved successfully',
                data: {
                    success: true,
                    message: 'Users retrieved successfully',
                    timestamp: new Date().toISOString(),
                    data: users,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages,
                        hasNext: page < totalPages,
                        hasPrev: page > 1,
                    }
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Search users failed', { error: error.message, query, pagination });
            return {
                success: false,
                error: 'Search users failed',
                message: 'An error occurred while searching users'
            };
        }
    }
    async getUserStats(userId) {
        try {
            const [totalSessions, activeSessions, totalRefreshTokens, activeRefreshTokens, emailVerifications, passwordResets,] = await Promise.all([
                database_1.prisma.session.count({ where: { userId } }),
                database_1.prisma.session.count({ where: { userId, isActive: true } }),
                database_1.prisma.refreshToken.count({ where: { userId } }),
                database_1.prisma.refreshToken.count({ where: { userId, isRevoked: false } }),
                database_1.prisma.emailVerification.count({ where: { userId } }),
                database_1.prisma.passwordReset.count({ where: { userId } }),
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
        }
        catch (error) {
            logger_1.logger.error('Get user stats failed', { error: error.message, userId });
            return {
                success: false,
                error: 'Get stats failed',
                message: 'An error occurred while retrieving user statistics'
            };
        }
    }
    async updateUserAvatar(userId, avatarUrl) {
        try {
            const user = await database_1.prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                return {
                    success: false,
                    error: 'User not found',
                    message: 'User not found'
                };
            }
            const profile = await database_1.prisma.userProfile.upsert({
                where: { userId },
                update: { avatar: avatarUrl },
                create: {
                    userId,
                    avatar: avatarUrl,
                    language: 'en',
                    difficultyLevel: 'beginner',
                }
            });
            await (0, redis_1.getCacheService)().del(`user_profile:${userId}`);
            (0, logger_1.userActionLogger)('avatar_updated', userId, {
                avatarUrl,
            });
            await (0, events_1.publish)(events_1.Topics.USER_EVENTS, userId, {
                type: 'user.updated',
                id: userId,
                changes: { avatar: avatarUrl },
                occurredAt: new Date().toISOString(),
            });
            return {
                success: true,
                data: { avatar: avatarUrl },
                message: 'Avatar updated successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Update user avatar failed', { error: error.message, userId, avatarUrl });
            return {
                success: false,
                error: 'Update avatar failed',
                message: 'An error occurred while updating avatar'
            };
        }
    }
    async getUserById(userId) {
        try {
            const user = await database_1.prisma.user.findUnique({
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
        }
        catch (error) {
            logger_1.logger.error('Get user by ID failed', { error: error.message, userId });
            return {
                success: false,
                error: 'Get user failed',
                message: 'An error occurred while retrieving user'
            };
        }
    }
    async getAllUsers(pagination = {}) {
        try {
            const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
            const skip = (page - 1) * limit;
            const [users, total] = await Promise.all([
                database_1.prisma.user.findMany({
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
                database_1.prisma.user.count()
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: 'Users retrieved successfully',
                data: {
                    success: true,
                    message: 'Users retrieved successfully',
                    timestamp: new Date().toISOString(),
                    data: users,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages,
                        hasNext: page < totalPages,
                        hasPrev: page > 1,
                    }
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Get all users failed', { error: error.message, pagination });
            return {
                success: false,
                error: 'Get users failed',
                message: 'An error occurred while retrieving users'
            };
        }
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
exports.default = exports.userService;
//# sourceMappingURL=user.service.js.map