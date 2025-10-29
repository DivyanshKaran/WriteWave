import { PrismaClient } from '@prisma/client';
import { logger, databaseLogger } from './logger';
import { DatabaseError } from './errors';

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  url: string;
  maxConnections?: number;
  connectionTimeout?: number;
  queryTimeout?: number;
  slowQueryThreshold?: number;
  logQueries?: boolean;
  logSlowQueries?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Query options interface
 */
export interface QueryOptions {
  timeout?: number;
  retries?: number;
  logQuery?: boolean;
  logSlow?: boolean;
}

/**
 * Transaction options interface
 */
export interface TransactionOptions {
  timeout?: number;
  isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
  maxWait?: number;
}

/**
 * Database utilities class
 */
export class DatabaseUtils {
  private prisma: PrismaClient;
  private config: DatabaseConfig;
  private isConnected: boolean = false;

  constructor(config: DatabaseConfig) {
    this.config = {
      maxConnections: 10,
      connectionTimeout: 30000,
      queryTimeout: 30000,
      slowQueryThreshold: 1000,
      logQueries: false,
      logSlowQueries: true,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };

    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: this.config.url
        }
      },
      log: this.config.logQueries ? [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'warn', emit: 'event' }
      ] : [
        { level: 'error', emit: 'event' }
      ]
    });

    this.setupEventListeners();
  }

  /**
   * Setup Prisma event listeners
   */
  private setupEventListeners(): void {
    this.prisma.$on('query', (e) => {
      const duration = e.duration;
      const isSlow = duration > this.config.slowQueryThreshold!;
      
      if (this.config.logQueries || (this.config.logSlowQueries && isSlow)) {
        databaseLogger.logQuery(e.query, duration, e.params);
      }
    });

    this.prisma.$on('error', (e) => {
      logger.error('Database error', { error: e.message });
    });

    this.prisma.$on('info', (e) => {
      logger.info('Database info', { message: e.message });
    });

    this.prisma.$on('warn', (e) => {
      logger.warn('Database warning', { message: e.message });
    });
  }

  /**
   * Connect to database
   */
  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      this.isConnected = true;
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection failed', { error: error.message });
      throw new DatabaseError('Database connection failed', error as Error);
    }
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      this.isConnected = false;
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Database disconnection failed', { error: error.message });
      throw new DatabaseError('Database disconnection failed', error as Error);
    }
  }

  /**
   * Get Prisma client instance
   */
  getClient(): PrismaClient {
    if (!this.isConnected) {
      throw new DatabaseError('Database not connected');
    }
    return this.prisma;
  }

  /**
   * Execute query with retry logic
   */
  async executeQuery<T>(
    queryFn: () => Promise<T>,
    options: QueryOptions = {}
  ): Promise<T> {
    const { timeout = this.config.queryTimeout, retries = this.config.retryAttempts } = options;
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retries!; attempt++) {
      try {
        const startTime = Date.now();
        const result = await Promise.race([
          queryFn(),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Query timeout')), timeout);
          })
        ]);
        
        const duration = Date.now() - startTime;
        
        if (options.logQuery) {
          databaseLogger.logQuery('Custom query', duration);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retries!) {
          logger.warn('Query attempt failed, retrying', {
            attempt,
            maxRetries: retries,
            error: error.message
          });
          
          await this.delay(this.config.retryDelay! * attempt);
        }
      }
    }
    
    throw new DatabaseError('Query failed after retries', lastError!);
  }

  /**
   * Execute transaction with retry logic
   */
  async executeTransaction<T>(
    transactionFn: (prisma: PrismaClient) => Promise<T>,
    options: TransactionOptions = {}
  ): Promise<T> {
    const { timeout = this.config.queryTimeout } = options;
    
    try {
      const startTime = Date.now();
      const result = await this.prisma.$transaction(
        transactionFn,
        {
          timeout,
          maxWait: options.maxWait || 5000,
          isolationLevel: options.isolationLevel || 'ReadCommitted'
        }
      );
      
      const duration = Date.now() - startTime;
      logger.debug('Transaction completed', { duration: `${duration}ms` });
      
      return result;
    } catch (error) {
      logger.error('Transaction failed', { error: error.message });
      throw new DatabaseError('Transaction failed', error as Error);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    error?: string;
  }> {
    try {
      const startTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: 0,
        error: error.message
      };
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    connectionCount: number;
    activeQueries: number;
    totalQueries: number;
    slowQueries: number;
  }> {
    try {
      // This is a simplified version - in production, you'd query actual database stats
      return {
        connectionCount: 1, // Prisma manages connections internally
        activeQueries: 0,
        totalQueries: 0,
        slowQueries: 0
      };
    } catch (error) {
      logger.error('Failed to get database stats', { error: error.message });
      throw new DatabaseError('Failed to get database stats', error as Error);
    }
  }

  /**
   * Utility method to delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Database connection manager
 */
export class DatabaseManager {
  private static instances: Map<string, DatabaseUtils> = new Map();

  /**
   * Get or create database instance
   */
  static getInstance(name: string, config: DatabaseConfig): DatabaseUtils {
    if (!this.instances.has(name)) {
      this.instances.set(name, new DatabaseUtils(config));
    }
    return this.instances.get(name)!;
  }

  /**
   * Connect all instances
   */
  static async connectAll(): Promise<void> {
    const promises = Array.from(this.instances.values()).map(instance => instance.connect());
    await Promise.all(promises);
  }

  /**
   * Disconnect all instances
   */
  static async disconnectAll(): Promise<void> {
    const promises = Array.from(this.instances.values()).map(instance => instance.disconnect());
    await Promise.all(promises);
  }

  /**
   * Health check all instances
   */
  static async healthCheckAll(): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    
    for (const [name, instance] of this.instances.entries()) {
      results[name] = await instance.healthCheck();
    }
    
    return results;
  }
}

