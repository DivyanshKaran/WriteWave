"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vocabularyService = exports.VocabularyService = void 0;
const database_1 = require("../config/database");
const redis_1 = require("../config/redis");
const logger_1 = require("../config/logger");
class VocabularyService {
    async getVocabularyWords(pagination = {}, filters = {}) {
        try {
            const { page = 1, limit = 20, sortBy = 'frequency', sortOrder = 'asc' } = pagination;
            const skip = (page - 1) * limit;
            const where = {
                isActive: true,
            };
            if (filters.category) {
                where.category = filters.category;
            }
            if (filters.jlptLevel) {
                where.jlptLevel = filters.jlptLevel;
            }
            if (filters.difficultyLevel) {
                where.difficultyLevel = filters.difficultyLevel;
            }
            const [vocabulary, total] = await Promise.all([
                database_1.prisma.vocabularyWord.findMany({
                    where,
                    include: {
                        characters: true,
                        mediaAssets: true,
                    },
                    orderBy: { [sortBy]: sortOrder },
                    skip,
                    take: limit,
                }),
                database_1.prisma.vocabularyWord.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            (0, logger_1.vocabularyLogger)('vocabulary_retrieved', undefined, {
                count: vocabulary.length,
                total,
                page,
                limit,
                filters,
            });
            return {
                success: true,
                data: {
                    data: vocabulary,
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
                message: 'Vocabulary words retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get vocabulary words failed', { error: error.message, pagination, filters });
            return {
                success: false,
                error: 'Get vocabulary words failed',
                message: 'An error occurred while retrieving vocabulary words'
            };
        }
    }
    async getVocabularyWordById(vocabularyId) {
        try {
            const cachedVocabulary = await redis_1.contentCacheService.getCachedVocabulary(vocabularyId);
            if (cachedVocabulary) {
                return {
                    success: true,
                    data: cachedVocabulary,
                    message: 'Vocabulary word retrieved successfully'
                };
            }
            const vocabulary = await database_1.prisma.vocabularyWord.findUnique({
                where: { id: vocabularyId },
                include: {
                    characters: true,
                    mediaAssets: true,
                },
            });
            if (!vocabulary) {
                return {
                    success: false,
                    error: 'Vocabulary word not found',
                    message: 'Vocabulary word not found'
                };
            }
            await redis_1.contentCacheService.cacheVocabulary(vocabularyId, vocabulary);
            (0, logger_1.vocabularyLogger)('vocabulary_retrieved', vocabularyId, {
                japanese: vocabulary.japanese,
                english: vocabulary.english,
                category: vocabulary.category,
            });
            return {
                success: true,
                data: vocabulary,
                message: 'Vocabulary word retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get vocabulary word by ID failed', { error: error.message, vocabularyId });
            return {
                success: false,
                error: 'Get vocabulary word failed',
                message: 'An error occurred while retrieving vocabulary word'
            };
        }
    }
    async getVocabularyWordsByCategory(category, pagination = {}) {
        try {
            const cacheKey = `${category}_${pagination.page || 1}_${pagination.limit || 20}`;
            const cachedVocabulary = await redis_1.contentCacheService.getCachedVocabularyByCategory(cacheKey);
            if (cachedVocabulary) {
                const { page = 1, limit = 20 } = pagination;
                const total = cachedVocabulary.length;
                const totalPages = Math.ceil(total / limit);
                return {
                    success: true,
                    data: {
                        data: cachedVocabulary,
                        total,
                        page,
                        limit,
                        totalPages,
                        hasNext: page < totalPages,
                        hasPrev: page > 1,
                    },
                    message: 'Vocabulary words retrieved successfully'
                };
            }
            const result = await this.getVocabularyWords(pagination, { category });
            if (result.success) {
                await redis_1.contentCacheService.set(`vocabulary:category:${cacheKey}`, result.data, 1800);
            }
            return result;
        }
        catch (error) {
            logger_1.logger.error('Get vocabulary words by category failed', { error: error.message, category, pagination });
            return {
                success: false,
                error: 'Get vocabulary words by category failed',
                message: 'An error occurred while retrieving vocabulary words by category'
            };
        }
    }
    async getVocabularyWordsByJLPTLevel(level, pagination = {}) {
        try {
            const result = await this.getVocabularyWords(pagination, { jlptLevel: level });
            return result;
        }
        catch (error) {
            logger_1.logger.error('Get vocabulary words by JLPT level failed', { error: error.message, level, pagination });
            return {
                success: false,
                error: 'Get vocabulary words by JLPT level failed',
                message: 'An error occurred while retrieving vocabulary words by JLPT level'
            };
        }
    }
    async searchVocabularyWords(query, filters = {}, pagination = {}) {
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
                return await tx.vocabularyWord.findMany({
                    where: {
                        isActive: true,
                        ...filters,
                        OR: [
                            { japanese: { contains: query, mode: 'insensitive' } },
                            { english: { contains: query, mode: 'insensitive' } },
                            { romanization: { contains: query, mode: 'insensitive' } },
                            { pronunciation: { contains: query, mode: 'insensitive' } },
                        ],
                    },
                    include: {
                        characters: true,
                        mediaAssets: true,
                    },
                    orderBy: { frequency: 'asc' },
                    skip: (page - 1) * limit,
                    take: limit,
                });
            });
            const total = await database_1.prisma.vocabularyWord.count({
                where: {
                    isActive: true,
                    ...filters,
                    OR: [
                        { japanese: { contains: query, mode: 'insensitive' } },
                        { english: { contains: query, mode: 'insensitive' } },
                        { romanization: { contains: query, mode: 'insensitive' } },
                        { pronunciation: { contains: query, mode: 'insensitive' } },
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
            (0, logger_1.vocabularyLogger)('vocabulary_searched', undefined, {
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
            logger_1.logger.error('Search vocabulary words failed', { error: error.message, query, filters, pagination });
            return {
                success: false,
                error: 'Search vocabulary words failed',
                message: 'An error occurred while searching vocabulary words'
            };
        }
    }
    async createVocabularyWord(data) {
        try {
            const existingVocabulary = await database_1.prisma.vocabularyWord.findFirst({
                where: {
                    japanese: data.japanese,
                    english: data.english,
                },
            });
            if (existingVocabulary) {
                return {
                    success: false,
                    error: 'Vocabulary word already exists',
                    message: 'Vocabulary word with this Japanese and English text already exists'
                };
            }
            const vocabulary = await database_1.prisma.vocabularyWord.create({
                data: {
                    japanese: data.japanese,
                    romanization: data.romanization,
                    english: data.english,
                    category: data.category || 'OTHER',
                    jlptLevel: data.jlptLevel,
                    difficultyLevel: data.difficultyLevel || 'BEGINNER',
                    partOfSpeech: data.partOfSpeech,
                    pronunciation: data.pronunciation,
                    audioUrl: data.audioUrl,
                    exampleSentences: data.exampleSentences,
                    usageNotes: data.usageNotes,
                    culturalNotes: data.culturalNotes,
                    frequency: data.frequency,
                },
                include: {
                    characters: true,
                    mediaAssets: true,
                },
            });
            await redis_1.contentCacheService.clearVocabularyCache();
            (0, logger_1.vocabularyLogger)('vocabulary_created', vocabulary.id, {
                japanese: vocabulary.japanese,
                english: vocabulary.english,
                category: vocabulary.category,
            });
            return {
                success: true,
                data: vocabulary,
                message: 'Vocabulary word created successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Create vocabulary word failed', { error: error.message, data });
            return {
                success: false,
                error: 'Create vocabulary word failed',
                message: 'An error occurred while creating vocabulary word'
            };
        }
    }
    async updateVocabularyWord(vocabularyId, data) {
        try {
            const vocabulary = await database_1.prisma.vocabularyWord.update({
                where: { id: vocabularyId },
                data: {
                    ...data,
                    updatedAt: new Date(),
                },
                include: {
                    characters: true,
                    mediaAssets: true,
                },
            });
            await redis_1.contentCacheService.clearVocabularyCache(vocabularyId);
            (0, logger_1.vocabularyLogger)('vocabulary_updated', vocabularyId, {
                japanese: vocabulary.japanese,
                english: vocabulary.english,
                category: vocabulary.category,
            });
            return {
                success: true,
                data: vocabulary,
                message: 'Vocabulary word updated successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Update vocabulary word failed', { error: error.message, vocabularyId, data });
            return {
                success: false,
                error: 'Update vocabulary word failed',
                message: 'An error occurred while updating vocabulary word'
            };
        }
    }
    async deleteVocabularyWord(vocabularyId) {
        try {
            await database_1.prisma.vocabularyWord.update({
                where: { id: vocabularyId },
                data: { isActive: false },
            });
            await redis_1.contentCacheService.clearVocabularyCache(vocabularyId);
            (0, logger_1.vocabularyLogger)('vocabulary_deleted', vocabularyId);
            return {
                success: true,
                message: 'Vocabulary word deleted successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Delete vocabulary word failed', { error: error.message, vocabularyId });
            return {
                success: false,
                error: 'Delete vocabulary word failed',
                message: 'An error occurred while deleting vocabulary word'
            };
        }
    }
    async getVocabularyStatistics() {
        try {
            const stats = await database_1.prisma.vocabularyWord.groupBy({
                by: ['category', 'jlptLevel', 'difficultyLevel'],
                where: { isActive: true },
                _count: { id: true },
            });
            const total = await database_1.prisma.vocabularyWord.count({
                where: { isActive: true },
            });
            return {
                success: true,
                data: {
                    total,
                    byCategory: stats.reduce((acc, stat) => {
                        acc[stat.category] = (acc[stat.category] || 0) + stat._count.id;
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
                message: 'Vocabulary statistics retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get vocabulary statistics failed', { error: error.message });
            return {
                success: false,
                error: 'Get statistics failed',
                message: 'An error occurred while retrieving vocabulary statistics'
            };
        }
    }
    async getVocabularyWordsByFrequency(minFrequency = 1, maxFrequency = 10000, pagination = {}) {
        try {
            const { page = 1, limit = 20 } = pagination;
            const skip = (page - 1) * limit;
            const where = {
                isActive: true,
                frequency: {
                    gte: minFrequency,
                    lte: maxFrequency,
                },
            };
            const [vocabulary, total] = await Promise.all([
                database_1.prisma.vocabularyWord.findMany({
                    where,
                    include: {
                        characters: true,
                        mediaAssets: true,
                    },
                    orderBy: { frequency: 'asc' },
                    skip,
                    take: limit,
                }),
                database_1.prisma.vocabularyWord.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                data: {
                    data: vocabulary,
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
                message: 'Vocabulary words retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get vocabulary words by frequency failed', { error: error.message, minFrequency, maxFrequency, pagination });
            return {
                success: false,
                error: 'Get vocabulary words by frequency failed',
                message: 'An error occurred while retrieving vocabulary words by frequency'
            };
        }
    }
    async getVocabularyWordsByPartOfSpeech(partOfSpeech, pagination = {}) {
        try {
            const { page = 1, limit = 20 } = pagination;
            const skip = (page - 1) * limit;
            const where = {
                isActive: true,
                partOfSpeech: {
                    contains: partOfSpeech,
                    mode: 'insensitive',
                },
            };
            const [vocabulary, total] = await Promise.all([
                database_1.prisma.vocabularyWord.findMany({
                    where,
                    include: {
                        characters: true,
                        mediaAssets: true,
                    },
                    orderBy: { frequency: 'asc' },
                    skip,
                    take: limit,
                }),
                database_1.prisma.vocabularyWord.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                data: {
                    data: vocabulary,
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
                message: 'Vocabulary words retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get vocabulary words by part of speech failed', { error: error.message, partOfSpeech, pagination });
            return {
                success: false,
                error: 'Get vocabulary words by part of speech failed',
                message: 'An error occurred while retrieving vocabulary words by part of speech'
            };
        }
    }
    async getRandomVocabularyWords(count = 10, filters = {}) {
        try {
            const where = {
                isActive: true,
            };
            if (filters.category) {
                where.category = filters.category;
            }
            if (filters.jlptLevel) {
                where.jlptLevel = filters.jlptLevel;
            }
            if (filters.difficultyLevel) {
                where.difficultyLevel = filters.difficultyLevel;
            }
            const vocabulary = await database_1.prisma.vocabularyWord.findMany({
                where,
                include: {
                    characters: true,
                    mediaAssets: true,
                },
                take: count,
                orderBy: {
                    id: 'asc',
                },
            });
            return {
                success: true,
                data: vocabulary,
                message: 'Random vocabulary words retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get random vocabulary words failed', { error: error.message, count, filters });
            return {
                success: false,
                error: 'Get random vocabulary words failed',
                message: 'An error occurred while retrieving random vocabulary words'
            };
        }
    }
}
exports.VocabularyService = VocabularyService;
exports.vocabularyService = new VocabularyService();
exports.default = exports.vocabularyService;
//# sourceMappingURL=vocabulary.service.js.map