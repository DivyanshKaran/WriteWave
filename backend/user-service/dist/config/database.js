"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseStats = exports.cleanupExpiredRecords = exports.search = exports.paginate = exports.restoreSoftDelete = exports.softDelete = exports.withTransaction = exports.checkDatabaseHealth = exports.disconnectDatabase = exports.connectDatabase = exports.prisma = void 0;
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
const softDelete = async (model, id) => {
    await exports.prisma.$executeRawUnsafe(`UPDATE ${model} SET "isActive" = false, "updatedAt" = NOW() WHERE id = $1`, id);
};
exports.softDelete = softDelete;
const restoreSoftDelete = async (model, id) => {
    await exports.prisma.$executeRawUnsafe(`UPDATE ${model} SET "isActive" = true, "updatedAt" = NOW() WHERE id = $1`, id);
};
exports.restoreSoftDelete = restoreSoftDelete;
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
const cleanupExpiredRecords = async () => {
    try {
        await exports.prisma.emailVerification.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        await exports.prisma.passwordReset.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        await exports.prisma.refreshToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        await exports.prisma.session.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        logger_1.logger.info('Expired records cleaned up successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to cleanup expired records', { error });
        throw error;
    }
};
exports.cleanupExpiredRecords = cleanupExpiredRecords;
const getDatabaseStats = async () => {
    try {
        const [totalUsers, activeUsers, verifiedUsers, totalSessions, activeSessions,] = await Promise.all([
            exports.prisma.user.count(),
            exports.prisma.user.count({ where: { isActive: true } }),
            exports.prisma.user.count({ where: { isEmailVerified: true } }),
            exports.prisma.session.count(),
            exports.prisma.session.count({ where: { isActive: true } }),
        ]);
        return {
            users: totalUsers,
            activeUsers,
            verifiedUsers,
            sessions: totalSessions,
            activeSessions,
        };
    }
    catch (error) {
        logger_1.logger.error('Failed to get database statistics', { error });
        throw error;
    }
};
exports.getDatabaseStats = getDatabaseStats;
//# sourceMappingURL=database.js.map