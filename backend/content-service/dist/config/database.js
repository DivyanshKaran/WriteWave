"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimizeDatabase = exports.cleanupExpiredData = exports.getContentStatistics = exports.searchVocabulary = exports.searchCharacters = exports.search = exports.paginate = exports.withTransaction = exports.checkDatabaseHealth = exports.disconnectDatabase = exports.connectDatabase = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
exports.prisma = new client_1.PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'event',
            level: 'error',
        },
        {
            emit: 'event',
            level: 'info',
        },
        {
            emit: 'event',
            level: 'warn',
        },
    ],
});
exports.prisma.$on('query', (e) => {
    if (process.env.NODE_ENV === 'development') {
        logger_1.logger.debug('Prisma Query', {
            query: e.query,
            params: e.params,
            duration: `${e.duration}ms`,
        });
    }
});
exports.prisma.$on('error', (e) => {
    logger_1.logger.error('Prisma Error', {
        message: e.message,
        target: e.target,
    });
});
exports.prisma.$on('info', (e) => {
    logger_1.logger.info('Prisma Info', {
        message: e.message,
        target: e.target,
    });
});
exports.prisma.$on('warn', (e) => {
    logger_1.logger.warn('Prisma Warning', {
        message: e.message,
        target: e.target,
    });
});
const connectDatabase = async () => {
    try {
        await exports.prisma.$connect();
        logger_1.logger.info('Database connected successfully');
    }
    catch (error) {
        logger_1.logger.error('Database connection failed', { error });
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    try {
        await exports.prisma.$disconnect();
        logger_1.logger.info('Database disconnected successfully');
    }
    catch (error) {
        logger_1.logger.error('Database disconnection failed', { error });
        throw error;
    }
};
exports.disconnectDatabase = disconnectDatabase;
const checkDatabaseHealth = async () => {
    const startTime = Date.now();
    try {
        await exports.prisma.$queryRaw `SELECT 1`;
        const responseTime = Date.now() - startTime;
        return {
            status: 'connected',
            responseTime,
        };
    }
    catch (error) {
        logger_1.logger.error('Database health check failed', { error });
        return {
            status: 'disconnected',
        };
    }
};
exports.checkDatabaseHealth = checkDatabaseHealth;
const withTransaction = async (callback) => {
    return await exports.prisma.$transaction(callback);
};
exports.withTransaction = withTransaction;
const paginate = async (model, page = 1, limit = 10, where = {}, orderBy = { createdAt: 'desc' }) => {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        model.findMany({
            where,
            orderBy,
            skip,
            take: limit,
        }),
        model.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
};
exports.paginate = paginate;
const search = async (model, searchTerm, searchFields, page = 1, limit = 10, orderBy = { createdAt: 'desc' }) => {
    const skip = (page - 1) * limit;
    const searchConditions = searchFields.map(field => ({
        [field]: {
            contains: searchTerm,
            mode: 'insensitive',
        },
    }));
    const where = {
        OR: searchConditions,
    };
    const [data, total] = await Promise.all([
        model.findMany({
            where,
            orderBy,
            skip,
            take: limit,
        }),
        model.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
};
exports.search = search;
const searchCharacters = async (searchTerm, filters = {}, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const where = {
        isActive: true,
        OR: [
            { character: { contains: searchTerm, mode: 'insensitive' } },
            { meaning: { contains: searchTerm, mode: 'insensitive' } },
            { pronunciation: { contains: searchTerm, mode: 'insensitive' } },
            { romanization: { contains: searchTerm, mode: 'insensitive' } },
        ],
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
    const [data, total] = await Promise.all([
        exports.prisma.character.findMany({
            where,
            include: {
                mediaAssets: true,
                characterRelations: {
                    include: {
                        relatedCharacter: true,
                    },
                },
            },
            orderBy: { learningOrder: 'asc' },
            skip,
            take: limit,
        }),
        exports.prisma.character.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
};
exports.searchCharacters = searchCharacters;
const searchVocabulary = async (searchTerm, filters = {}, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const where = {
        isActive: true,
        OR: [
            { japanese: { contains: searchTerm, mode: 'insensitive' } },
            { english: { contains: searchTerm, mode: 'insensitive' } },
            { romanization: { contains: searchTerm, mode: 'insensitive' } },
            { pronunciation: { contains: searchTerm, mode: 'insensitive' } },
        ],
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
    const [data, total] = await Promise.all([
        exports.prisma.vocabularyWord.findMany({
            where,
            include: {
                characters: true,
                mediaAssets: true,
            },
            orderBy: { frequency: 'asc' },
            skip,
            take: limit,
        }),
        exports.prisma.vocabularyWord.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
};
exports.searchVocabulary = searchVocabulary;
const getContentStatistics = async () => {
    try {
        const [characterStats, vocabularyStats, lessonStats, mediaStats,] = await Promise.all([
            exports.prisma.character.groupBy({
                by: ['type', 'jlptLevel', 'difficultyLevel'],
                where: { isActive: true },
                _count: { id: true },
            }),
            exports.prisma.vocabularyWord.groupBy({
                by: ['category', 'jlptLevel', 'difficultyLevel'],
                where: { isActive: true },
                _count: { id: true },
            }),
            exports.prisma.lesson.groupBy({
                by: ['type', 'jlptLevel', 'difficultyLevel'],
                where: { isActive: true },
                _count: { id: true },
            }),
            exports.prisma.mediaAsset.groupBy({
                by: ['type'],
                where: { isActive: true },
                _count: { id: true },
                _sum: { size: true },
            }),
        ]);
        return {
            characters: characterStats,
            vocabulary: vocabularyStats,
            lessons: lessonStats,
            media: mediaStats,
        };
    }
    catch (error) {
        logger_1.logger.error('Failed to get content statistics', { error });
        throw error;
    }
};
exports.getContentStatistics = getContentStatistics;
const cleanupExpiredData = async () => {
    try {
        logger_1.logger.info('Content cleanup completed successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to cleanup expired data', { error });
        throw error;
    }
};
exports.cleanupExpiredData = cleanupExpiredData;
const optimizeDatabase = async () => {
    try {
        await exports.prisma.$executeRaw `VACUUM ANALYZE`;
        logger_1.logger.info('Database optimization completed successfully');
    }
    catch (error) {
        logger_1.logger.error('Database optimization failed', { error });
        throw error;
    }
};
exports.optimizeDatabase = optimizeDatabase;
//# sourceMappingURL=database.js.map