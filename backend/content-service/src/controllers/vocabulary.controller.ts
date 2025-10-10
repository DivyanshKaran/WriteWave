import { Request, Response } from 'express';
import { vocabularyService } from '@/services/vocabulary.service';
import { logger } from '@/config/logger';

// Vocabulary controller class
export class VocabularyController {
  // Get all vocabulary words
  async getVocabularyWords(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder, category, jlptLevel, difficultyLevel } = req.query;

      const pagination = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        sortBy: sortBy as string || 'frequency',
        sortOrder: sortOrder as 'asc' | 'desc' || 'asc',
      };

      const filters = {
        category: category as any,
        jlptLevel: jlptLevel as any,
        difficultyLevel: difficultyLevel as any,
      };

      const result = await vocabularyService.getVocabularyWords(pagination, filters);

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
      logger.error('Get vocabulary words controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get vocabulary word by ID
  async getVocabularyWordById(req: Request, res: Response): Promise<void> {
    try {
      const { vocabularyId } = req.params;

      if (!vocabularyId) {
        res.status(400).json({
          success: false,
          message: 'Vocabulary ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await vocabularyService.getVocabularyWordById(vocabularyId);

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
      logger.error('Get vocabulary word by ID controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get vocabulary words by category
  async getVocabularyWordsByCategory(req: Request, res: Response): Promise<void> {
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
        sortBy: sortBy as string || 'frequency',
        sortOrder: sortOrder as 'asc' | 'desc' || 'asc',
      };

      const result = await vocabularyService.getVocabularyWordsByCategory(category as any, pagination);

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
      logger.error('Get vocabulary words by category controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get vocabulary words by JLPT level
  async getVocabularyWordsByJLPTLevel(req: Request, res: Response): Promise<void> {
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
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        sortBy: sortBy as string || 'frequency',
        sortOrder: sortOrder as 'asc' | 'desc' || 'asc',
      };

      const result = await vocabularyService.getVocabularyWordsByJLPTLevel(level as any, pagination);

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
      logger.error('Get vocabulary words by JLPT level controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Search vocabulary words
  async searchVocabularyWords(req: Request, res: Response): Promise<void> {
    try {
      const { q: query, category, jlptLevel, difficultyLevel, page, limit } = req.query;

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
        category: category as any,
        jlptLevel: jlptLevel as any,
        difficultyLevel: difficultyLevel as any,
      };

      const result = await vocabularyService.searchVocabularyWords(query, filters, pagination);

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
      logger.error('Search vocabulary words controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get vocabulary statistics
  async getVocabularyStatistics(req: Request, res: Response): Promise<void> {
    try {
      const result = await vocabularyService.getVocabularyStatistics();

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
      logger.error('Get vocabulary statistics controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get vocabulary words by frequency
  async getVocabularyWordsByFrequency(req: Request, res: Response): Promise<void> {
    try {
      const { minFrequency, maxFrequency, page, limit } = req.query;

      const pagination = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      };

      const minFreq = minFrequency ? parseInt(minFrequency as string, 10) : 1;
      const maxFreq = maxFrequency ? parseInt(maxFrequency as string, 10) : 10000;

      const result = await vocabularyService.getVocabularyWordsByFrequency(minFreq, maxFreq, pagination);

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
      logger.error('Get vocabulary words by frequency controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get vocabulary words by part of speech
  async getVocabularyWordsByPartOfSpeech(req: Request, res: Response): Promise<void> {
    try {
      const { partOfSpeech } = req.params;
      const { page, limit } = req.query;

      if (!partOfSpeech) {
        res.status(400).json({
          success: false,
          message: 'Part of speech is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const pagination = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      };

      const result = await vocabularyService.getVocabularyWordsByPartOfSpeech(partOfSpeech, pagination);

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
      logger.error('Get vocabulary words by part of speech controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get random vocabulary words
  async getRandomVocabularyWords(req: Request, res: Response): Promise<void> {
    try {
      const { count, category, jlptLevel, difficultyLevel } = req.query;

      const countNum = count ? parseInt(count as string, 10) : 10;
      const filters = {
        category: category as any,
        jlptLevel: jlptLevel as any,
        difficultyLevel: difficultyLevel as any,
      };

      const result = await vocabularyService.getRandomVocabularyWords(countNum, filters);

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
      logger.error('Get random vocabulary words controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Create vocabulary word (admin only)
  async createVocabularyWord(req: Request, res: Response): Promise<void> {
    try {
      const result = await vocabularyService.createVocabularyWord(req.body);

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
      logger.error('Create vocabulary word controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Update vocabulary word (admin only)
  async updateVocabularyWord(req: Request, res: Response): Promise<void> {
    try {
      const { vocabularyId } = req.params;

      if (!vocabularyId) {
        res.status(400).json({
          success: false,
          message: 'Vocabulary ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await vocabularyService.updateVocabularyWord(vocabularyId, req.body);

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
      logger.error('Update vocabulary word controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Delete vocabulary word (admin only)
  async deleteVocabularyWord(req: Request, res: Response): Promise<void> {
    try {
      const { vocabularyId } = req.params;

      if (!vocabularyId) {
        res.status(400).json({
          success: false,
          message: 'Vocabulary ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await vocabularyService.deleteVocabularyWord(vocabularyId);

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
      logger.error('Delete vocabulary word controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Export vocabulary controller instance
export const vocabularyController = new VocabularyController();

// Export default
export default vocabularyController;
