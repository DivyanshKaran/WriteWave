"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaService = exports.MediaService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const sharp_1 = __importDefault(require("sharp"));
const mime_types_1 = __importDefault(require("mime-types"));
class MediaService {
    async getMediaAssets(pagination = {}, filters = {}) {
        try {
            const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
            const skip = (page - 1) * limit;
            const where = {
                isActive: true,
            };
            if (filters.type) {
                where.type = filters.type;
            }
            if (filters.characterId) {
                where.characterId = filters.characterId;
            }
            if (filters.vocabularyWordId) {
                where.vocabularyWordId = filters.vocabularyWordId;
            }
            if (filters.lessonId) {
                where.lessonId = filters.lessonId;
            }
            const [mediaAssets, total] = await Promise.all([
                database_1.prisma.mediaAsset.findMany({
                    where,
                    orderBy: { [sortBy]: sortOrder },
                    skip,
                    take: limit,
                }),
                database_1.prisma.mediaAsset.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            (0, logger_1.mediaLogger)('media_assets_retrieved', undefined, {
                count: mediaAssets.length,
                total,
                page,
                limit,
                filters,
            });
            return {
                success: true,
                data: {
                    data: mediaAssets,
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
                message: 'Media assets retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get media assets failed', { error: error.message, pagination, filters });
            return {
                success: false,
                error: 'Get media assets failed',
                message: 'An error occurred while retrieving media assets'
            };
        }
    }
    async getMediaAssetById(mediaId) {
        try {
            const mediaAsset = await database_1.prisma.mediaAsset.findUnique({
                where: { id: mediaId },
            });
            if (!mediaAsset) {
                return {
                    success: false,
                    error: 'Media asset not found',
                    message: 'Media asset not found'
                };
            }
            (0, logger_1.mediaLogger)('media_asset_retrieved', mediaId, {
                filename: mediaAsset.filename,
                type: mediaAsset.type,
                size: mediaAsset.size,
            });
            return {
                success: true,
                data: mediaAsset,
                message: 'Media asset retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get media asset by ID failed', { error: error.message, mediaId });
            return {
                success: false,
                error: 'Get media asset failed',
                message: 'An error occurred while retrieving media asset'
            };
        }
    }
    async uploadMediaAsset(file, data) {
        try {
            const allowedTypes = this.getAllowedTypes(data.type);
            if (!allowedTypes.includes(file.mimetype)) {
                return {
                    success: false,
                    error: 'Invalid file type',
                    message: `File type ${file.mimetype} is not allowed for ${data.type}`
                };
            }
            const fileExtension = path_1.default.extname(file.originalname);
            const filename = `${(0, uuid_1.v4)()}${fileExtension}`;
            const uploadPath = process.env.UPLOAD_PATH || './uploads';
            const filePath = path_1.default.join(uploadPath, filename);
            await promises_1.default.mkdir(uploadPath, { recursive: true });
            if (file.buffer) {
                await promises_1.default.writeFile(filePath, file.buffer);
            }
            else {
                await promises_1.default.copyFile(file.path, filePath);
            }
            let processedData = {};
            if (data.type === 'IMAGE') {
                processedData = await this.processImage(filePath, filename);
            }
            else if (data.type === 'AUDIO') {
                processedData = await this.processAudio(filePath, filename);
            }
            const mediaAsset = await database_1.prisma.mediaAsset.create({
                data: {
                    filename,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    type: data.type,
                    url: `${process.env.MEDIA_BASE_URL || 'http://localhost:8002/media'}/${filename}`,
                    thumbnailUrl: processedData.thumbnailUrl,
                    altText: data.altText,
                    description: data.description,
                    width: processedData.width,
                    height: processedData.height,
                    duration: processedData.duration,
                    characterId: data.characterId,
                    vocabularyWordId: data.vocabularyWordId,
                    lessonId: data.lessonId,
                },
            });
            (0, logger_1.mediaLogger)('media_asset_uploaded', mediaAsset.id, {
                filename: mediaAsset.filename,
                type: mediaAsset.type,
                size: mediaAsset.size,
                originalName: file.originalname,
            });
            return {
                success: true,
                data: mediaAsset,
                message: 'Media asset uploaded successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Upload media asset failed', { error: error.message, data });
            return {
                success: false,
                error: 'Upload media asset failed',
                message: 'An error occurred while uploading media asset'
            };
        }
    }
    async updateMediaAsset(mediaId, data) {
        try {
            const mediaAsset = await database_1.prisma.mediaAsset.update({
                where: { id: mediaId },
                data: {
                    ...data,
                    updatedAt: new Date(),
                },
            });
            (0, logger_1.mediaLogger)('media_asset_updated', mediaId, {
                filename: mediaAsset.filename,
                type: mediaAsset.type,
            });
            return {
                success: true,
                data: mediaAsset,
                message: 'Media asset updated successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Update media asset failed', { error: error.message, mediaId, data });
            return {
                success: false,
                error: 'Update media asset failed',
                message: 'An error occurred while updating media asset'
            };
        }
    }
    async deleteMediaAsset(mediaId) {
        try {
            const mediaAsset = await database_1.prisma.mediaAsset.findUnique({
                where: { id: mediaId },
            });
            if (!mediaAsset) {
                return {
                    success: false,
                    error: 'Media asset not found',
                    message: 'Media asset not found'
                };
            }
            const uploadPath = process.env.UPLOAD_PATH || './uploads';
            const filePath = path_1.default.join(uploadPath, mediaAsset.filename);
            try {
                await promises_1.default.unlink(filePath);
            }
            catch (fileError) {
                logger_1.logger.warn('Failed to delete file from filesystem', { filePath, error: fileError.message });
            }
            if (mediaAsset.thumbnailUrl) {
                const thumbnailPath = path_1.default.join(uploadPath, 'thumbnails', mediaAsset.filename);
                try {
                    await promises_1.default.unlink(thumbnailPath);
                }
                catch (thumbnailError) {
                    logger_1.logger.warn('Failed to delete thumbnail from filesystem', { thumbnailPath, error: thumbnailError.message });
                }
            }
            await database_1.prisma.mediaAsset.update({
                where: { id: mediaId },
                data: { isActive: false },
            });
            (0, logger_1.mediaLogger)('media_asset_deleted', mediaId, {
                filename: mediaAsset.filename,
                type: mediaAsset.type,
            });
            return {
                success: true,
                message: 'Media asset deleted successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Delete media asset failed', { error: error.message, mediaId });
            return {
                success: false,
                error: 'Delete media asset failed',
                message: 'An error occurred while deleting media asset'
            };
        }
    }
    async getMediaAssetsByCharacter(characterId) {
        try {
            const mediaAssets = await database_1.prisma.mediaAsset.findMany({
                where: {
                    characterId,
                    isActive: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            return {
                success: true,
                data: mediaAssets,
                message: 'Media assets retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get media assets by character failed', { error: error.message, characterId });
            return {
                success: false,
                error: 'Get media assets failed',
                message: 'An error occurred while retrieving media assets'
            };
        }
    }
    async getMediaAssetsByVocabularyWord(vocabularyWordId) {
        try {
            const mediaAssets = await database_1.prisma.mediaAsset.findMany({
                where: {
                    vocabularyWordId,
                    isActive: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            return {
                success: true,
                data: mediaAssets,
                message: 'Media assets retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get media assets by vocabulary word failed', { error: error.message, vocabularyWordId });
            return {
                success: false,
                error: 'Get media assets failed',
                message: 'An error occurred while retrieving media assets'
            };
        }
    }
    async getMediaAssetsByLesson(lessonId) {
        try {
            const mediaAssets = await database_1.prisma.mediaAsset.findMany({
                where: {
                    lessonId,
                    isActive: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            return {
                success: true,
                data: mediaAssets,
                message: 'Media assets retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get media assets by lesson failed', { error: error.message, lessonId });
            return {
                success: false,
                error: 'Get media assets failed',
                message: 'An error occurred while retrieving media assets'
            };
        }
    }
    async getMediaAssetStatistics() {
        try {
            const stats = await database_1.prisma.mediaAsset.groupBy({
                by: ['type'],
                where: { isActive: true },
                _count: { id: true },
                _sum: { size: true },
            });
            const total = await database_1.prisma.mediaAsset.count({
                where: { isActive: true },
            });
            const totalSize = await database_1.prisma.mediaAsset.aggregate({
                where: { isActive: true },
                _sum: { size: true },
            });
            return {
                success: true,
                data: {
                    total,
                    totalSize: totalSize._sum.size || 0,
                    byType: stats.reduce((acc, stat) => {
                        acc[stat.type] = {
                            count: stat._count.id,
                            size: stat._sum.size || 0,
                        };
                        return acc;
                    }, {}),
                },
                message: 'Media asset statistics retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get media asset statistics failed', { error: error.message });
            return {
                success: false,
                error: 'Get statistics failed',
                message: 'An error occurred while retrieving media asset statistics'
            };
        }
    }
    async processImage(filePath, filename) {
        try {
            const uploadPath = process.env.UPLOAD_PATH || './uploads';
            const thumbnailDir = path_1.default.join(uploadPath, 'thumbnails');
            await promises_1.default.mkdir(thumbnailDir, { recursive: true });
            const image = (0, sharp_1.default)(filePath);
            const metadata = await image.metadata();
            const thumbnailFilename = `thumb_${filename}`;
            const thumbnailPath = path_1.default.join(thumbnailDir, thumbnailFilename);
            await image
                .resize(parseInt(process.env.THUMBNAIL_SIZE || '300'), parseInt(process.env.THUMBNAIL_SIZE || '300'), {
                fit: 'inside',
                withoutEnlargement: true,
            })
                .jpeg({ quality: parseInt(process.env.IMAGE_QUALITY || '85') })
                .toFile(thumbnailPath);
            const thumbnailUrl = `${process.env.MEDIA_BASE_URL || 'http://localhost:8002/media'}/thumbnails/${thumbnailFilename}`;
            return {
                width: metadata.width,
                height: metadata.height,
                thumbnailUrl,
            };
        }
        catch (error) {
            logger_1.logger.error('Image processing failed', { error: error.message, filePath });
            return {};
        }
    }
    async processAudio(filePath, filename) {
        try {
            return {
                duration: null,
            };
        }
        catch (error) {
            logger_1.logger.error('Audio processing failed', { error: error.message, filePath });
            return {};
        }
    }
    getAllowedTypes(mediaType) {
        const config = {
            IMAGE: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(','),
            AUDIO: (process.env.ALLOWED_AUDIO_TYPES || 'audio/mpeg,audio/wav,audio/ogg,audio/mp4').split(','),
            VIDEO: (process.env.ALLOWED_VIDEO_TYPES || 'video/mp4,video/webm,video/ogg').split(','),
            ANIMATION: (process.env.ALLOWED_IMAGE_TYPES || 'image/gif,image/webp').split(','),
        };
        return mediaType ? config[mediaType] : Object.values(config).flat();
    }
    validateFileSize(size) {
        const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10);
        return size <= maxSize;
    }
    getMimeType(filename) {
        return mime_types_1.default.lookup(filename) || 'application/octet-stream';
    }
    async cleanupOrphanedMediaAssets() {
        try {
            const uploadPath = process.env.UPLOAD_PATH || './uploads';
            const mediaAssets = await database_1.prisma.mediaAsset.findMany({
                where: { isActive: true },
                select: { filename: true },
            });
            const dbFilenames = new Set(mediaAssets.map(asset => asset.filename));
            const files = await promises_1.default.readdir(uploadPath);
            const orphanedFiles = files.filter(file => !dbFilenames.has(file));
            for (const file of orphanedFiles) {
                const filePath = path_1.default.join(uploadPath, file);
                try {
                    await promises_1.default.unlink(filePath);
                    logger_1.logger.info('Deleted orphaned file', { filePath });
                }
                catch (error) {
                    logger_1.logger.warn('Failed to delete orphaned file', { filePath, error: error.message });
                }
            }
            (0, logger_1.mediaLogger)('orphaned_media_cleaned', undefined, {
                orphanedCount: orphanedFiles.length,
            });
            return {
                success: true,
                message: `Cleaned up ${orphanedFiles.length} orphaned media assets`
            };
        }
        catch (error) {
            logger_1.logger.error('Cleanup orphaned media assets failed', { error: error.message });
            return {
                success: false,
                error: 'Cleanup failed',
                message: 'An error occurred while cleaning up orphaned media assets'
            };
        }
    }
    async getMediaAssetsByType(type, pagination = {}) {
        try {
            const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
            const skip = (page - 1) * limit;
            const result = await database_1.prisma.$transaction(async (tx) => {
                const mediaAssets = await tx.mediaAsset.findMany({
                    where: { type },
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
                    include: {
                        character: true,
                        lesson: true
                    }
                });
                const total = await tx.mediaAsset.count({
                    where: { type }
                });
                return { mediaAssets, total };
            });
            const totalPages = Math.ceil(result.total / limit);
            const searchResults = {
                data: result.mediaAssets,
                total: result.total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            };
            return {
                success: true,
                data: searchResults,
                message: 'Media assets retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get media assets by type', { type, error });
            return {
                success: false,
                error: 'Failed to retrieve media assets',
                message: 'An error occurred while retrieving media assets by type'
            };
        }
    }
    async getMediaAssetsByCategory(category, pagination = {}) {
        try {
            const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
            const skip = (page - 1) * limit;
            const result = await database_1.prisma.$transaction(async (tx) => {
                const mediaAssets = await tx.mediaAsset.findMany({
                    where: {
                        character: {
                            type: category
                        }
                    },
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
                    include: {
                        character: true,
                        lesson: true
                    }
                });
                const total = await tx.mediaAsset.count({
                    where: {
                        character: {
                            type: category
                        }
                    }
                });
                return { mediaAssets, total };
            });
            const totalPages = Math.ceil(result.total / limit);
            const searchResults = {
                data: result.mediaAssets,
                total: result.total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            };
            return {
                success: true,
                data: searchResults,
                message: 'Media assets retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get media assets by category', { category, error });
            return {
                success: false,
                error: 'Failed to retrieve media assets',
                message: 'An error occurred while retrieving media assets by category'
            };
        }
    }
    async searchMediaAssets(query, filters = {}, pagination = {}) {
        try {
            const { page = 1, limit = 20 } = pagination;
            const skip = (page - 1) * limit;
            const result = await database_1.prisma.$transaction(async (tx) => {
                const mediaAssets = await tx.mediaAsset.findMany({
                    where: {
                        OR: [
                            { filename: { contains: query, mode: 'insensitive' } },
                            { originalName: { contains: query, mode: 'insensitive' } },
                            { description: { contains: query, mode: 'insensitive' } }
                        ],
                        ...filters
                    },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        character: true,
                        lesson: true
                    }
                });
                const total = await tx.mediaAsset.count({
                    where: {
                        OR: [
                            { filename: { contains: query, mode: 'insensitive' } },
                            { originalName: { contains: query, mode: 'insensitive' } },
                            { description: { contains: query, mode: 'insensitive' } }
                        ],
                        ...filters
                    }
                });
                return { mediaAssets, total };
            });
            const totalPages = Math.ceil(result.total / limit);
            const searchResults = {
                data: result.mediaAssets,
                total: result.total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            };
            return {
                success: true,
                data: searchResults,
                message: 'Media assets search completed successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to search media assets', { query, error });
            return {
                success: false,
                error: 'Failed to search media assets',
                message: 'An error occurred while searching media assets'
            };
        }
    }
    async getMediaAssetFile(mediaId) {
        try {
            const mediaAsset = await database_1.prisma.mediaAsset.findUnique({
                where: { id: mediaId }
            });
            if (!mediaAsset) {
                return {
                    success: false,
                    error: 'Media asset not found',
                    message: 'The specified media asset does not exist'
                };
            }
            return {
                success: true,
                data: mediaAsset,
                message: 'Media asset file retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get media asset file', { mediaId, error });
            return {
                success: false,
                error: 'Failed to retrieve media asset file',
                message: 'An error occurred while retrieving media asset file'
            };
        }
    }
    async getMediaAssetThumbnail(mediaId) {
        try {
            const mediaAsset = await database_1.prisma.mediaAsset.findUnique({
                where: { id: mediaId }
            });
            if (!mediaAsset) {
                return {
                    success: false,
                    error: 'Media asset not found',
                    message: 'The specified media asset does not exist'
                };
            }
            return {
                success: true,
                data: mediaAsset,
                message: 'Media asset thumbnail retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get media asset thumbnail', { mediaId, error });
            return {
                success: false,
                error: 'Failed to retrieve media asset thumbnail',
                message: 'An error occurred while retrieving media asset thumbnail'
            };
        }
    }
}
exports.MediaService = MediaService;
exports.mediaService = new MediaService();
exports.default = exports.mediaService;
//# sourceMappingURL=media.service.js.map