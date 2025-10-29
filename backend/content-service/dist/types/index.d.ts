import { Request } from 'express';
import { CharacterType as PrismaCharacterType, JLPTLevel as PrismaJLPTLevel, DifficultyLevel as PrismaDifficultyLevel, MediaType as PrismaMediaType, LessonType as PrismaLessonType, VocabularyCategory as PrismaVocabularyCategory, Character, VocabularyWord, Lesson, MediaAsset, CharacterRelation } from '@prisma/client';
export declare const CharacterType: {
    HIRAGANA: "HIRAGANA";
    KATAKANA: "KATAKANA";
    KANJI: "KANJI";
};
export declare const JLPTLevel: {
    N5: "N5";
    N4: "N4";
    N3: "N3";
    N2: "N2";
    N1: "N1";
};
export declare const DifficultyLevel: {
    BEGINNER: "BEGINNER";
    INTERMEDIATE: "INTERMEDIATE";
    ADVANCED: "ADVANCED";
    EXPERT: "EXPERT";
};
export declare const MediaType: {
    IMAGE: "IMAGE";
    AUDIO: "AUDIO";
    VIDEO: "VIDEO";
    ANIMATION: "ANIMATION";
};
export declare const LessonType: {
    CHARACTER_LEARNING: "CHARACTER_LEARNING";
    VOCABULARY_LEARNING: "VOCABULARY_LEARNING";
    GRAMMAR_LEARNING: "GRAMMAR_LEARNING";
    READING_PRACTICE: "READING_PRACTICE";
    LISTENING_PRACTICE: "LISTENING_PRACTICE";
    WRITING_PRACTICE: "WRITING_PRACTICE";
};
export declare const VocabularyCategory: {
    FOOD: "FOOD";
    TRAVEL: "TRAVEL";
    FAMILY: "FAMILY";
    WORK: "WORK";
    EDUCATION: "EDUCATION";
    HEALTH: "HEALTH";
    SPORTS: "SPORTS";
    ENTERTAINMENT: "ENTERTAINMENT";
    TECHNOLOGY: "TECHNOLOGY";
    NATURE: "NATURE";
    CLOTHING: "CLOTHING";
    COLORS: "COLORS";
    NUMBERS: "NUMBERS";
    TIME: "TIME";
    WEATHER: "WEATHER";
    EMOTIONS: "EMOTIONS";
    ACTIONS: "ACTIONS";
    ADJECTIVES: "ADJECTIVES";
    VERBS: "VERBS";
    NOUNS: "NOUNS";
    OTHER: "OTHER";
};
export type CharacterType = PrismaCharacterType;
export type JLPTLevel = PrismaJLPTLevel;
export type DifficultyLevel = PrismaDifficultyLevel;
export type MediaType = PrismaMediaType;
export type LessonType = PrismaLessonType;
export type VocabularyCategory = PrismaVocabularyCategory;
export { Character, VocabularyWord, Lesson, MediaAsset, CharacterRelation };
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}
export interface CharacterData {
    character: string;
    type: CharacterType;
    jlptLevel?: JLPTLevel;
    difficultyLevel?: DifficultyLevel;
    meaning?: string;
    pronunciation?: string;
    romanization?: string;
    strokeCount?: number;
    strokeOrder?: any;
    strokePatterns?: any;
    kunyomi?: string[];
    onyomi?: string[];
    radical?: string;
    radicalMeaning?: string;
    examples?: any;
    usageNotes?: string;
    learningOrder?: number;
}
export interface CharacterWithRelations extends Character {
    mediaAssets?: MediaAsset[];
    characterRelations?: CharacterRelation[];
    relatedCharacters?: CharacterRelation[];
}
export interface StrokeOrderData {
    strokes: Array<{
        order: number;
        path: string;
        direction?: string;
        startPoint?: {
            x: number;
            y: number;
        };
        endPoint?: {
            x: number;
            y: number;
        };
    }>;
    boundingBox?: {
        width: number;
        height: number;
        x: number;
        y: number;
    };
}
export interface VocabularyData {
    japanese: string;
    romanization?: string;
    english: string;
    category?: VocabularyCategory;
    jlptLevel?: JLPTLevel;
    difficultyLevel?: DifficultyLevel;
    partOfSpeech?: string;
    pronunciation?: string;
    audioUrl?: string;
    exampleSentences?: any;
    usageNotes?: string;
    culturalNotes?: string;
    frequency?: number;
}
export interface VocabularyWithRelations extends VocabularyWord {
    characters?: Character[];
    mediaAssets?: MediaAsset[];
}
export interface ExampleSentence {
    japanese: string;
    romanization?: string;
    english: string;
    audioUrl?: string;
}
export interface LessonData {
    title: string;
    description?: string;
    type: LessonType;
    jlptLevel?: JLPTLevel;
    difficultyLevel?: DifficultyLevel;
    content?: any;
    objectives?: string[];
    prerequisites?: string[];
    estimatedTime?: number;
    learningOrder?: number;
}
export interface LessonWithRelations extends Lesson {
    characters?: Character[];
    vocabularyWords?: VocabularyWord[];
    mediaAssets?: MediaAsset[];
}
export interface LessonContent {
    sections: Array<{
        type: 'text' | 'image' | 'audio' | 'video' | 'exercise' | 'quiz';
        content: any;
        order: number;
    }>;
    exercises?: Array<{
        type: 'multiple_choice' | 'fill_blank' | 'matching' | 'writing';
        question: string;
        options?: string[];
        correctAnswer: string | string[];
        explanation?: string;
    }>;
}
export interface MediaData {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    type: MediaType;
    url: string;
    thumbnailUrl?: string;
    altText?: string;
    description?: string;
    width?: number;
    height?: number;
    duration?: number;
    characterId?: string;
    vocabularyWordId?: string;
    lessonId?: string;
}
export interface FileUpload {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer?: Buffer;
}
export interface SearchParams {
    query?: string;
    type?: CharacterType;
    jlptLevel?: JLPTLevel;
    difficultyLevel?: DifficultyLevel;
    category?: VocabularyCategory;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface SearchResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    timestamp: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface ErrorResponse {
    success: false;
    message: string;
    error: string;
    timestamp: string;
    path?: string;
    statusCode?: number;
}
export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface CacheKey {
    prefix: string;
    identifier: string;
    ttl?: number;
}
export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}
export interface ImageProcessingOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
    resize?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}
