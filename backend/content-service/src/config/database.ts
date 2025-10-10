import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Prisma Client instance
export const prisma = new PrismaClient({
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

// Log Prisma events
prisma.$on('query', (e) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Prisma Query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  }
});

prisma.$on('error', (e) => {
  logger.error('Prisma Error', {
    message: e.message,
    target: e.target,
  });
});

prisma.$on('info', (e) => {
  logger.info('Prisma Info', {
    message: e.message,
    target: e.target,
  });
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma Warning', {
    message: e.message,
    target: e.target,
  });
});

// Database connection function
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed', { error });
    throw error;
  }
};

// Database disconnection function
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Database disconnection failed', { error });
    throw error;
  }
};

// Database health check
export const checkDatabaseHealth = async (): Promise<{
  status: 'connected' | 'disconnected';
  responseTime?: number;
}> => {
  const startTime = Date.now();
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'connected',
      responseTime,
    };
  } catch (error) {
    logger.error('Database health check failed', { error });
    return {
      status: 'disconnected',
    };
  }
};

// Transaction helper
export const withTransaction = async <T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> => {
  return await prisma.$transaction(callback);
};

// Pagination helper
export const paginate = async <T>(
  model: any,
  page: number = 1,
  limit: number = 10,
  where: any = {},
  orderBy: any = { createdAt: 'desc' }
): Promise<{
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}> => {
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

// Search helper
export const search = async <T>(
  model: any,
  searchTerm: string,
  searchFields: string[],
  page: number = 1,
  limit: number = 10,
  orderBy: any = { createdAt: 'desc' }
): Promise<{
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}> => {
  const skip = (page - 1) * limit;
  
  // Build search conditions
  const searchConditions = searchFields.map(field => ({
    [field]: {
      contains: searchTerm,
      mode: 'insensitive' as const,
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

// Character search helper
export const searchCharacters = async (
  searchTerm: string,
  filters: {
    type?: string;
    jlptLevel?: string;
    difficultyLevel?: string;
  } = {},
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;
  
  const where: any = {
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
      orderBy: { learningOrder: 'asc' },
      skip,
      take: limit,
    }),
    prisma.character.count({ where }),
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

// Vocabulary search helper
export const searchVocabulary = async (
  searchTerm: string,
  filters: {
    category?: string;
    jlptLevel?: string;
    difficultyLevel?: string;
  } = {},
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;
  
  const where: any = {
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
    prisma.vocabularyWord.findMany({
      where,
      include: {
        characters: true,
        mediaAssets: true,
      },
      orderBy: { frequency: 'asc' },
      skip,
      take: limit,
    }),
    prisma.vocabularyWord.count({ where }),
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

// Content statistics
export const getContentStatistics = async () => {
  try {
    const [
      characterStats,
      vocabularyStats,
      lessonStats,
      mediaStats,
    ] = await Promise.all([
      // Character statistics
      prisma.character.groupBy({
        by: ['type', 'jlptLevel', 'difficultyLevel'],
        where: { isActive: true },
        _count: { id: true },
      }),
      
      // Vocabulary statistics
      prisma.vocabularyWord.groupBy({
        by: ['category', 'jlptLevel', 'difficultyLevel'],
        where: { isActive: true },
        _count: { id: true },
      }),
      
      // Lesson statistics
      prisma.lesson.groupBy({
        by: ['type', 'jlptLevel', 'difficultyLevel'],
        where: { isActive: true },
        _count: { id: true },
      }),
      
      // Media statistics
      prisma.mediaAsset.groupBy({
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
  } catch (error) {
    logger.error('Failed to get content statistics', { error });
    throw error;
  }
};

// Cleanup expired data
export const cleanupExpiredData = async (): Promise<void> => {
  try {
    // Clean up old media assets (if needed)
    // This could be implemented based on business requirements
    
    logger.info('Content cleanup completed successfully');
  } catch (error) {
    logger.error('Failed to cleanup expired data', { error });
    throw error;
  }
};

// Database optimization
export const optimizeDatabase = async (): Promise<void> => {
  try {
    // Run database optimization queries
    await prisma.$executeRaw`VACUUM ANALYZE`;
    
    logger.info('Database optimization completed successfully');
  } catch (error) {
    logger.error('Database optimization failed', { error });
    throw error;
  }
};
