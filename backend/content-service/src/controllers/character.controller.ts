import { Request, Response } from 'express';
import { characterService } from '../services/character.service';
import { logger } from '../config/logger';

// Character controller class
export class CharacterController {
  // Get all characters
  async getCharacters(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder, type, jlptLevel, difficultyLevel } = req.query;

      const pagination = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        sortBy: sortBy as string || 'learningOrder',
        sortOrder: sortOrder as 'asc' | 'desc' || 'asc',
      };

      const filters = {
        type: type as any,
        jlptLevel: jlptLevel as any,
        difficultyLevel: difficultyLevel as any,
      };

      const result = await characterService.getCharacters(pagination, filters);

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
      logger.error('Get characters controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get character by ID
  async getCharacterById(req: Request, res: Response): Promise<void> {
    try {
      const { characterId } = req.params;

      if (!characterId) {
        res.status(400).json({
          success: false,
          message: 'Character ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await characterService.getCharacterById(characterId);

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
      logger.error('Get character by ID controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get Hiragana characters
  async getHiraganaCharacters(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder } = req.query;

      const pagination = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        sortBy: sortBy as string || 'learningOrder',
        sortOrder: sortOrder as 'asc' | 'desc' || 'asc',
      };

      const result = await characterService.getHiraganaCharacters(pagination);

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
      logger.error('Get Hiragana characters controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get Katakana characters
  async getKatakanaCharacters(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder } = req.query;

      const pagination = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        sortBy: sortBy as string || 'learningOrder',
        sortOrder: sortOrder as 'asc' | 'desc' || 'asc',
      };

      const result = await characterService.getKatakanaCharacters(pagination);

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
      logger.error('Get Katakana characters controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get Kanji characters by level
  async getKanjiCharacters(req: Request, res: Response): Promise<void> {
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
        sortBy: sortBy as string || 'learningOrder',
        sortOrder: sortOrder as 'asc' | 'desc' || 'asc',
      };

      const result = await characterService.getKanjiCharacters(level as any, pagination);

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
      logger.error('Get Kanji characters controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get character stroke order
  async getCharacterStrokeOrder(req: Request, res: Response): Promise<void> {
    try {
      const { characterId } = req.params;

      if (!characterId) {
        res.status(400).json({
          success: false,
          message: 'Character ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await characterService.getCharacterStrokeOrder(characterId);

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
      logger.error('Get character stroke order controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Search characters
  async searchCharacters(req: Request, res: Response): Promise<void> {
    try {
      const { q: query, type, jlptLevel, difficultyLevel, page, limit } = req.query;

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
        jlptLevel: jlptLevel as any,
        difficultyLevel: difficultyLevel as any,
      };

      const result = await characterService.searchCharacters(query, filters, pagination);

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
      logger.error('Search characters controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get character statistics
  async getCharacterStatistics(req: Request, res: Response): Promise<void> {
    try {
      const result = await characterService.getCharacterStatistics();

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
      logger.error('Get character statistics controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get character relationships
  async getCharacterRelationships(req: Request, res: Response): Promise<void> {
    try {
      const { characterId } = req.params;

      if (!characterId) {
        res.status(400).json({
          success: false,
          message: 'Character ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await characterService.getCharacterRelationships(characterId);

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
      logger.error('Get character relationships controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Create character (admin only)
  async createCharacter(req: Request, res: Response): Promise<void> {
    try {
      const result = await characterService.createCharacter(req.body);

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
      logger.error('Create character controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Update character (admin only)
  async updateCharacter(req: Request, res: Response): Promise<void> {
    try {
      const { characterId } = req.params;

      if (!characterId) {
        res.status(400).json({
          success: false,
          message: 'Character ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await characterService.updateCharacter(characterId, req.body);

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
      logger.error('Update character controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Delete character (admin only)
  async deleteCharacter(req: Request, res: Response): Promise<void> {
    try {
      const { characterId } = req.params;

      if (!characterId) {
        res.status(400).json({
          success: false,
          message: 'Character ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await characterService.deleteCharacter(characterId);

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
      logger.error('Delete character controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Export character controller instance
export const characterController = new CharacterController();

// Export default
export default characterController;