/**
 * Query builder utilities
 */
export class QueryBuilder {
  /**
   * Build pagination query
   */
  static buildPagination(page: number = 1, limit: number = 20): {
    skip: number;
    take: number;
  } {
    const skip = (page - 1) * limit;
    return { skip, take: limit };
  }

  /**
   * Build sorting query
   */
  static buildSorting(sortBy: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc'): {
    orderBy: Record<string, 'asc' | 'desc'>;
  } {
    return { orderBy: { [sortBy]: sortOrder } };
  }

  /**
   * Build search query
   */
  static buildSearch(searchFields: string[], query: string): {
    OR: Array<Record<string, any>>;
  } {
    return {
      OR: searchFields.map(field => ({
        [field]: {
          contains: query,
          mode: 'insensitive' as const
        }
      }))
    };
  }

  /**
   * Build date range query
   */
  static buildDateRange(startDate?: Date, endDate?: Date): Record<string, any> {
    const query: Record<string, any> = {};
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.gte = startDate;
      if (endDate) query.createdAt.lte = endDate;
    }
    
    return query;
  }

  /**
   * Build filter query
   */
  static buildFilter(filters: Record<string, any>): Record<string, any> {
    const query: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          query[key] = { in: value };
        } else if (typeof value === 'string' && value.includes('*')) {
          query[key] = {
            contains: value.replace(/\*/g, ''),
            mode: 'insensitive' as const
          };
        } else {
          query[key] = value;
        }
      }
    }
    
    return query;
  }
}

/**
 * Database migration utilities
 */
export class MigrationUtils {
  /**
   * Check if migration is needed
   */
  static async checkMigrationStatus(prisma: PrismaClient): Promise<{
    isUpToDate: boolean;
    pendingMigrations: string[];
  }> {
    try {
      // This would typically use Prisma's migration status command
      // For now, we'll return a placeholder
      return {
        isUpToDate: true,
        pendingMigrations: []
      };
    } catch (error) {
      logger.error('Failed to check migration status', { error: error.message });
      throw new DatabaseError('Failed to check migration status', error as Error);
    }
  }

  /**
   * Run pending migrations
   */
  static async runMigrations(prisma: PrismaClient): Promise<void> {
    try {
      // This would typically use Prisma's migrate deploy command
      logger.info('Running database migrations');
    } catch (error) {
      logger.error('Migration failed', { error: error.message });
      throw new DatabaseError('Migration failed', error as Error);
    }
  }
}

/**
 * Database backup utilities
 */
export class BackupUtils {
  /**
   * Create database backup
   */
  static async createBackup(prisma: PrismaClient, backupPath: string): Promise<void> {
    try {
      // This would typically use pg_dump or similar tool
      logger.info('Creating database backup', { backupPath });
    } catch (error) {
      logger.error('Backup creation failed', { error: error.message });
      throw new DatabaseError('Backup creation failed', error as Error);
    }
  }

  /**
   * Restore database from backup
   */
  static async restoreBackup(prisma: PrismaClient, backupPath: string): Promise<void> {
    try {
      // This would typically use pg_restore or similar tool
      logger.info('Restoring database from backup', { backupPath });
    } catch (error) {
      logger.error('Backup restoration failed', { error: error.message });
      throw new DatabaseError('Backup restoration failed', error as Error);
    }
  }
}

/**
 * Export utilities
 */
export const databaseUtils = {
  DatabaseUtils,
  DatabaseManager,
  QueryBuilder,
  MigrationUtils,
  BackupUtils
};
