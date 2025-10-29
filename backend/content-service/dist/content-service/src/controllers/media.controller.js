"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaController = exports.MediaController = void 0;
const media_service_1 = require("../services/media.service");
const logger_1 = require("../config/logger");
class MediaController {
    async getMediaAssets(req, res) {
        try {
            const { page, limit, sortBy, sortOrder, type, category } = req.query;
            const pagination = {
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 20,
                sortBy: sortBy || 'createdAt',
                sortOrder: sortOrder || 'desc',
            };
            const filters = {
                type: type,
                category: category,
            };
            const result = await media_service_1.mediaService.getMediaAssets(pagination, filters);
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
            logger_1.logger.error('Get media assets controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getMediaAssetById(req, res) {
        try {
            const { mediaId } = req.params;
            if (!mediaId) {
                res.status(400).json({
                    success: false,
                    message: 'Media ID is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await media_service_1.mediaService.getMediaAssetById(mediaId);
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
            logger_1.logger.error('Get media asset by ID controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getMediaAssetsByType(req, res) {
        try {
            const { type } = req.params;
            const { page, limit, sortBy, sortOrder } = req.query;
            if (!type || !['image', 'audio', 'video', 'document'].includes(type)) {
                res.status(400).json({
                    success: false,
                    message: 'Valid media type is required (image, audio, video, document)',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const pagination = {
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 20,
                sortBy: sortBy || 'createdAt',
                sortOrder: sortOrder || 'desc',
            };
            const result = await media_service_1.mediaService.getMediaAssetsByType(type, pagination);
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
            logger_1.logger.error('Get media assets by type controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getMediaAssetsByCategory(req, res) {
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
                sortBy: sortBy || 'createdAt',
                sortOrder: sortOrder || 'desc',
            };
            const result = await media_service_1.mediaService.getMediaAssetsByCategory(category, pagination);
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
            logger_1.logger.error('Get media assets by category controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async searchMediaAssets(req, res) {
        try {
            const { q: query, type, category, page, limit } = req.query;
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
                limit: limit ? parseInt(limit, 10) : 20,
            };
            const filters = {
                type: type,
                category: category,
            };
            const result = await media_service_1.mediaService.searchMediaAssets(query, filters, pagination);
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
            logger_1.logger.error('Search media assets controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getMediaAssetStatistics(req, res) {
        try {
            const result = await media_service_1.mediaService.getMediaAssetStatistics();
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
            logger_1.logger.error('Get media asset statistics controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async uploadMediaAsset(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    message: 'Media file is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await media_service_1.mediaService.uploadMediaAsset(req.file, req.body);
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
            logger_1.logger.error('Upload media asset controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async updateMediaAsset(req, res) {
        try {
            const { mediaId } = req.params;
            if (!mediaId) {
                res.status(400).json({
                    success: false,
                    message: 'Media ID is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await media_service_1.mediaService.updateMediaAsset(mediaId, req.body);
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
            logger_1.logger.error('Update media asset controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async deleteMediaAsset(req, res) {
        try {
            const { mediaId } = req.params;
            if (!mediaId) {
                res.status(400).json({
                    success: false,
                    message: 'Media ID is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await media_service_1.mediaService.deleteMediaAsset(mediaId);
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
            logger_1.logger.error('Delete media asset controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getMediaAssetFile(req, res) {
        try {
            const { mediaId } = req.params;
            if (!mediaId) {
                res.status(400).json({
                    success: false,
                    message: 'Media ID is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await media_service_1.mediaService.getMediaAssetFile(mediaId);
            if (!result.success) {
                res.status(404).json({
                    success: false,
                    message: result.message,
                    error: result.error,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            res.setHeader('Content-Type', result.data.mimeType);
            res.setHeader('Content-Length', result.data.size);
            res.setHeader('Content-Disposition', `inline; filename="${result.data.filename}"`);
            res.sendFile(result.data.filePath);
        }
        catch (error) {
            logger_1.logger.error('Get media asset file controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getMediaAssetThumbnail(req, res) {
        try {
            const { mediaId } = req.params;
            if (!mediaId) {
                res.status(400).json({
                    success: false,
                    message: 'Media ID is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await media_service_1.mediaService.getMediaAssetThumbnail(mediaId);
            if (!result.success) {
                res.status(404).json({
                    success: false,
                    message: result.message,
                    error: result.error,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.sendFile(result.data.thumbnailPath);
        }
        catch (error) {
            logger_1.logger.error('Get media asset thumbnail controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
}
exports.MediaController = MediaController;
exports.mediaController = new MediaController();
exports.default = exports.mediaController;
//# sourceMappingURL=media.controller.js.map