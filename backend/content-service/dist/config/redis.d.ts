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
    private prefix;
    constructor();
    private getKey;
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
    clearByPattern(pattern: string): Promise<void>;
    info(): Promise<string>;
}
export declare class ContentCacheService extends CacheService {
    cacheCharacter(characterId: string, character: any, ttl?: number): Promise<void>;
    getCachedCharacter(characterId: string): Promise<any | null>;
    cacheCharactersByType(type: string, characters: any[], ttl?: number): Promise<void>;
    getCachedCharactersByType(type: string): Promise<any[] | null>;
    cacheCharactersByJLPT(level: string, characters: any[], ttl?: number): Promise<void>;
    getCachedCharactersByJLPT(level: string): Promise<any[] | null>;
    cacheVocabulary(vocabularyId: string, vocabulary: any, ttl?: number): Promise<void>;
    getCachedVocabulary(vocabularyId: string): Promise<any | null>;
    cacheVocabularyByCategory(category: string, vocabulary: any[], ttl?: number): Promise<void>;
    getCachedVocabularyByCategory(category: string): Promise<any[] | null>;
    cacheLesson(lessonId: string, lesson: any, ttl?: number): Promise<void>;
    getCachedLesson(lessonId: string): Promise<any | null>;
    cacheLessonsByType(type: string, lessons: any[], ttl?: number): Promise<void>;
    getCachedLessonsByType(type: string): Promise<any[] | null>;
    cacheSearchResults(query: string, results: any[], ttl?: number): Promise<void>;
    getCachedSearchResults(query: string): Promise<any[] | null>;
    cacheStatistics(stats: any, ttl?: number): Promise<void>;
    getCachedStatistics(): Promise<any | null>;
    clearCharacterCache(characterId?: string): Promise<void>;
    clearVocabularyCache(vocabularyId?: string): Promise<void>;
    clearLessonCache(lessonId?: string): Promise<void>;
    clearSearchCache(): Promise<void>;
    clearAllContentCache(): Promise<void>;
}
export declare const cacheService: CacheService;
export declare const contentCacheService: ContentCacheService;
//# sourceMappingURL=redis.d.ts.map