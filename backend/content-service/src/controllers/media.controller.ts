import { Request, Response } from 'express';
import { mediaService } from '../services/media.service';
import { logger } from '../config/logger';

// Media controller class
export class MediaController {
  // Get all media assets
  async getMediaAssets(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder, type, category } = req.query;

      const pagination = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        sortBy: sortBy as string || 'createdAt',
        sortOrder: sortOrder as 'asc' | 'desc' || 'desc',
      };

      const filters = {
        type: type as any,
        category: category as any,
      };

      const result = await mediaService.getMediaAssets(pagination, filters);

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
    } catch (error) {
      logger.error('Get media assets controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get media asset by ID
  async getMediaAssetById(req: Request, res: Response): Promise<void> {
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

      const result = await mediaService.getMediaAssetById(mediaId);

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
    } catch (error) {
      logger.error('Get media asset by ID controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get media assets by type
  async getMediaAssetsByType(req: Request, res: Response): Promise<void> {
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
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        sortBy: sortBy as string || 'createdAt',
        sortOrder: sortOrder as 'asc' | 'desc' || 'desc',
      };

      const result = await mediaService.getMediaAssetsByType(type as any, pagination);

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
    } catch (error) {
      logger.error('Get media assets by type controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get media assets by category
  async getMediaAssetsByCategory(req: Request, res: Response): Promise<void> {
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
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        sortBy: sortBy as string || 'createdAt',
        sortOrder: sortOrder as 'asc' | 'desc' || 'desc',
      };

      const result = await mediaService.getMediaAssetsByCategory(category as any, pagination);

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
    } catch (error) {
      logger.error('Get media assets by category controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Search media assets
  async searchMediaAssets(req: Request, res: Response): Promise<void> {
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
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      };

      const filters = {
        type: type as any,
        category: category as any,
      };

      const result = await mediaService.searchMediaAssets(query, filters, pagination);

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
    } catch (error) {
      logger.error('Search media assets controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get media asset statistics
  async getMediaAssetStatistics(req: Request, res: Response): Promise<void> {
    try {
      const result = await mediaService.getMediaAssetStatistics();

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
    } catch (error) {
      logger.error('Get media asset statistics controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Upload media asset
  async uploadMediaAsset(req: Request, res: Response): Promise<void> {
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

      const result = await mediaService.uploadMediaAsset(req.file, req.body);

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
    } catch (error) {
      logger.error('Upload media asset controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Update media asset (admin only)
  async updateMediaAsset(req: Request, res: Response): Promise<void> {
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

      const result = await mediaService.updateMediaAsset(mediaId, req.body);

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
    } catch (error) {
      logger.error('Update media asset controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Delete media asset (admin only)
  async deleteMediaAsset(req: Request, res: Response): Promise<void> {
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

      const result = await mediaService.deleteMediaAsset(mediaId);

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
    } catch (error) {
      logger.error('Delete media asset controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get media asset file
  async getMediaAssetFile(req: Request, res: Response): Promise<void> {
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

      const result = await mediaService.getMediaAssetFile(mediaId);

      if (!result.success) {
        res.status(404).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Set appropriate headers for file download
      res.setHeader('Content-Type', result.data.mimeType);
      res.setHeader('Content-Length', result.data.size);
      res.setHeader('Content-Disposition', `inline; filename="${result.data.filename}"`);

      // Stream the file
      res.sendFile(result.data.filePath);
    } catch (error) {
      logger.error('Get media asset file controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get media asset thumbnail
  async getMediaAssetThumbnail(req: Request, res: Response): Promise<void> {
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

      const result = await mediaService.getMediaAssetThumbnail(mediaId);

      if (!result.success) {
        res.status(404).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Set appropriate headers for thumbnail
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

      // Stream the thumbnail
      res.sendFile(result.data.thumbnailPath);
    } catch (error) {
      logger.error('Get media asset thumbnail controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Export media controller instance
export const mediaController = new MediaController();

// Export default
export default mediaController;
