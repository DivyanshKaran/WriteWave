"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const database_1 = require("../config/database");
const jwt_1 = require("../utils/jwt");
const password_1 = require("../utils/password");
const email_1 = require("../utils/email");
const logger_1 = require("../config/logger");
const events_1 = require("../utils/events");
class AuthService {
    async registerUser(data) {
        try {
            const existingUser = await database_1.prisma.user.findFirst({
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
            const hashedPassword = await password_1.passwordService.hashPassword(data.password);
            const result = await database_1.prisma.$transaction(async (tx) => {
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
                await tx.userProfile.create({
                    data: {
                        userId: user.id,
                        language: 'en',
                        difficultyLevel: 'beginner',
                    }
                });
                await tx.userSettings.create({
                    data: {
                        userId: user.id,
                    }
                });
                return user;
            });
            const verificationToken = password_1.passwordService.generateEmailVerificationToken();
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await database_1.prisma.emailVerification.create({
                data: {
                    userId: result.id,
                    token: verificationToken,
                    email: result.email,
                    expiresAt,
                }
            });
            const refreshTokenId = password_1.passwordService.generateRefreshTokenId();
            const { accessToken, refreshToken } = jwt_1.jwtService.generateTokenPair(result.id, result.email, refreshTokenId);
            const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await database_1.prisma.refreshToken.create({
                data: {
                    userId: result.id,
                    token: refreshToken,
                    expiresAt: refreshTokenExpiresAt,
                }
            });
            try {
                await email_1.emailService.sendWelcomeEmail(result.email, result.firstName || 'User', verificationToken);
            }
            catch (emailError) {
                logger_1.logger.warn('Failed to send welcome email', {
                    userId: result.id,
                    error: emailError.message
                });
            }
            (0, logger_1.authLogger)('user_registered', result.id, {
                email: result.email,
                username: result.username,
            });
            await (0, events_1.publish)(events_1.Topics.USER_EVENTS, result.id, {
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
        }
        catch (error) {
            logger_1.logger.error('User registration failed', { error: error.message, data });
            return {
                success: false,
                error: 'Registration failed',
                message: 'An error occurred during registration'
            };
        }
    }
    async loginUser(data, deviceInfo, ipAddress, userAgent) {
        try {
            const user = await database_1.prisma.user.findUnique({
                where: { email: data.email },
                include: {
                    profile: true,
                    settings: true,
                }
            });
            if (!user) {
                (0, logger_1.authLogger)('login_failed', undefined, {
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
                (0, logger_1.authLogger)('login_failed', user.id, {
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
                (0, logger_1.authLogger)('login_failed', user.id, {
                    email: data.email,
                    reason: 'no_password_set',
                });
                return {
                    success: false,
                    error: 'Invalid credentials',
                    message: 'Email or password is incorrect'
                };
            }
            const isPasswordValid = await password_1.passwordService.comparePassword(data.password, user.password);
            if (!isPasswordValid) {
                (0, logger_1.authLogger)('login_failed', user.id, {
                    email: data.email,
                    reason: 'invalid_password',
                });
                return {
                    success: false,
                    error: 'Invalid credentials',
                    message: 'Email or password is incorrect'
                };
            }
            await database_1.prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() }
            });
            const refreshTokenId = password_1.passwordService.generateRefreshTokenId();
            const { accessToken, refreshToken } = jwt_1.jwtService.generateTokenPair(user.id, user.email, refreshTokenId);
            const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await database_1.prisma.refreshToken.create({
                data: {
                    userId: user.id,
                    token: refreshToken,
                    expiresAt: refreshTokenExpiresAt,
                    deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : null,
                }
            });
            const sessionToken = accessToken.split('.')[2];
            const sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await database_1.prisma.session.create({
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
            (0, logger_1.authLogger)('user_logged_in', user.id, {
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
        }
        catch (error) {
            logger_1.logger.error('User login failed', { error: error.message, email: data.email });
            return {
                success: false,
                error: 'Login failed',
                message: 'An error occurred during login'
            };
        }
    }
    async oauthLogin(data, deviceInfo, ipAddress, userAgent) {
        try {
            let user = await database_1.prisma.user.findFirst({
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
                isNewUser = true;
                user = await database_1.prisma.$transaction(async (tx) => {
                    const newUser = await tx.user.create({
                        data: {
                            email: data.email,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            [`${data.provider}Id`]: data.providerId,
                            oauthProvider: data.provider,
                            isEmailVerified: true,
                            isActive: true,
                        },
                        include: {
                            profile: true,
                            settings: true,
                        }
                    });
                    await tx.userProfile.create({
                        data: {
                            userId: newUser.id,
                            language: 'en',
                            difficultyLevel: 'beginner',
                        }
                    });
                    await tx.userSettings.create({
                        data: {
                            userId: newUser.id,
                        }
                    });
                    return newUser;
                });
            }
            else {
                if (!user[`${data.provider}Id`]) {
                    user = await database_1.prisma.user.update({
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
                await database_1.prisma.user.update({
                    where: { id: user.id },
                    data: { lastLoginAt: new Date() }
                });
            }
            if (!user.isActive) {
                (0, logger_1.authLogger)('oauth_login_failed', user.id, {
                    provider: data.provider,
                    reason: 'account_deactivated',
                });
                return {
                    success: false,
                    error: 'Account deactivated',
                    message: 'Your account has been deactivated'
                };
            }
            const refreshTokenId = password_1.passwordService.generateRefreshTokenId();
            const { accessToken, refreshToken } = jwt_1.jwtService.generateTokenPair(user.id, user.email, refreshTokenId);
            const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await database_1.prisma.refreshToken.create({
                data: {
                    userId: user.id,
                    token: refreshToken,
                    expiresAt: refreshTokenExpiresAt,
                    deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : null,
                }
            });
            const sessionToken = accessToken.split('.')[2];
            const sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await database_1.prisma.session.create({
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
            (0, logger_1.authLogger)('oauth_login_success', user.id, {
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
        }
        catch (error) {
            logger_1.logger.error('OAuth login failed', { error: error.message, provider: data.provider });
            return {
                success: false,
                error: 'OAuth login failed',
                message: 'An error occurred during OAuth login'
            };
        }
    }
    async refreshToken(data) {
        try {
            const decoded = jwt_1.jwtService.verifyRefreshToken(data.refreshToken);
            const refreshTokenRecord = await database_1.prisma.refreshToken.findUnique({
                where: { token: data.refreshToken },
                include: { user: true }
            });
            if (!refreshTokenRecord || refreshTokenRecord.isRevoked) {
                (0, logger_1.authLogger)('refresh_token_invalid', decoded.userId, {
                    reason: 'token_not_found_or_revoked',
                });
                return {
                    success: false,
                    error: 'Invalid refresh token',
                    message: 'Refresh token is invalid or has been revoked'
                };
            }
            if (refreshTokenRecord.expiresAt < new Date()) {
                (0, logger_1.authLogger)('refresh_token_expired', decoded.userId, {
                    reason: 'token_expired',
                });
                return {
                    success: false,
                    error: 'Refresh token expired',
                    message: 'Refresh token has expired'
                };
            }
            if (!refreshTokenRecord.user.isActive) {
                (0, logger_1.authLogger)('refresh_token_failed', decoded.userId, {
                    reason: 'user_inactive',
                });
                return {
                    success: false,
                    error: 'Account deactivated',
                    message: 'Your account has been deactivated'
                };
            }
            await database_1.prisma.refreshToken.update({
                where: { id: refreshTokenRecord.id },
                data: { isRevoked: true }
            });
            const newRefreshTokenId = password_1.passwordService.generateRefreshTokenId();
            const { accessToken, refreshToken } = jwt_1.jwtService.generateTokenPair(refreshTokenRecord.user.id, refreshTokenRecord.user.email, newRefreshTokenId);
            const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await database_1.prisma.refreshToken.create({
                data: {
                    userId: refreshTokenRecord.user.id,
                    token: refreshToken,
                    expiresAt: refreshTokenExpiresAt,
                    deviceInfo: refreshTokenRecord.deviceInfo,
                }
            });
            (0, logger_1.authLogger)('token_refreshed', refreshTokenRecord.user.id);
            return {
                success: true,
                data: {
                    accessToken,
                    refreshToken,
                },
                message: 'Token refreshed successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Token refresh failed', { error: error.message });
            return {
                success: false,
                error: 'Token refresh failed',
                message: 'An error occurred during token refresh'
            };
        }
    }
    async logout(refreshToken) {
        try {
            await database_1.prisma.refreshToken.updateMany({
                where: { token: refreshToken },
                data: { isRevoked: true }
            });
            (0, logger_1.authLogger)('user_logged_out', undefined, {
                refreshToken: refreshToken.substring(0, 10) + '...',
            });
            return {
                success: true,
                message: 'Logout successful'
            };
        }
        catch (error) {
            logger_1.logger.error('Logout failed', { error: error.message });
            return {
                success: false,
                error: 'Logout failed',
                message: 'An error occurred during logout'
            };
        }
    }
    async logoutAllDevices(userId) {
        try {
            await database_1.prisma.refreshToken.updateMany({
                where: { userId },
                data: { isRevoked: true }
            });
            (0, logger_1.authLogger)('user_logged_out_all', userId);
            return {
                success: true,
                message: 'Logged out from all devices successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Logout all devices failed', { error: error.message, userId });
            return {
                success: false,
                error: 'Logout all devices failed',
                message: 'An error occurred during logout'
            };
        }
    }
    async requestPasswordReset(data) {
        try {
            const user = await database_1.prisma.user.findUnique({
                where: { email: data.email }
            });
            if (!user) {
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
            const resetToken = password_1.passwordService.generatePasswordResetToken();
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
            await database_1.prisma.passwordReset.create({
                data: {
                    userId: user.id,
                    token: resetToken,
                    expiresAt,
                }
            });
            try {
                await email_1.emailService.sendPasswordResetEmail(user.email, user.firstName || 'User', resetToken);
            }
            catch (emailError) {
                logger_1.logger.warn('Failed to send password reset email', {
                    userId: user.id,
                    error: emailError.message
                });
            }
            (0, logger_1.authLogger)('password_reset_requested', user.id, {
                email: user.email,
            });
            return {
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent'
            };
        }
        catch (error) {
            logger_1.logger.error('Password reset request failed', { error: error.message, email: data.email });
            return {
                success: false,
                error: 'Password reset request failed',
                message: 'An error occurred while processing your request'
            };
        }
    }
    async confirmPasswordReset(data) {
        try {
            const resetRecord = await database_1.prisma.passwordReset.findUnique({
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
            const hashedPassword = await password_1.passwordService.hashPassword(data.newPassword);
            await database_1.prisma.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: resetRecord.user.id },
                    data: { password: hashedPassword }
                });
                await tx.passwordReset.update({
                    where: { id: resetRecord.id },
                    data: { isUsed: true }
                });
                await tx.refreshToken.updateMany({
                    where: { userId: resetRecord.user.id },
                    data: { isRevoked: true }
                });
            });
            try {
                await email_1.emailService.sendPasswordChangedNotification(resetRecord.user.email, resetRecord.user.firstName || 'User');
            }
            catch (emailError) {
                logger_1.logger.warn('Failed to send password changed notification', {
                    userId: resetRecord.user.id,
                    error: emailError.message
                });
            }
            (0, logger_1.authLogger)('password_reset_completed', resetRecord.user.id);
            return {
                success: true,
                message: 'Password has been reset successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Password reset confirm failed', { error: error.message });
            return {
                success: false,
                error: 'Password reset failed',
                message: 'An error occurred while resetting your password'
            };
        }
    }
    async verifyEmail(data) {
        try {
            const verificationRecord = await database_1.prisma.emailVerification.findUnique({
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
            await database_1.prisma.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: verificationRecord.user.id },
                    data: { isEmailVerified: true }
                });
                await tx.emailVerification.update({
                    where: { id: verificationRecord.id },
                    data: { isUsed: true }
                });
            });
            (0, logger_1.authLogger)('email_verified', verificationRecord.user.id, {
                email: verificationRecord.email,
            });
            return {
                success: true,
                message: 'Email has been verified successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Email verification failed', { error: error.message });
            return {
                success: false,
                error: 'Email verification failed',
                message: 'An error occurred while verifying your email'
            };
        }
    }
    async resendEmailVerification(email) {
        try {
            const user = await database_1.prisma.user.findUnique({
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
            const verificationToken = password_1.passwordService.generateEmailVerificationToken();
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await database_1.prisma.emailVerification.create({
                data: {
                    userId: user.id,
                    token: verificationToken,
                    email: user.email,
                    expiresAt,
                }
            });
            try {
                await email_1.emailService.sendEmailVerificationEmail(user.email, user.firstName || 'User', verificationToken);
            }
            catch (emailError) {
                logger_1.logger.warn('Failed to send email verification', {
                    userId: user.id,
                    error: emailError.message
                });
            }
            (0, logger_1.authLogger)('email_verification_resent', user.id, {
                email: user.email,
            });
            return {
                success: true,
                message: 'Verification email has been sent'
            };
        }
        catch (error) {
            logger_1.logger.error('Resend email verification failed', { error: error.message, email });
            return {
                success: false,
                error: 'Resend verification failed',
                message: 'An error occurred while sending verification email'
            };
        }
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
exports.default = exports.authService;
//# sourceMappingURL=auth.service.js.map