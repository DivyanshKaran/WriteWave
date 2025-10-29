import { prisma } from '../config/database';
import { contentCacheService } from '../config/redis';
import { logger, mediaLogger } from '../config/logger';
import { 
  MediaData, 
  FileUpload,
  ImageProcessingOptions,
  AudioProcessingOptions,
  ServiceResponse,
  PaginationParams,
  SearchResult,
  MediaType
} from '../types';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import mime from 'mime-types';

// Media service class
export class MediaService {
  // Get all media assets with pagination
  async getMediaAssets(
    pagination: PaginationParams = {},
    filters: {
      type?: MediaType;
      characterId?: string;
      vocabularyWordId?: string;
      lessonId?: string;
    } = {}
  ): Promise<ServiceResponse<SearchResult<any>>> {
    try {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
      const skip = (page - 1) * limit;

      const where: any = {
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
        prisma.mediaAsset.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.mediaAsset.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      mediaLogger('media_assets_retrieved', undefined, {
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
    } catch (error) {
      logger.error('Get media assets failed', { error: error.message, pagination, filters });
      return {
        success: false,
        error: 'Get media assets failed',
        message: 'An error occurred while retrieving media assets'
      };
    }
  }

  // Get media asset by ID
  async getMediaAssetById(mediaId: string): Promise<ServiceResponse<any>> {
    try {
      const mediaAsset = await prisma.mediaAsset.findUnique({
        where: { id: mediaId },
      });

      if (!mediaAsset) {
        return {
          success: false,
          error: 'Media asset not found',
          message: 'Media asset not found'
        };
      }

      mediaLogger('media_asset_retrieved', mediaId, {
        filename: mediaAsset.filename,
        type: mediaAsset.type,
        size: mediaAsset.size,
      });

      return {
        success: true,
        data: mediaAsset,
        message: 'Media asset retrieved successfully'
      };
    } catch (error) {
      logger.error('Get media asset by ID failed', { error: error.message, mediaId });
      return {
        success: false,
        error: 'Get media asset failed',
        message: 'An error occurred while retrieving media asset'
      };
    }
  }

  // Upload media asset
  async uploadMediaAsset(
    file: FileUpload,
    data: Partial<MediaData>
  ): Promise<ServiceResponse<any>> {
    try {
      // Validate file type
      const allowedTypes = this.getAllowedTypes(data.type);
      if (!allowedTypes.includes(file.mimetype)) {
        return {
          success: false,
          error: 'Invalid file type',
          message: `File type ${file.mimetype} is not allowed for ${data.type}`
        };
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const filename = `${uuidv4()}${fileExtension}`;
      const uploadPath = process.env.UPLOAD_PATH || './uploads';
      const filePath = path.join(uploadPath, filename);

      // Ensure upload directory exists
      await fs.mkdir(uploadPath, { recursive: true });

      // Save file
      if (file.buffer) {
        await fs.writeFile(filePath, file.buffer);
      } else {
        await fs.copyFile(file.path, filePath);
      }

      // Process file based on type
      let processedData: any = {};
      if (data.type === 'IMAGE') {
        processedData = await this.processImage(filePath, filename);
      } else if (data.type === 'AUDIO') {
        processedData = await this.processAudio(filePath, filename);
      }

      // Create media asset record
      const mediaAsset = await prisma.mediaAsset.create({
        data: {
          filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          type: data.type!,
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

      mediaLogger('media_asset_uploaded', mediaAsset.id, {
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
    } catch (error) {
      logger.error('Upload media asset failed', { error: error.message, data });
      return {
        success: false,
        error: 'Upload media asset failed',
        message: 'An error occurred while uploading media asset'
      };
    }
  }

  // Update media asset
  async updateMediaAsset(
    mediaId: string,
    data: Partial<MediaData>
  ): Promise<ServiceResponse<any>> {
    try {
      const mediaAsset = await prisma.mediaAsset.update({
        where: { id: mediaId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      mediaLogger('media_asset_updated', mediaId, {
        filename: mediaAsset.filename,
        type: mediaAsset.type,
      });

      return {
        success: true,
        data: mediaAsset,
        message: 'Media asset updated successfully'
      };
    } catch (error) {
      logger.error('Update media asset failed', { error: error.message, mediaId, data });
      return {
        success: false,
        error: 'Update media asset failed',
        message: 'An error occurred while updating media asset'
      };
    }
  }

  // Delete media asset
  async deleteMediaAsset(mediaId: string): Promise<ServiceResponse<void>> {
    try {
      const mediaAsset = await prisma.mediaAsset.findUnique({
        where: { id: mediaId },
      });

      if (!mediaAsset) {
        return {
          success: false,
          error: 'Media asset not found',
          message: 'Media asset not found'
        };
      }

      // Delete file from filesystem
      const uploadPath = process.env.UPLOAD_PATH || './uploads';
      const filePath = path.join(uploadPath, mediaAsset.filename);
      
      try {
        await fs.unlink(filePath);
      } catch (fileError) {
        logger.warn('Failed to delete file from filesystem', { filePath, error: fileError.message });
      }

      // Delete thumbnail if exists
      if (mediaAsset.thumbnailUrl) {
        const thumbnailPath = path.join(uploadPath, 'thumbnails', mediaAsset.filename);
        try {
          await fs.unlink(thumbnailPath);
        } catch (thumbnailError) {
          logger.warn('Failed to delete thumbnail from filesystem', { thumbnailPath, error: thumbnailError.message });
        }
      }

      // Delete from database
      await prisma.mediaAsset.update({
        where: { id: mediaId },
        data: { isActive: false },
      });

      mediaLogger('media_asset_deleted', mediaId, {
        filename: mediaAsset.filename,
        type: mediaAsset.type,
      });

      return {
        success: true,
        message: 'Media asset deleted successfully'
      };
    } catch (error) {
      logger.error('Delete media asset failed', { error: error.message, mediaId });
      return {
        success: false,
        error: 'Delete media asset failed',
        message: 'An error occurred while deleting media asset'
      };
    }
  }

  // Get media assets by character
  async getMediaAssetsByCharacter(characterId: string): Promise<ServiceResponse<any[]>> {
    try {
      const mediaAssets = await prisma.mediaAsset.findMany({
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
    } catch (error) {
      logger.error('Get media assets by character failed', { error: error.message, characterId });
      return {
        success: false,
        error: 'Get media assets failed',
        message: 'An error occurred while retrieving media assets'
      };
    }
  }

  // Get media assets by vocabulary word
  async getMediaAssetsByVocabularyWord(vocabularyWordId: string): Promise<ServiceResponse<any[]>> {
    try {
      const mediaAssets = await prisma.mediaAsset.findMany({
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
    } catch (error) {
      logger.error('Get media assets by vocabulary word failed', { error: error.message, vocabularyWordId });
      return {
        success: false,
        error: 'Get media assets failed',
        message: 'An error occurred while retrieving media assets'
      };
    }
  }

  // Get media assets by lesson
  async getMediaAssetsByLesson(lessonId: string): Promise<ServiceResponse<any[]>> {
    try {
      const mediaAssets = await prisma.mediaAsset.findMany({
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
    } catch (error) {
      logger.error('Get media assets by lesson failed', { error: error.message, lessonId });
      return {
        success: false,
        error: 'Get media assets failed',
        message: 'An error occurred while retrieving media assets'
      };
    }
  }

  // Get media asset statistics
  async getMediaAssetStatistics(): Promise<ServiceResponse<any>> {
    try {
      const stats = await prisma.mediaAsset.groupBy({
        by: ['type'],
        where: { isActive: true },
        _count: { id: true },
        _sum: { size: true },
      });

      const total = await prisma.mediaAsset.count({
        where: { isActive: true },
      });

      const totalSize = await prisma.mediaAsset.aggregate({
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
          }, {} as Record<string, { count: number; size: number }>),
        },
        message: 'Media asset statistics retrieved successfully'
      };
    } catch (error) {
      logger.error('Get media asset statistics failed', { error: error.message });
      return {
        success: false,
        error: 'Get statistics failed',
        message: 'An error occurred while retrieving media asset statistics'
      };
    }
  }

  // Process image file
  private async processImage(filePath: string, filename: string): Promise<any> {
    try {
      const uploadPath = process.env.UPLOAD_PATH || './uploads';
      const thumbnailDir = path.join(uploadPath, 'thumbnails');
      await fs.mkdir(thumbnailDir, { recursive: true });

      const image = sharp(filePath);
      const metadata = await image.metadata();
      
      // Generate thumbnail
      const thumbnailFilename = `thumb_${filename}`;
      const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
      
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
    } catch (error) {
      logger.error('Image processing failed', { error: error.message, filePath });
      return {};
    }
  }

  // Process audio file
  private async processAudio(filePath: string, filename: string): Promise<any> {
    try {
      // For audio files, we might want to extract metadata or generate waveforms
      // This is a placeholder for future audio processing
      return {
        duration: null, // Would need audio processing library
      };
    } catch (error) {
      logger.error('Audio processing failed', { error: error.message, filePath });
      return {};
    }
  }

  // Get allowed file types for media type
  private getAllowedTypes(mediaType?: MediaType): string[] {
    const config = {
      IMAGE: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(','),
      AUDIO: (process.env.ALLOWED_AUDIO_TYPES || 'audio/mpeg,audio/wav,audio/ogg,audio/mp4').split(','),
      VIDEO: (process.env.ALLOWED_VIDEO_TYPES || 'video/mp4,video/webm,video/ogg').split(','),
      ANIMATION: (process.env.ALLOWED_IMAGE_TYPES || 'image/gif,image/webp').split(','),
    };

    return mediaType ? config[mediaType] : Object.values(config).flat();
  }

  // Validate file size
  private validateFileSize(size: number): boolean {
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10MB
    return size <= maxSize;
  }

  // Get file MIME type
  private getMimeType(filename: string): string {
    return mime.lookup(filename) || 'application/octet-stream';
  }

  // Clean up orphaned media assets
  async cleanupOrphanedMediaAssets(): Promise<ServiceResponse<void>> {
    try {
      const uploadPath = process.env.UPLOAD_PATH || './uploads';
      
      // Get all media assets from database
      const mediaAssets = await prisma.mediaAsset.findMany({
        where: { isActive: true },
        select: { filename: true },
      });

      const dbFilenames = new Set(mediaAssets.map(asset => asset.filename));

      // Get all files in upload directory
      const files = await fs.readdir(uploadPath);
      const orphanedFiles = files.filter(file => !dbFilenames.has(file));

      // Delete orphaned files
      for (const file of orphanedFiles) {
        const filePath = path.join(uploadPath, file);
        try {
          await fs.unlink(filePath);
          logger.info('Deleted orphaned file', { filePath });
        } catch (error) {
          logger.warn('Failed to delete orphaned file', { filePath, error: error.message });
        }
      }

      mediaLogger('orphaned_media_cleaned', undefined, {
        orphanedCount: orphanedFiles.length,
      });

      return {
        success: true,
        message: `Cleaned up ${orphanedFiles.length} orphaned media assets`
      };
    } catch (error) {
      logger.error('Cleanup orphaned media assets failed', { error: error.message });
      return {
        success: false,
        error: 'Cleanup failed',
        message: 'An error occurred while cleaning up orphaned media assets'
      };
    }
  }

  // Get media assets by type
  async getMediaAssetsByType(type: MediaType, pagination: PaginationParams = {}): Promise<ServiceResponse<SearchResult<any>>> {
    try {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
      const skip = (page - 1) * limit;

      const result = await prisma.$transaction(async (tx) => {
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

      const searchResults: SearchResult<any> = {
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
    } catch (error) {
      logger.error('Failed to get media assets by type', { type, error });
      return {
        success: false,
        error: 'Failed to retrieve media assets',
        message: 'An error occurred while retrieving media assets by type'
      };
    }
  }

  // Get media assets by category (using character type as category)
  async getMediaAssetsByCategory(category: string, pagination: PaginationParams = {}): Promise<ServiceResponse<SearchResult<any>>> {
    try {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
      const skip = (page - 1) * limit;

      const result = await prisma.$transaction(async (tx) => {
        const mediaAssets = await tx.mediaAsset.findMany({
          where: {
            character: {
              type: category as any
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
              type: category as any
            }
          }
        });

        return { mediaAssets, total };
      });

      const totalPages = Math.ceil(result.total / limit);

      const searchResults: SearchResult<any> = {
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
    } catch (error) {
      logger.error('Failed to get media assets by category', { category, error });
      return {
        success: false,
        error: 'Failed to retrieve media assets',
        message: 'An error occurred while retrieving media assets by category'
      };
    }
  }

  // Search media assets
  async searchMediaAssets(query: string, filters: any = {}, pagination: PaginationParams = {}): Promise<ServiceResponse<SearchResult<any>>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const skip = (page - 1) * limit;

      const result = await prisma.$transaction(async (tx) => {
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

      const searchResults: SearchResult<any> = {
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
    } catch (error) {
      logger.error('Failed to search media assets', { query, error });
      return {
        success: false,
        error: 'Failed to search media assets',
        message: 'An error occurred while searching media assets'
      };
    }
  }

  // Get media asset file
  async getMediaAssetFile(mediaId: string): Promise<ServiceResponse<any>> {
    try {
      const mediaAsset = await prisma.mediaAsset.findUnique({
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
    } catch (error) {
      logger.error('Failed to get media asset file', { mediaId, error });
      return {
        success: false,
        error: 'Failed to retrieve media asset file',
        message: 'An error occurred while retrieving media asset file'
      };
    }
  }

  // Get media asset thumbnail
  async getMediaAssetThumbnail(mediaId: string): Promise<ServiceResponse<any>> {
    try {
      const mediaAsset = await prisma.mediaAsset.findUnique({
        where: { id: mediaId }
      });

      if (!mediaAsset) {
        return {
          success: false,
          error: 'Media asset not found',
          message: 'The specified media asset does not exist'
        };
      }

      // For now, return the media asset itself as thumbnail
      // In a real implementation, you would generate thumbnails
      return {
        success: true,
        data: mediaAsset,
        message: 'Media asset thumbnail retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get media asset thumbnail', { mediaId, error });
      return {
        success: false,
        error: 'Failed to retrieve media asset thumbnail',
        message: 'An error occurred while retrieving media asset thumbnail'
      };
    }
  }
}

// Export media service instance
export const mediaService = new MediaService();

// Export default
export default mediaService;
