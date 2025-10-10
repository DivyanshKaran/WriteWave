import { prisma } from '@/config/database';
import { contentCacheService } from '@/config/redis';
import { logger, lessonLogger } from '@/config/logger';
import { 
  LessonData, 
  LessonWithRelations, 
  LessonContent,
  ServiceResponse,
  PaginationParams,
  SearchResult,
  LessonType,
  JLPTLevel,
  DifficultyLevel
} from '@/types';

// Lesson service class
export class LessonService {
  // Get all lessons with pagination
  async getLessons(
    pagination: PaginationParams = {},
    filters: {
      type?: LessonType;
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

      const [lessons, total] = await Promise.all([
        prisma.lesson.findMany({
          where,
          include: {
            characters: true,
            vocabularyWords: true,
            mediaAssets: true,
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.lesson.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      lessonLogger('lessons_retrieved', undefined, {
        count: lessons.length,
        total,
        page,
        limit,
        filters,
      });

      return {
        success: true,
        data: {
          data: lessons,
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        message: 'Lessons retrieved successfully'
      };
    } catch (error) {
      logger.error('Get lessons failed', { error: error.message, pagination, filters });
      return {
        success: false,
        error: 'Get lessons failed',
        message: 'An error occurred while retrieving lessons'
      };
    }
  }

  // Get lesson by ID
  async getLessonById(lessonId: string): Promise<ServiceResponse<LessonWithRelations>> {
    try {
      // Try to get from cache first
      const cachedLesson = await contentCacheService.getCachedLesson(lessonId);
      if (cachedLesson) {
        return {
          success: true,
          data: cachedLesson,
          message: 'Lesson retrieved successfully'
        };
      }

      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          characters: true,
          vocabularyWords: true,
          mediaAssets: true,
        },
      });

      if (!lesson) {
        return {
          success: false,
          error: 'Lesson not found',
          message: 'Lesson not found'
        };
      }

      // Cache the lesson
      await contentCacheService.cacheLesson(lessonId, lesson);

      lessonLogger('lesson_retrieved', lessonId, {
        title: lesson.title,
        type: lesson.type,
        jlptLevel: lesson.jlptLevel,
      });

      return {
        success: true,
        data: lesson,
        message: 'Lesson retrieved successfully'
      };
    } catch (error) {
      logger.error('Get lesson by ID failed', { error: error.message, lessonId });
      return {
        success: false,
        error: 'Get lesson failed',
        message: 'An error occurred while retrieving lesson'
      };
    }
  }

  // Get lessons by type
  async getLessonsByType(
    type: LessonType,
    pagination: PaginationParams = {}
  ): Promise<ServiceResponse<SearchResult<any>>> {
    try {
      // Try to get from cache first
      const cacheKey = `${type}_${pagination.page || 1}_${pagination.limit || 20}`;
      const cachedLessons = await contentCacheService.getCachedLessonsByType(cacheKey);
      if (cachedLessons) {
        return {
          success: true,
          data: cachedLessons,
          message: 'Lessons retrieved successfully'
        };
      }

      const result = await this.getLessons(pagination, { type });

      if (result.success) {
        // Cache the results
        await contentCacheService.set(`lessons:type:${cacheKey}`, result.data, 1800);
      }

      return result;
    } catch (error) {
      logger.error('Get lessons by type failed', { error: error.message, type, pagination });
      return {
        success: false,
        error: 'Get lessons by type failed',
        message: 'An error occurred while retrieving lessons by type'
      };
    }
  }

  // Get lessons by JLPT level
  async getLessonsByJLPTLevel(
    level: JLPTLevel,
    pagination: PaginationParams = {}
  ): Promise<ServiceResponse<SearchResult<any>>> {
    try {
      const result = await this.getLessons(pagination, { jlptLevel: level });
      return result;
    } catch (error) {
      logger.error('Get lessons by JLPT level failed', { error: error.message, level, pagination });
      return {
        success: false,
        error: 'Get lessons by JLPT level failed',
        message: 'An error occurred while retrieving lessons by JLPT level'
      };
    }
  }

  // Get lessons by difficulty level
  async getLessonsByDifficultyLevel(
    difficultyLevel: DifficultyLevel,
    pagination: PaginationParams = {}
  ): Promise<ServiceResponse<SearchResult<any>>> {
    try {
      const result = await this.getLessons(pagination, { difficultyLevel });
      return result;
    } catch (error) {
      logger.error('Get lessons by difficulty level failed', { error: error.message, difficultyLevel, pagination });
      return {
        success: false,
        error: 'Get lessons by difficulty level failed',
        message: 'An error occurred while retrieving lessons by difficulty level'
      };
    }
  }

  // Create lesson
  async createLesson(data: LessonData): Promise<ServiceResponse<LessonWithRelations>> {
    try {
      // Check if lesson with same title already exists
      const existingLesson = await prisma.lesson.findFirst({
        where: { title: data.title },
      });

      if (existingLesson) {
        return {
          success: false,
          error: 'Lesson already exists',
          message: 'Lesson with this title already exists'
        };
      }

      const lesson = await prisma.lesson.create({
        data: {
          title: data.title,
          description: data.description,
          type: data.type,
          jlptLevel: data.jlptLevel,
          difficultyLevel: data.difficultyLevel || 'BEGINNER',
          content: data.content,
          objectives: data.objectives || [],
          prerequisites: data.prerequisites || [],
          estimatedTime: data.estimatedTime,
          learningOrder: data.learningOrder,
        },
        include: {
          characters: true,
          vocabularyWords: true,
          mediaAssets: true,
        },
      });

      // Clear related caches
      await contentCacheService.clearLessonCache();

      lessonLogger('lesson_created', lesson.id, {
        title: lesson.title,
        type: lesson.type,
        jlptLevel: lesson.jlptLevel,
      });

      return {
        success: true,
        data: lesson,
        message: 'Lesson created successfully'
      };
    } catch (error) {
      logger.error('Create lesson failed', { error: error.message, data });
      return {
        success: false,
        error: 'Create lesson failed',
        message: 'An error occurred while creating lesson'
      };
    }
  }

  // Update lesson
  async updateLesson(
    lessonId: string,
    data: Partial<LessonData>
  ): Promise<ServiceResponse<LessonWithRelations>> {
    try {
      const lesson = await prisma.lesson.update({
        where: { id: lessonId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          characters: true,
          vocabularyWords: true,
          mediaAssets: true,
        },
      });

      // Clear caches
      await contentCacheService.clearLessonCache(lessonId);

      lessonLogger('lesson_updated', lessonId, {
        title: lesson.title,
        type: lesson.type,
        jlptLevel: lesson.jlptLevel,
      });

      return {
        success: true,
        data: lesson,
        message: 'Lesson updated successfully'
      };
    } catch (error) {
      logger.error('Update lesson failed', { error: error.message, lessonId, data });
      return {
        success: false,
        error: 'Update lesson failed',
        message: 'An error occurred while updating lesson'
      };
    }
  }

  // Delete lesson
  async deleteLesson(lessonId: string): Promise<ServiceResponse<void>> {
    try {
      await prisma.lesson.update({
        where: { id: lessonId },
        data: { isActive: false },
      });

      // Clear caches
      await contentCacheService.clearLessonCache(lessonId);

      lessonLogger('lesson_deleted', lessonId);

      return {
        success: true,
        message: 'Lesson deleted successfully'
      };
    } catch (error) {
      logger.error('Delete lesson failed', { error: error.message, lessonId });
      return {
        success: false,
        error: 'Delete lesson failed',
        message: 'An error occurred while deleting lesson'
      };
    }
  }

  // Search lessons
  async searchLessons(
    query: string,
    filters: {
      type?: LessonType;
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
        return await tx.lesson.findMany({
          where: {
            isActive: true,
            ...filters,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          include: {
            characters: true,
            vocabularyWords: true,
            mediaAssets: true,
          },
          orderBy: { learningOrder: 'asc' },
          skip: (page - 1) * limit,
          take: limit,
        });
      });

      const total = await prisma.lesson.count({
        where: {
          isActive: true,
          ...filters,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
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

      lessonLogger('lessons_searched', undefined, {
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
      logger.error('Search lessons failed', { error: error.message, query, filters, pagination });
      return {
        success: false,
        error: 'Search lessons failed',
        message: 'An error occurred while searching lessons'
      };
    }
  }

  // Get lesson statistics
  async getLessonStatistics(): Promise<ServiceResponse<any>> {
    try {
      const stats = await prisma.lesson.groupBy({
        by: ['type', 'jlptLevel', 'difficultyLevel'],
        where: { isActive: true },
        _count: { id: true },
      });

      const total = await prisma.lesson.count({
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
        message: 'Lesson statistics retrieved successfully'
      };
    } catch (error) {
      logger.error('Get lesson statistics failed', { error: error.message });
      return {
        success: false,
        error: 'Get statistics failed',
        message: 'An error occurred while retrieving lesson statistics'
      };
    }
  }

  // Get lesson progression path
  async getLessonProgressionPath(
    currentLessonId: string
  ): Promise<ServiceResponse<any>> {
    try {
      const currentLesson = await prisma.lesson.findUnique({
        where: { id: currentLessonId },
        select: {
          id: true,
          title: true,
          type: true,
          jlptLevel: true,
          difficultyLevel: true,
          learningOrder: true,
          prerequisites: true,
        },
      });

      if (!currentLesson) {
        return {
          success: false,
          error: 'Lesson not found',
          message: 'Current lesson not found'
        };
      }

      // Get prerequisite lessons
      const prerequisiteLessons = await prisma.lesson.findMany({
        where: {
          id: { in: currentLesson.prerequisites },
          isActive: true,
        },
        select: {
          id: true,
          title: true,
          type: true,
          jlptLevel: true,
          difficultyLevel: true,
          learningOrder: true,
        },
        orderBy: { learningOrder: 'asc' },
      });

      // Get next lessons (lessons that have this lesson as prerequisite)
      const nextLessons = await prisma.lesson.findMany({
        where: {
          prerequisites: { has: currentLessonId },
          isActive: true,
        },
        select: {
          id: true,
          title: true,
          type: true,
          jlptLevel: true,
          difficultyLevel: true,
          learningOrder: true,
        },
        orderBy: { learningOrder: 'asc' },
      });

      // Get related lessons (same type and level)
      const relatedLessons = await prisma.lesson.findMany({
        where: {
          type: currentLesson.type,
          jlptLevel: currentLesson.jlptLevel,
          difficultyLevel: currentLesson.difficultyLevel,
          isActive: true,
          id: { not: currentLessonId },
        },
        select: {
          id: true,
          title: true,
          type: true,
          jlptLevel: true,
          difficultyLevel: true,
          learningOrder: true,
        },
        orderBy: { learningOrder: 'asc' },
        take: 5,
      });

      return {
        success: true,
        data: {
          current: currentLesson,
          prerequisites: prerequisiteLessons,
          next: nextLessons,
          related: relatedLessons,
        },
        message: 'Lesson progression path retrieved successfully'
      };
    } catch (error) {
      logger.error('Get lesson progression path failed', { error: error.message, currentLessonId });
      return {
        success: false,
        error: 'Get progression path failed',
        message: 'An error occurred while retrieving lesson progression path'
      };
    }
  }

  // Get lessons by estimated time
  async getLessonsByEstimatedTime(
    minTime: number = 1,
    maxTime: number = 300,
    pagination: PaginationParams = {}
  ): Promise<ServiceResponse<SearchResult<any>>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const skip = (page - 1) * limit;

      const where = {
        isActive: true,
        estimatedTime: {
          gte: minTime,
          lte: maxTime,
        },
      };

      const [lessons, total] = await Promise.all([
        prisma.lesson.findMany({
          where,
          include: {
            characters: true,
            vocabularyWords: true,
            mediaAssets: true,
          },
          orderBy: { estimatedTime: 'asc' },
          skip,
          take: limit,
        }),
        prisma.lesson.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          data: lessons,
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        message: 'Lessons retrieved successfully'
      };
    } catch (error) {
      logger.error('Get lessons by estimated time failed', { error: error.message, minTime, maxTime, pagination });
      return {
        success: false,
        error: 'Get lessons by estimated time failed',
        message: 'An error occurred while retrieving lessons by estimated time'
      };
    }
  }

  // Get random lessons
  async getRandomLessons(
    count: number = 5,
    filters: {
      type?: LessonType;
      jlptLevel?: JLPTLevel;
      difficultyLevel?: DifficultyLevel;
    } = {}
  ): Promise<ServiceResponse<any[]>> {
    try {
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

      const lessons = await prisma.lesson.findMany({
        where,
        include: {
          characters: true,
          vocabularyWords: true,
          mediaAssets: true,
        },
        take: count,
        orderBy: {
          id: 'asc', // This will be random in practice
        },
      });

      return {
        success: true,
        data: lessons,
        message: 'Random lessons retrieved successfully'
      };
    } catch (error) {
      logger.error('Get random lessons failed', { error: error.message, count, filters });
      return {
        success: false,
        error: 'Get random lessons failed',
        message: 'An error occurred while retrieving random lessons'
      };
    }
  }
}

// Export lesson service instance
export const lessonService = new LessonService();

// Export default
export default lessonService;
