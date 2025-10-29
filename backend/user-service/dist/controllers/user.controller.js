"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const logger_1 = require("../config/logger");
class UserController {
    async getUserProfile(req, res) {
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
            const result = await user_service_1.userService.getUserProfile(req.user.id);
            if (!result.success) {
                res.status(404).json({
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
            logger_1.logger.error('Get user profile controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async updateUserProfile(req, res) {
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
            const result = await user_service_1.userService.updateUserProfile(req.user.id, req.body);
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
                data: result.data,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Update user profile controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getUserSettings(req, res) {
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
            const result = await user_service_1.userService.getUserSettings(req.user.id);
            if (!result.success) {
                res.status(404).json({
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
            logger_1.logger.error('Get user settings controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async updateUserSettings(req, res) {
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
            const result = await user_service_1.userService.updateUserSettings(req.user.id, req.body);
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
                data: result.data,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Update user settings controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getUserSessions(req, res) {
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
            const result = await user_service_1.userService.getUserSessions(req.user.id);
            if (!result.success) {
                res.status(404).json({
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
            logger_1.logger.error('Get user sessions controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async deactivateUser(req, res) {
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
            const result = await user_service_1.userService.deactivateUser(req.user.id);
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
            logger_1.logger.error('Deactivate user controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async reactivateUser(req, res) {
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
            const result = await user_service_1.userService.reactivateUser(req.user.id);
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
            logger_1.logger.error('Reactivate user controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async deleteUser(req, res) {
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
            const result = await user_service_1.userService.deleteUser(req.user.id);
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
            logger_1.logger.error('Delete user controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async searchUsers(req, res) {
        try {
            const { q: query, page, limit, sortBy, sortOrder } = req.query;
            if (!query || typeof query !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'Search query is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const pagination = {
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 10,
                sortBy: sortBy || 'createdAt',
                sortOrder: sortOrder || 'desc',
            };
            const result = await user_service_1.userService.searchUsers(query, pagination);
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
                data: result.data,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Search users controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getUserStats(req, res) {
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
            const result = await user_service_1.userService.getUserStats(req.user.id);
            if (!result.success) {
                res.status(404).json({
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
            logger_1.logger.error('Get user stats controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async updateUserAvatar(req, res) {
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
            const { avatarUrl } = req.body;
            if (!avatarUrl) {
                res.status(400).json({
                    success: false,
                    message: 'Avatar URL is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await user_service_1.userService.updateUserAvatar(req.user.id, avatarUrl);
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
                data: result.data,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Update user avatar controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getUserById(req, res) {
        try {
            const { userId } = req.params;
            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await user_service_1.userService.getUserById(userId);
            if (!result.success) {
                res.status(404).json({
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
            logger_1.logger.error('Get user by ID controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getAllUsers(req, res) {
        try {
            const { page, limit, sortBy, sortOrder } = req.query;
            const pagination = {
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 10,
                sortBy: sortBy || 'createdAt',
                sortOrder: sortOrder || 'desc',
            };
            const result = await user_service_1.userService.getAllUsers(pagination);
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
                data: result.data,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get all users controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
exports.default = exports.userController;
//# sourceMappingURL=user.controller.js.map