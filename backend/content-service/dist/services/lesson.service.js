"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.lessonService = exports.LessonService = void 0;
const database_1 = require("../config/database");
const redis_1 = require("../config/redis");
const logger_1 = require("../config/logger");
async function publishKafkaEvent(topic, key, value) {
    try {
        if (process.env.ENABLE_KAFKA === 'true') {
            const { publish } = await Promise.resolve().then(() => __importStar(require('../../../shared/utils/kafka')));
            await publish(topic, key, value);
        }
    }
    catch (error) {
        logger_1.logger.debug('Kafka publish failed (non-fatal)', { error: error?.message });
    }
}
const CONTENT_EVENTS_TOPIC = 'content.events';
class LessonService {
    async getLessons(pagination = {}, filters = {}) {
        try {
            const { page = 1, limit = 20, sortBy = 'learningOrder', sortOrder = 'asc' } = pagination;
            const skip = (page - 1) * limit;
            const where = {
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
                database_1.prisma.lesson.findMany({
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
                database_1.prisma.lesson.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            (0, logger_1.lessonLogger)('lessons_retrieved', undefined, {
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
        }
        catch (error) {
            logger_1.logger.error('Get lessons failed', { error: error.message, pagination, filters });
            return {
                success: false,
                error: 'Get lessons failed',
                message: 'An error occurred while retrieving lessons'
            };
        }
    }
    async getLessonById(lessonId) {
        try {
            const cachedLesson = await redis_1.contentCacheService.getCachedLesson(lessonId);
            if (cachedLesson) {
                return {
                    success: true,
                    data: cachedLesson,
                    message: 'Lesson retrieved successfully'
                };
            }
            const lesson = await database_1.prisma.lesson.findUnique({
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
            await redis_1.contentCacheService.cacheLesson(lessonId, lesson);
            (0, logger_1.lessonLogger)('lesson_retrieved', lessonId, {
                title: lesson.title,
                type: lesson.type,
                jlptLevel: lesson.jlptLevel,
            });
            await publishKafkaEvent(CONTENT_EVENTS_TOPIC, lessonId, { type: 'content.viewed', id: lessonId, contentType: 'lesson', occurredAt: new Date().toISOString() });
            return {
                success: true,
                data: lesson,
                message: 'Lesson retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get lesson by ID failed', { error: error.message, lessonId });
            return {
                success: false,
                error: 'Get lesson failed',
                message: 'An error occurred while retrieving lesson'
            };
        }
    }
    async getLessonsByType(type, pagination = {}) {
        try {
            const cacheKey = `${type}_${pagination.page || 1}_${pagination.limit || 20}`;
            const cachedLessons = await redis_1.contentCacheService.getCachedLessonsByType(cacheKey);
            if (cachedLessons) {
                const { page = 1, limit = 20 } = pagination;
                const total = cachedLessons.length;
                const totalPages = Math.ceil(total / limit);
                return {
                    success: true,
                    data: {
                        data: cachedLessons,
                        total,
                        page,
                        limit,
                        totalPages,
                        hasNext: page < totalPages,
                        hasPrev: page > 1,
                    },
                    message: 'Lessons retrieved successfully'
                };
            }
            const result = await this.getLessons(pagination, { type });
            if (result.success) {
                await redis_1.contentCacheService.set(`lessons:type:${cacheKey}`, result.data, 1800);
            }
            return result;
        }
        catch (error) {
            logger_1.logger.error('Get lessons by type failed', { error: error.message, type, pagination });
            return {
                success: false,
                error: 'Get lessons by type failed',
                message: 'An error occurred while retrieving lessons by type'
            };
        }
    }
    async getLessonsByJLPTLevel(level, pagination = {}) {
        try {
            const result = await this.getLessons(pagination, { jlptLevel: level });
            return result;
        }
        catch (error) {
            logger_1.logger.error('Get lessons by JLPT level failed', { error: error.message, level, pagination });
            return {
                success: false,
                error: 'Get lessons by JLPT level failed',
                message: 'An error occurred while retrieving lessons by JLPT level'
            };
        }
    }
    async getLessonsByDifficultyLevel(difficultyLevel, pagination = {}) {
        try {
            const result = await this.getLessons(pagination, { difficultyLevel });
            return result;
        }
        catch (error) {
            logger_1.logger.error('Get lessons by difficulty level failed', { error: error.message, difficultyLevel, pagination });
            return {
                success: false,
                error: 'Get lessons by difficulty level failed',
                message: 'An error occurred while retrieving lessons by difficulty level'
            };
        }
    }
    async createLesson(data) {
        try {
            const existingLesson = await database_1.prisma.lesson.findFirst({
                where: { title: data.title },
            });
            if (existingLesson) {
                return {
                    success: false,
                    error: 'Lesson already exists',
                    message: 'Lesson with this title already exists'
                };
            }
            const lesson = await database_1.prisma.lesson.create({
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
            await redis_1.contentCacheService.clearLessonCache();
            (0, logger_1.lessonLogger)('lesson_created', lesson.id, {
                title: lesson.title,
                type: lesson.type,
                jlptLevel: lesson.jlptLevel,
            });
            return {
                success: true,
                data: lesson,
                message: 'Lesson created successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Create lesson failed', { error: error.message, data });
            return {
                success: false,
                error: 'Create lesson failed',
                message: 'An error occurred while creating lesson'
            };
        }
    }
    async updateLesson(lessonId, data) {
        try {
            const lesson = await database_1.prisma.lesson.update({
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
            await redis_1.contentCacheService.clearLessonCache(lessonId);
            (0, logger_1.lessonLogger)('lesson_updated', lessonId, {
                title: lesson.title,
                type: lesson.type,
                jlptLevel: lesson.jlptLevel,
            });
            return {
                success: true,
                data: lesson,
                message: 'Lesson updated successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Update lesson failed', { error: error.message, lessonId, data });
            return {
                success: false,
                error: 'Update lesson failed',
                message: 'An error occurred while updating lesson'
            };
        }
    }
    async deleteLesson(lessonId) {
        try {
            await database_1.prisma.lesson.update({
                where: { id: lessonId },
                data: { isActive: false },
            });
            await redis_1.contentCacheService.clearLessonCache(lessonId);
            (0, logger_1.lessonLogger)('lesson_deleted', lessonId);
            return {
                success: true,
                message: 'Lesson deleted successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Delete lesson failed', { error: error.message, lessonId });
            return {
                success: false,
                error: 'Delete lesson failed',
                message: 'An error occurred while deleting lesson'
            };
        }
    }
    async searchLessons(query, filters = {}, pagination = {}) {
        try {
            const cacheKey = `search_${Buffer.from(query).toString('base64')}_${JSON.stringify(filters)}_${pagination.page || 1}_${pagination.limit || 20}`;
            const cachedResults = await redis_1.contentCacheService.getCachedSearchResults(cacheKey);
            if (cachedResults) {
                const { page = 1, limit = 20 } = pagination;
                const total = cachedResults.length;
                const totalPages = Math.ceil(total / limit);
                return {
                    success: true,
                    data: {
                        data: cachedResults,
                        total,
                        page,
                        limit,
                        totalPages,
                        hasNext: page < totalPages,
                        hasPrev: page > 1,
                    },
                    message: 'Search results retrieved successfully'
                };
            }
            const { page = 1, limit = 20 } = pagination;
            const result = await database_1.prisma.$transaction(async (tx) => {
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
            const total = await database_1.prisma.lesson.count({
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
            await redis_1.contentCacheService.cacheSearchResults(cacheKey, result);
            (0, logger_1.lessonLogger)('lessons_searched', undefined, {
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
        }
        catch (error) {
            logger_1.logger.error('Search lessons failed', { error: error.message, query, filters, pagination });
            return {
                success: false,
                error: 'Search lessons failed',
                message: 'An error occurred while searching lessons'
            };
        }
    }
    async getLessonStatistics() {
        try {
            const stats = await database_1.prisma.lesson.groupBy({
                by: ['type', 'jlptLevel', 'difficultyLevel'],
                where: { isActive: true },
                _count: { id: true },
            });
            const total = await database_1.prisma.lesson.count({
                where: { isActive: true },
            });
            return {
                success: true,
                data: {
                    total,
                    byType: stats.reduce((acc, stat) => {
                        acc[stat.type] = (acc[stat.type] || 0) + stat._count.id;
                        return acc;
                    }, {}),
                    byJLPTLevel: stats.reduce((acc, stat) => {
                        if (stat.jlptLevel) {
                            acc[stat.jlptLevel] = (acc[stat.jlptLevel] || 0) + stat._count.id;
                        }
                        return acc;
                    }, {}),
                    byDifficulty: stats.reduce((acc, stat) => {
                        acc[stat.difficultyLevel] = (acc[stat.difficultyLevel] || 0) + stat._count.id;
                        return acc;
                    }, {}),
                },
                message: 'Lesson statistics retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get lesson statistics failed', { error: error.message });
            return {
                success: false,
                error: 'Get statistics failed',
                message: 'An error occurred while retrieving lesson statistics'
            };
        }
    }
    async getLessonProgressionPath(currentLessonId) {
        try {
            const currentLesson = await database_1.prisma.lesson.findUnique({
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
            const prerequisiteLessons = await database_1.prisma.lesson.findMany({
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
            const nextLessons = await database_1.prisma.lesson.findMany({
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
            const relatedLessons = await database_1.prisma.lesson.findMany({
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
        }
        catch (error) {
            logger_1.logger.error('Get lesson progression path failed', { error: error.message, currentLessonId });
            return {
                success: false,
                error: 'Get progression path failed',
                message: 'An error occurred while retrieving lesson progression path'
            };
        }
    }
    async getLessonsByEstimatedTime(minTime = 1, maxTime = 300, pagination = {}) {
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
                database_1.prisma.lesson.findMany({
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
                database_1.prisma.lesson.count({ where }),
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
        }
        catch (error) {
            logger_1.logger.error('Get lessons by estimated time failed', { error: error.message, minTime, maxTime, pagination });
            return {
                success: false,
                error: 'Get lessons by estimated time failed',
                message: 'An error occurred while retrieving lessons by estimated time'
            };
        }
    }
    async getRandomLessons(count = 5, filters = {}) {
        try {
            const where = {
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
            const lessons = await database_1.prisma.lesson.findMany({
                where,
                include: {
                    characters: true,
                    vocabularyWords: true,
                    mediaAssets: true,
                },
                take: count,
                orderBy: {
                    id: 'asc',
                },
            });
            return {
                success: true,
                data: lessons,
                message: 'Random lessons retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get random lessons failed', { error: error.message, count, filters });
            return {
                success: false,
                error: 'Get random lessons failed',
                message: 'An error occurred while retrieving random lessons'
            };
        }
    }
    async getLessonsByLevel(level, pagination = {}) {
        try {
            const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
            const skip = (page - 1) * limit;
            const result = await database_1.prisma.$transaction(async (tx) => {
                const lessons = await tx.lesson.findMany({
                    where: { jlptLevel: level },
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
                    include: {
                        mediaAssets: true
                    }
                });
                const total = await tx.lesson.count({
                    where: { jlptLevel: level }
                });
                return { lessons, total };
            });
            const totalPages = Math.ceil(result.total / limit);
            const searchResults = {
                data: result.lessons,
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
                message: 'Lessons retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get lessons by level', { level, error });
            return {
                success: false,
                error: 'Failed to retrieve lessons',
                message: 'An error occurred while retrieving lessons by level'
            };
        }
    }
    async getLessonsByCategory(category, pagination = {}) {
        try {
            const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
            const skip = (page - 1) * limit;
            const result = await database_1.prisma.$transaction(async (tx) => {
                const lessons = await tx.lesson.findMany({
                    where: { type: category },
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
                    include: {
                        mediaAssets: true
                    }
                });
                const total = await tx.lesson.count({
                    where: { type: category }
                });
                return { lessons, total };
            });
            const totalPages = Math.ceil(result.total / limit);
            const searchResults = {
                data: result.lessons,
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
                message: 'Lessons retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get lessons by category', { category, error });
            return {
                success: false,
                error: 'Failed to retrieve lessons',
                message: 'An error occurred while retrieving lessons by category'
            };
        }
    }
    async getLessonSteps(lessonId) {
        try {
            const lesson = await database_1.prisma.lesson.findUnique({
                where: { id: lessonId },
                include: {
                    mediaAssets: true
                }
            });
            if (!lesson) {
                return {
                    success: false,
                    error: 'Lesson not found',
                    message: 'The specified lesson does not exist'
                };
            }
            const steps = lesson.content ? [lesson.content] : [];
            return {
                success: true,
                data: steps,
                message: 'Lesson steps retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get lesson steps', { lessonId, error });
            return {
                success: false,
                error: 'Failed to retrieve lesson steps',
                message: 'An error occurred while retrieving lesson steps'
            };
        }
    }
    async getLessonPrerequisites(lessonId) {
        try {
            const lesson = await database_1.prisma.lesson.findUnique({
                where: { id: lessonId }
            });
            if (!lesson) {
                return {
                    success: false,
                    error: 'Lesson not found',
                    message: 'The specified lesson does not exist'
                };
            }
            const prerequisites = lesson.prerequisites || [];
            return {
                success: true,
                data: prerequisites,
                message: 'Lesson prerequisites retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get lesson prerequisites', { lessonId, error });
            return {
                success: false,
                error: 'Failed to retrieve lesson prerequisites',
                message: 'An error occurred while retrieving lesson prerequisites'
            };
        }
    }
}
exports.LessonService = LessonService;
exports.lessonService = new LessonService();
exports.default = exports.lessonService;
//# sourceMappingURL=lesson.service.js.map