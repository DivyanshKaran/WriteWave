import { prisma } from '@/config/database';
import { contentCacheService } from '@/config/redis';
import { logger, characterLogger } from '@/config/logger';
import { 
  CharacterData, 
  CharacterWithRelations, 
  StrokeOrderData,
  ServiceResponse,
  PaginationParams,
  SearchResult,
  CharacterType,
  JLPTLevel,
  DifficultyLevel
} from '@/types';

// Character service class
export class CharacterService {
  // Get all characters with pagination
  async getCharacters(
    pagination: PaginationParams = {},
    filters: {
      type?: CharacterType;
      jlptLevel?: JLPTLevel;
      difficultyLevel?: DifficultyLevel;
    } = {}
  ): Promise<ServiceResponse<SearchResult<any>>> {
    try {
      const { page = 1, limit = 20, sortBy = 'learningOrder', sortOrder = 'asc' } = pagination;
      const skip = (page - 1) * limit;

      const where: any = {
        isActive: true,
      };

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.jlptLevel) {
        where.jlptLevel = filters.jlptLevel;
      }

      if (filters.difficultyLevel) {
        where.difficultyLevel = filters.difficultyLevel;
      }

      const [characters, total] = await Promise.all([
        prisma.character.findMany({
          where,
          include: {
            mediaAssets: true,
            characterRelations: {
              include: {
                relatedCharacter: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.character.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      characterLogger('characters_retrieved', undefined, {
        count: characters.length,
        total,
        page,
        limit,
        filters,
      });

      return {
        success: true,
        data: {
          data: characters,
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        message: 'Characters retrieved successfully'
      };
    } catch (error) {
      logger.error('Get characters failed', { error: error.message, pagination, filters });
      return {
        success: false,
        error: 'Get characters failed',
        message: 'An error occurred while retrieving characters'
      };
    }
  }

  // Get character by ID
  async getCharacterById(characterId: string): Promise<ServiceResponse<CharacterWithRelations>> {
    try {
      // Try to get from cache first
      const cachedCharacter = await contentCacheService.getCachedCharacter(characterId);
      if (cachedCharacter) {
        return {
          success: true,
          data: cachedCharacter,
          message: 'Character retrieved successfully'
        };
      }

      const character = await prisma.character.findUnique({
        where: { id: characterId },
        include: {
          mediaAssets: true,
          characterRelations: {
            include: {
              relatedCharacter: true,
            },
          },
        },
      });

      if (!character) {
        return {
          success: false,
          error: 'Character not found',
          message: 'Character not found'
        };
      }

      // Cache the character
      await contentCacheService.cacheCharacter(characterId, character);

      characterLogger('character_retrieved', characterId, {
        character: character.character,
        type: character.type,
      });

      return {
        success: true,
        data: character,
        message: 'Character retrieved successfully'
      };
    } catch (error) {
      logger.error('Get character by ID failed', { error: error.message, characterId });
      return {
        success: false,
        error: 'Get character failed',
        message: 'An error occurred while retrieving character'
      };
    }
  }

  // Get characters by type
  async getCharactersByType(
    type: CharacterType,
    pagination: PaginationParams = {}
  ): Promise<ServiceResponse<SearchResult<any>>> {
    try {
      // Try to get from cache first
      const cacheKey = `${type}_${pagination.page || 1}_${pagination.limit || 20}`;
      const cachedCharacters = await contentCacheService.get(`characters:type:${cacheKey}`);
      if (cachedCharacters) {
        return {
          success: true,
          data: cachedCharacters,
          message: 'Characters retrieved successfully'
        };
      }

      const result = await this.getCharacters(pagination, { type });

      if (result.success) {
        // Cache the results
        await contentCacheService.set(`characters:type:${cacheKey}`, result.data, 1800);
      }

      return result;
    } catch (error) {
      logger.error('Get characters by type failed', { error: error.message, type, pagination });
      return {
        success: false,
        error: 'Get characters by type failed',
        message: 'An error occurred while retrieving characters by type'
      };
    }
  }

  // Get characters by JLPT level
  async getCharactersByJLPTLevel(
    level: JLPTLevel,
    pagination: PaginationParams = {}
  ): Promise<ServiceResponse<SearchResult<any>>> {
    try {
      // Try to get from cache first
      const cacheKey = `${level}_${pagination.page || 1}_${pagination.limit || 20}`;
      const cachedCharacters = await contentCacheService.get(`characters:jlpt:${cacheKey}`);
      if (cachedCharacters) {
        return {
          success: true,
          data: cachedCharacters,
          message: 'Characters retrieved successfully'
        };
      }

      const result = await this.getCharacters(pagination, { jlptLevel: level });

      if (result.success) {
        // Cache the results
        await contentCacheService.set(`characters:jlpt:${cacheKey}`, result.data, 1800);
      }

      return result;
    } catch (error) {
      logger.error('Get characters by JLPT level failed', { error: error.message, level, pagination });
      return {
        success: false,
        error: 'Get characters by JLPT level failed',
        message: 'An error occurred while retrieving characters by JLPT level'
      };
    }
  }

  // Get Hiragana characters
  async getHiraganaCharacters(pagination: PaginationParams = {}): Promise<ServiceResponse<SearchResult<any>>> {
    return this.getCharactersByType('HIRAGANA', pagination);
  }

  // Get Katakana characters
  async getKatakanaCharacters(pagination: PaginationParams = {}): Promise<ServiceResponse<SearchResult<any>>> {
    return this.getCharactersByType('KATAKANA', pagination);
  }

  // Get Kanji characters by level
  async getKanjiCharacters(
    level: JLPTLevel,
    pagination: PaginationParams = {}
  ): Promise<ServiceResponse<SearchResult<any>>> {
    return this.getCharactersByJLPTLevel(level, pagination);
  }

  // Get stroke order for character
  async getCharacterStrokeOrder(characterId: string): Promise<ServiceResponse<StrokeOrderData>> {
    try {
      const character = await prisma.character.findUnique({
        where: { id: characterId },
        select: {
          id: true,
          character: true,
          strokeOrder: true,
          strokePatterns: true,
          strokeCount: true,
        },
      });

      if (!character) {
        return {
          success: false,
          error: 'Character not found',
          message: 'Character not found'
        };
      }

      const strokeOrderData: StrokeOrderData = {
        strokes: character.strokeOrder as any || [],
        boundingBox: character.strokePatterns as any || undefined,
      };

      characterLogger('stroke_order_retrieved', characterId, {
        character: character.character,
        strokeCount: character.strokeCount,
      });

      return {
        success: true,
        data: strokeOrderData,
        message: 'Stroke order retrieved successfully'
      };
    } catch (error) {
      logger.error('Get character stroke order failed', { error: error.message, characterId });
      return {
        success: false,
        error: 'Get stroke order failed',
        message: 'An error occurred while retrieving stroke order'
      };
    }
  }

  // Create character
  async createCharacter(data: CharacterData): Promise<ServiceResponse<CharacterWithRelations>> {
    try {
      // Check if character already exists
      const existingCharacter = await prisma.character.findUnique({
        where: { character: data.character },
      });

      if (existingCharacter) {
        return {
          success: false,
          error: 'Character already exists',
          message: 'Character with this text already exists'
        };
      }

      const character = await prisma.character.create({
        data: {
          character: data.character,
          type: data.type,
          jlptLevel: data.jlptLevel,
          difficultyLevel: data.difficultyLevel || 'BEGINNER',
          meaning: data.meaning,
          pronunciation: data.pronunciation,
          romanization: data.romanization,
          strokeCount: data.strokeCount,
          strokeOrder: data.strokeOrder,
          strokePatterns: data.strokePatterns,
          kunyomi: data.kunyomi || [],
          onyomi: data.onyomi || [],
          radical: data.radical,
          radicalMeaning: data.radicalMeaning,
          examples: data.examples,
          usageNotes: data.usageNotes,
          learningOrder: data.learningOrder,
        },
        include: {
          mediaAssets: true,
          characterRelations: {
            include: {
              relatedCharacter: true,
            },
          },
        },
      });

      // Clear related caches
      await contentCacheService.clearCharacterCache();

      characterLogger('character_created', character.id, {
        character: character.character,
        type: character.type,
      });

      return {
        success: true,
        data: character,
        message: 'Character created successfully'
      };
    } catch (error) {
      logger.error('Create character failed', { error: error.message, data });
      return {
        success: false,
        error: 'Create character failed',
        message: 'An error occurred while creating character'
      };
    }
  }

  // Update character
  async updateCharacter(
    characterId: string,
    data: Partial<CharacterData>
  ): Promise<ServiceResponse<CharacterWithRelations>> {
    try {
      const character = await prisma.character.update({
        where: { id: characterId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          mediaAssets: true,
          characterRelations: {
            include: {
              relatedCharacter: true,
            },
          },
        },
      });

      // Clear caches
      await contentCacheService.clearCharacterCache(characterId);

      characterLogger('character_updated', characterId, {
        character: character.character,
        type: character.type,
      });

      return {
        success: true,
        data: character,
        message: 'Character updated successfully'
      };
    } catch (error) {
      logger.error('Update character failed', { error: error.message, characterId, data });
      return {
        success: false,
        error: 'Update character failed',
        message: 'An error occurred while updating character'
      };
    }
  }

  // Delete character
  async deleteCharacter(characterId: string): Promise<ServiceResponse<void>> {
    try {
      await prisma.character.update({
        where: { id: characterId },
        data: { isActive: false },
      });

      // Clear caches
      await contentCacheService.clearCharacterCache(characterId);

      characterLogger('character_deleted', characterId);

      return {
        success: true,
        message: 'Character deleted successfully'
      };
    } catch (error) {
      logger.error('Delete character failed', { error: error.message, characterId });
      return {
        success: false,
        error: 'Delete character failed',
        message: 'An error occurred while deleting character'
      };
    }
  }

  // Search characters
  async searchCharacters(
    query: string,
    filters: {
      type?: CharacterType;
      jlptLevel?: JLPTLevel;
      difficultyLevel?: DifficultyLevel;
    } = {},
    pagination: PaginationParams = {}
  ): Promise<ServiceResponse<SearchResult<any>>> {
    try {
      // Try to get from cache first
      const cacheKey = `search_${Buffer.from(query).toString('base64')}_${JSON.stringify(filters)}_${pagination.page || 1}_${pagination.limit || 20}`;
      const cachedResults = await contentCacheService.getCachedSearchResults(cacheKey);
      if (cachedResults) {
        return {
          success: true,
          data: cachedResults,
          message: 'Search results retrieved successfully'
        };
      }

      const { page = 1, limit = 20 } = pagination;
      const result = await prisma.$transaction(async (tx) => {
        return await tx.character.findMany({
          where: {
            isActive: true,
            ...filters,
            OR: [
              { character: { contains: query, mode: 'insensitive' } },
              { meaning: { contains: query, mode: 'insensitive' } },
              { pronunciation: { contains: query, mode: 'insensitive' } },
              { romanization: { contains: query, mode: 'insensitive' } },
            ],
          },
          include: {
            mediaAssets: true,
            characterRelations: {
              include: {
                relatedCharacter: true,
              },
            },
          },
          orderBy: { learningOrder: 'asc' },
          skip: (page - 1) * limit,
          take: limit,
        });
      });

      const total = await prisma.character.count({
        where: {
          isActive: true,
          ...filters,
          OR: [
            { character: { contains: query, mode: 'insensitive' } },
            { meaning: { contains: query, mode: 'insensitive' } },
            { pronunciation: { contains: query, mode: 'insensitive' } },
            { romanization: { contains: query, mode: 'insensitive' } },
          ],
        },
      });

      const totalPages = Math.ceil(total / limit);

      const searchResults = {
        data: result,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };

      // Cache the results
      await contentCacheService.cacheSearchResults(cacheKey, searchResults);

      characterLogger('characters_searched', undefined, {
        query,
        results: result.length,
        total,
        filters,
      });

      return {
        success: true,
        data: searchResults,
        message: 'Search results retrieved successfully'
      };
    } catch (error) {
      logger.error('Search characters failed', { error: error.message, query, filters, pagination });
      return {
        success: false,
        error: 'Search characters failed',
        message: 'An error occurred while searching characters'
      };
    }
  }

  // Get character statistics
  async getCharacterStatistics(): Promise<ServiceResponse<any>> {
    try {
      const stats = await prisma.character.groupBy({
        by: ['type', 'jlptLevel', 'difficultyLevel'],
        where: { isActive: true },
        _count: { id: true },
      });

      const total = await prisma.character.count({
        where: { isActive: true },
      });

      return {
        success: true,
        data: {
          total,
          byType: stats.reduce((acc, stat) => {
            acc[stat.type] = (acc[stat.type] || 0) + stat._count.id;
            return acc;
          }, {} as Record<string, number>),
          byJLPTLevel: stats.reduce((acc, stat) => {
            if (stat.jlptLevel) {
              acc[stat.jlptLevel] = (acc[stat.jlptLevel] || 0) + stat._count.id;
            }
            return acc;
          }, {} as Record<string, number>),
          byDifficulty: stats.reduce((acc, stat) => {
            acc[stat.difficultyLevel] = (acc[stat.difficultyLevel] || 0) + stat._count.id;
            return acc;
          }, {} as Record<string, number>),
        },
        message: 'Character statistics retrieved successfully'
      };
    } catch (error) {
      logger.error('Get character statistics failed', { error: error.message });
      return {
        success: false,
        error: 'Get statistics failed',
        message: 'An error occurred while retrieving character statistics'
      };
    }
  }

  // Get character relationships
  async getCharacterRelationships(characterId: string): Promise<ServiceResponse<any>> {
    try {
      const relationships = await prisma.characterRelation.findMany({
        where: {
          OR: [
            { characterId },
            { relatedCharacterId: characterId },
          ],
        },
        include: {
          character: true,
          relatedCharacter: true,
        },
      });

      return {
        success: true,
        data: relationships,
        message: 'Character relationships retrieved successfully'
      };
    } catch (error) {
      logger.error('Get character relationships failed', { error: error.message, characterId });
      return {
        success: false,
        error: 'Get relationships failed',
        message: 'An error occurred while retrieving character relationships'
      };
    }
  }
}

// Export character service instance
export const characterService = new CharacterService();

// Export default
export default characterService;
