import Redis from 'ioredis';
import { logger } from './logger';

export class RedisClient {
  private client: Redis;
  private isConnected: boolean = false;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      enableReadyCheck: false,
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 3,
    } as any);

    this.setupEventHandlers();
    this.connect();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      logger.info('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });

    this.client.on('error', (error) => {
      logger.error('Redis client error', { error: error.message });
      this.isConnected = false;
    });

    this.client.on('close', () => {
      logger.info('Redis client connection closed');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis client reconnecting');
    });
  }

  private async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis', { error: error.message });
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET error', { key, error: error.message });
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error('Redis SET error', { key, error: error.message });
      return false;
    }
  }

  async setex(key: string, ttl: number, value: string): Promise<boolean> {
    try {
      await this.client.setex(key, ttl, value);
      return true;
    } catch (error) {
      logger.error('Redis SETEX error', { key, ttl, error: error.message });
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      logger.error('Redis DEL error', { key, error: error.message });
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error', { key, error: error.message });
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, ttl);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXPIRE error', { key, ttl, error: error.message });
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Redis TTL error', { key, error: error.message });
      return -1;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error('Redis INCR error', { key, error: error.message });
      return 0;
    }
  }

  async decr(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch (error) {
      logger.error('Redis DECR error', { key, error: error.message });
      return 0;
    }
  }

  async incrby(key: string, increment: number): Promise<number> {
    try {
      return await this.client.incrby(key, increment);
    } catch (error) {
      logger.error('Redis INCRBY error', { key, increment, error: error.message });
      return 0;
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      logger.error('Redis HGET error', { key, field, error: error.message });
      return null;
    }
  }

  async hset(key: string, field: string, value: string): Promise<boolean> {
    try {
      const result = await this.client.hset(key, field, value);
      return result >= 0;
    } catch (error) {
      logger.error('Redis HSET error', { key, field, error: error.message });
      return false;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      logger.error('Redis HGETALL error', { key, error: error.message });
      return {};
    }
  }

  async hdel(key: string, field: string): Promise<boolean> {
    try {
      const result = await this.client.hdel(key, field);
      return result > 0;
    } catch (error) {
      logger.error('Redis HDEL error', { key, field, error: error.message });
      return false;
    }
  }

  async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.client.lpush(key, ...values);
    } catch (error) {
      logger.error('Redis LPUSH error', { key, error: error.message });
      return 0;
    }
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.client.rpush(key, ...values);
    } catch (error) {
      logger.error('Redis RPUSH error', { key, error: error.message });
      return 0;
    }
  }

  async lpop(key: string): Promise<string | null> {
    try {
      return await this.client.lpop(key);
    } catch (error) {
      logger.error('Redis LPOP error', { key, error: error.message });
      return null;
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      return await this.client.rpop(key);
    } catch (error) {
      logger.error('Redis RPOP error', { key, error: error.message });
      return null;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lrange(key, start, stop);
    } catch (error) {
      logger.error('Redis LRANGE error', { key, start, stop, error: error.message });
      return [];
    }
  }

  async ltrim(key: string, start: number, stop: number): Promise<boolean> {
    try {
      await this.client.ltrim(key, start, stop);
      return true;
    } catch (error) {
      logger.error('Redis LTRIM error', { key, start, stop, error: error.message });
      return false;
    }
  }

  async llen(key: string): Promise<number> {
    try {
      return await this.client.llen(key);
    } catch (error) {
      logger.error('Redis LLEN error', { key, error: error.message });
      return 0;
    }
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sadd(key, ...members);
    } catch (error) {
      logger.error('Redis SADD error', { key, error: error.message });
      return 0;
    }
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.srem(key, ...members);
    } catch (error) {
      logger.error('Redis SREM error', { key, error: error.message });
      return 0;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (error) {
      logger.error('Redis SMEMBERS error', { key, error: error.message });
      return [];
    }
  }

  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.client.sismember(key, member);
      return result === 1;
    } catch (error) {
      logger.error('Redis SISMEMBER error', { key, member, error: error.message });
      return false;
    }
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    try {
      return await this.client.zadd(key, score, member);
    } catch (error) {
      logger.error('Redis ZADD error', { key, score, member, error: error.message });
      return 0;
    }
  }

  async zrange(key: string, start: number, stop: number, withScores: boolean = false): Promise<string[]> {
    try {
      if (withScores) {
        return await this.client.zrange(key, start, stop, 'WITHSCORES');
      }
      return await this.client.zrange(key, start, stop);
    } catch (error) {
      logger.error('Redis ZRANGE error', { key, start, stop, error: error.message });
      return [];
    }
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.zrem(key, ...members);
    } catch (error) {
      logger.error('Redis ZREM error', { key, error: error.message });
      return 0;
    }
  }

  async zcard(key: string): Promise<number> {
    try {
      return await this.client.zcard(key);
    } catch (error) {
      logger.error('Redis ZCARD error', { key, error: error.message });
      return 0;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error('Redis KEYS error', { pattern, error: error.message });
      return [];
    }
  }

  async flushdb(): Promise<boolean> {
    try {
      await this.client.flushdb();
      return true;
    } catch (error) {
      logger.error('Redis FLUSHDB error', { error: error.message });
      return false;
    }
  }

  async flushall(): Promise<boolean> {
    try {
      await this.client.flushall();
      return true;
    } catch (error) {
      logger.error('Redis FLUSHALL error', { error: error.message });
      return false;
    }
  }

  async info(section?: string): Promise<string> {
    try {
      return await this.client.info(section);
    } catch (error) {
      logger.error('Redis INFO error', { section, error: error.message });
      return '';
    }
  }

  async ping(): Promise<string> {
    try {
      return await this.client.ping();
    } catch (error) {
      logger.error('Redis PING error', { error: error.message });
      return '';
    }
  }

  async quit(): Promise<void> {
    try {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis client disconnected');
    } catch (error) {
      logger.error('Redis QUIT error', { error: error.message });
    }
  }

  async disconnect(): Promise<void> {
    try {
      this.client.disconnect();
      this.isConnected = false;
      logger.info('Redis client disconnected');
    } catch (error) {
      logger.error('Redis disconnect error', { error: error.message });
    }
  }

  isHealthy(): boolean {
    return this.isConnected;
  }

  getClient(): Redis {
    return this.client;
  }
}

export const redisClient = new RedisClient();
