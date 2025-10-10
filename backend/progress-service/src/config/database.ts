import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Prisma client instance
let prisma: PrismaClient;

// Initialize Prisma client
export const initializePrisma = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
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

    // Log database queries in development
    if (process.env.NODE_ENV === 'development') {
      prisma.$on('query', (e) => {
        logger.debug('Database Query', {
          query: e.query,
          params: e.params,
          duration: `${e.duration}ms`,
        });
      });
    }

    // Log database errors
    prisma.$on('error', (e) => {
      logger.error('Database Error', {
        error: e.message,
        target: e.target,
      });
    });

    // Log database info
    prisma.$on('info', (e) => {
      logger.info('Database Info', {
        message: e.message,
        target: e.target,
      });
    });

    // Log database warnings
    prisma.$on('warn', (e) => {
      logger.warn('Database Warning', {
        message: e.message,
        target: e.target,
      });
    });
  }

  return prisma;
};

// Get Prisma client instance
export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    return initializePrisma();
  }
  return prisma;
};

// Connect to database
export const connectDatabase = async (): Promise<void> => {
  try {
    const client = getPrismaClient();
    await client.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Failed to connect to database', { error: error.message });
    throw error;
  }
};

// Disconnect from database
export const disconnectDatabase = async (): Promise<void> => {
  try {
    if (prisma) {
      await prisma.$disconnect();
      logger.info('Database disconnected successfully');
    }
  } catch (error) {
    logger.error('Failed to disconnect from database', { error: error.message });
    throw error;
  }
};

// Health check for database
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    return false;
  }
};

// Database transaction helper
export const withTransaction = async <T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> => {
  const client = getPrismaClient();
  return await client.$transaction(callback);
};

// Export default Prisma client
export default getPrismaClient();
