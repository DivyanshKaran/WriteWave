"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const logger_1 = require("../config/logger");
class AuthController {
    async register(req, res) {
        try {
            const result = await auth_service_1.authService.registerUser(req.body);
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
        }
        catch (error) {
            logger_1.logger.error('Registration controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async login(req, res) {
        try {
            const deviceInfo = {
                deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
                os: req.headers['user-agent'] || 'unknown',
                browser: req.headers['user-agent'] || 'unknown',
                userAgent: req.headers['user-agent'] || 'unknown',
            };
            const ipAddress = req.ip || req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
            const userAgent = req.headers['user-agent'] || 'unknown';
            const result = await auth_service_1.authService.loginUser(req.body, deviceInfo, ipAddress, userAgent);
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
        }
        catch (error) {
            logger_1.logger.error('Login controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async googleLogin(req, res) {
        try {
            res.status(200).json({
                success: true,
                message: 'Redirecting to Google for authentication',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Google OAuth controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async googleCallback(req, res) {
        try {
            const user = req.user;
            if (!user) {
                res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
                return;
            }
            const redirectUrl = new URL(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback`);
            redirectUrl.searchParams.set('accessToken', user.accessToken);
            redirectUrl.searchParams.set('refreshToken', user.refreshToken);
            redirectUrl.searchParams.set('provider', 'google');
            if (user.isNewUser) {
                redirectUrl.searchParams.set('isNewUser', 'true');
            }
            res.redirect(redirectUrl.toString());
        }
        catch (error) {
            logger_1.logger.error('Google OAuth callback error', { error: error.message });
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_error`);
        }
    }
    async refreshToken(req, res) {
        try {
            const result = await auth_service_1.authService.refreshToken(req.body);
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
        }
        catch (error) {
            logger_1.logger.error('Refresh token controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async logout(req, res) {
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
            const result = await auth_service_1.authService.logout(refreshToken);
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
        }
        catch (error) {
            logger_1.logger.error('Logout controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async logoutAllDevices(req, res) {
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
            const result = await auth_service_1.authService.logoutAllDevices(req.user.id);
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
        }
        catch (error) {
            logger_1.logger.error('Logout all devices controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async requestPasswordReset(req, res) {
        try {
            const result = await auth_service_1.authService.requestPasswordReset(req.body);
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
        }
        catch (error) {
            logger_1.logger.error('Password reset request controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async confirmPasswordReset(req, res) {
        try {
            const result = await auth_service_1.authService.confirmPasswordReset(req.body);
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
        }
        catch (error) {
            logger_1.logger.error('Password reset confirm controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async verifyEmail(req, res) {
        try {
            const result = await auth_service_1.authService.verifyEmail(req.body);
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
        }
        catch (error) {
            logger_1.logger.error('Email verification controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async resendEmailVerification(req, res) {
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
            const result = await auth_service_1.authService.resendEmailVerification(email);
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
        }
        catch (error) {
            logger_1.logger.error('Resend email verification controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getCurrentUser(req, res) {
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
        }
        catch (error) {
            logger_1.logger.error('Get current user controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
exports.default = exports.authController;
//# sourceMappingURL=auth.controller.js.map