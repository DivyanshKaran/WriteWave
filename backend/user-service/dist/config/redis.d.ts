import { RedisClientType } from 'redis';
export declare const connectRedis: () => Promise<RedisClientType>;
export declare const getRedisClient: () => RedisClientType;
export declare const disconnectRedis: () => Promise<void>;
export declare const checkRedisHealth: () => Promise<{
    status: "connected" | "disconnected";
    responseTime?: number;
}>;
export declare class CacheService {
    private client;
    constructor();
    set(key: string, value: any, ttlSeconds?: number): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    setEx(key: string, value: any, ttlSeconds: number): Promise<void>;
    ttl(key: string): Promise<number>;
    incr(key: string): Promise<number>;
    decr(key: string): Promise<number>;
    hSet(key: string, field: string, value: any): Promise<void>;
    hGet<T>(key: string, field: string): Promise<T | null>;
    hGetAll<T>(key: string): Promise<Record<string, T>>;
    hDel(key: string, field: string): Promise<void>;
    sAdd(key: string, ...members: string[]): Promise<void>;
    sMembers(key: string): Promise<string[]>;
    sRem(key: string, ...members: string[]): Promise<void>;
    sIsMember(key: string, member: string): Promise<boolean>;
    lPush(key: string, ...values: any[]): Promise<void>;
    rPop<T>(key: string): Promise<T | null>;
    lLen(key: string): Promise<number>;
    lRange<T>(key: string, start: number, stop: number): Promise<T[]>;
    flushAll(): Promise<void>;
    info(): Promise<string>;
}
export declare const getCacheService: () => CacheService;
export declare class SessionService {
    private client;
    constructor();
    createSession(userId: string, sessionData: any, ttlSeconds?: number): Promise<string>;
    getSession<T>(sessionId: string): Promise<T | null>;
    updateSession(sessionId: string, sessionData: any, ttlSeconds?: number): Promise<void>;
    deleteSession(sessionId: string): Promise<void>;
    extendSession(sessionId: string, ttlSeconds: number): Promise<void>;
    getUserSessions(userId: string): Promise<string[]>;
    deleteUserSessions(userId: string): Promise<void>;
}
export declare const getSessionService: () => SessionService;
//# sourceMappingURL=redis.d.ts.map