export interface AudioProcessingOptions {
    format?: 'mp3' | 'wav' | 'ogg';
    bitrate?: number;
    sampleRate?: number;
    channels?: number;
}
export interface CharacterLearningData {
    characterId: string;
    strokeOrder: StrokeOrderData;
    pronunciation: string;
    examples: string[];
    relatedWords: string[];
}
export interface VocabularyLearningData {
    vocabularyId: string;
    pronunciation: string;
    examples: ExampleSentence[];
    relatedCharacters: string[];
    culturalNotes?: string;
}
export interface LearningProgress {
    userId: string;
    characterId?: string;
    vocabularyWordId?: string;
    lessonId?: string;
    masteryLevel: number;
    attempts: number;
    lastAttempted?: Date;
    lastMastered?: Date;
}
export interface ContentStatistics {
    characters: {
        total: number;
        byType: Record<CharacterType, number>;
        byJLPTLevel: Record<JLPTLevel, number>;
        byDifficulty: Record<DifficultyLevel, number>;
    };
    vocabulary: {
        total: number;
        byCategory: Record<VocabularyCategory, number>;
        byJLPTLevel: Record<JLPTLevel, number>;
        byDifficulty: Record<DifficultyLevel, number>;
    };
    lessons: {
        total: number;
        byType: Record<LessonType, number>;
        byJLPTLevel: Record<JLPTLevel, number>;
        byDifficulty: Record<DifficultyLevel, number>;
    };
    media: {
        total: number;
        byType: Record<MediaType, number>;
        totalSize: number;
    };
}
export interface HealthCheckResponse {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    uptime: number;
    version: string;
    environment: string;
    database: {
        status: 'connected' | 'disconnected';
        responseTime?: number;
    };
    redis: {
        status: 'connected' | 'disconnected';
        responseTime?: number;
    };
    storage: {
        status: 'available' | 'unavailable';
        freeSpace?: number;
        totalSpace?: number;
    };
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
}
export interface AppConfig {
    port: number;
    nodeEnv: string;
    apiVersion: string;
    database: {
        url: string;
    };
    redis: {
        url: string;
        password?: string;
    };
    upload: {
        maxFileSize: number;
        uploadPath: string;
        allowedImageTypes: string[];
        allowedAudioTypes: string[];
        allowedVideoTypes: string[];
    };
    media: {
        baseUrl: string;
        thumbnailSize: number;
        imageQuality: number;
    };
    security: {
        rateLimitWindowMs: number;
        rateLimitMaxRequests: number;
    };
    cors: {
        origin: string[];
        credentials: boolean;
    };
    logging: {
        level: string;
        file: string;
    };
    search: {
        resultsLimit: number;
        cacheTtl: number;
    };
    content: {
        defaultPageSize: number;
        maxPageSize: number;
    };
    cache: {
        ttl: number;
        prefix: string;
    };
    performance: {
        queryTimeout: number;
        maxConcurrentUploads: number;
    };
}
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
export interface LogEntry {
    level: 'error' | 'warn' | 'info' | 'debug';
    message: string;
    timestamp: string;
    userId?: string;
    requestId?: string;
    metadata?: Record<string, any>;
}
//# sourceMappingURL=index.d.ts.map