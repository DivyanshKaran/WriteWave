"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lessonController = exports.LessonController = void 0;
const lesson_service_1 = require("../services/lesson.service");
const logger_1 = require("../config/logger");
class LessonController {
    async getLessons(req, res) {
        try {
            const { page, limit, sortBy, sortOrder, level, category, difficultyLevel } = req.query;
            const pagination = {
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 20,
                sortBy: sortBy || 'order',
                sortOrder: sortOrder || 'asc',
            };
            const filters = {
                level: level,
                category: category,
                difficultyLevel: difficultyLevel,
            };
            const result = await lesson_service_1.lessonService.getLessons(pagination, filters);
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
            logger_1.logger.error('Get lessons controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getLessonById(req, res) {
        try {
            const { lessonId } = req.params;
            if (!lessonId) {
                res.status(400).json({
                    success: false,
                    message: 'Lesson ID is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await lesson_service_1.lessonService.getLessonById(lessonId);
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
            logger_1.logger.error('Get lesson by ID controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getLessonsByLevel(req, res) {
        try {
            const { level } = req.params;
            const { page, limit, sortBy, sortOrder } = req.query;
            if (!level || !['N5', 'N4', 'N3', 'N2', 'N1'].includes(level)) {
                res.status(400).json({
                    success: false,
                    message: 'Valid JLPT level is required (N5, N4, N3, N2, N1)',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const pagination = {
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 20,
                sortBy: sortBy || 'order',
                sortOrder: sortOrder || 'asc',
            };
            const result = await lesson_service_1.lessonService.getLessonsByLevel(level, pagination);
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
            logger_1.logger.error('Get lessons by level controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getLessonsByCategory(req, res) {
        try {
            const { category } = req.params;
            const { page, limit, sortBy, sortOrder } = req.query;
            if (!category) {
                res.status(400).json({
                    success: false,
                    message: 'Category is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const pagination = {
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 20,
                sortBy: sortBy || 'order',
                sortOrder: sortOrder || 'asc',
            };
            const result = await lesson_service_1.lessonService.getLessonsByCategory(category, pagination);
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
            logger_1.logger.error('Get lessons by category controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getLessonSteps(req, res) {
        try {
            const { lessonId } = req.params;
            if (!lessonId) {
                res.status(400).json({
                    success: false,
                    message: 'Lesson ID is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await lesson_service_1.lessonService.getLessonSteps(lessonId);
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
            logger_1.logger.error('Get lesson steps controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getLessonPrerequisites(req, res) {
        try {
            const { lessonId } = req.params;
            if (!lessonId) {
                res.status(400).json({
                    success: false,
                    message: 'Lesson ID is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await lesson_service_1.lessonService.getLessonPrerequisites(lessonId);
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
            logger_1.logger.error('Get lesson prerequisites controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getLessonStatistics(req, res) {
        try {
            const result = await lesson_service_1.lessonService.getLessonStatistics();
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
            logger_1.logger.error('Get lesson statistics controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getLessonProgressionPath(req, res) {
        try {
            const { lessonId } = req.params;
            if (!lessonId) {
                res.status(400).json({
                    success: false,
                    message: 'Lesson ID is required',
                    error: 'MISSING_LESSON_ID',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await lesson_service_1.lessonService.getLessonProgressionPath(lessonId);
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
            logger_1.logger.error('Get lesson progression path controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async createLesson(req, res) {
        try {
            const result = await lesson_service_1.lessonService.createLesson(req.body);
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
            logger_1.logger.error('Create lesson controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async updateLesson(req, res) {
        try {
            const { lessonId } = req.params;
            if (!lessonId) {
                res.status(400).json({
                    success: false,
                    message: 'Lesson ID is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await lesson_service_1.lessonService.updateLesson(lessonId, req.body);
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
            logger_1.logger.error('Update lesson controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async deleteLesson(req, res) {
        try {
            const { lessonId } = req.params;
            if (!lessonId) {
                res.status(400).json({
                    success: false,
                    message: 'Lesson ID is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await lesson_service_1.lessonService.deleteLesson(lessonId);
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
            logger_1.logger.error('Delete lesson controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
}
exports.LessonController = LessonController;
exports.lessonController = new LessonController();
exports.default = exports.lessonController;
//# sourceMappingURL=lesson.controller.js.map