import { Request } from 'express';
// Import Prisma-generated enums and types
import {
  CharacterType as PrismaCharacterType,
  JLPTLevel as PrismaJLPTLevel,
  DifficultyLevel as PrismaDifficultyLevel,
  MediaType as PrismaMediaType,
  LessonType as PrismaLessonType,
  VocabularyCategory as PrismaVocabularyCategory,
  Character,
  VocabularyWord,
  Lesson,
  MediaAsset,
  CharacterRelation
} from '@prisma/client';

// Re-export Prisma enums as both types and values
export const CharacterType = PrismaCharacterType;
export const JLPTLevel = PrismaJLPTLevel;
export const DifficultyLevel = PrismaDifficultyLevel;
export const MediaType = PrismaMediaType;
export const LessonType = PrismaLessonType;
export const VocabularyCategory = PrismaVocabularyCategory;

export type CharacterType = PrismaCharacterType;
export type JLPTLevel = PrismaJLPTLevel;
export type DifficultyLevel = PrismaDifficultyLevel;
export type MediaType = PrismaMediaType;
export type LessonType = PrismaLessonType;
export type VocabularyCategory = PrismaVocabularyCategory;

// Re-export Prisma models
export { Character, VocabularyWord, Lesson, MediaAsset, CharacterRelation };

// Extended Request interface
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Character interfaces
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
    startPoint?: { x: number; y: number };
    endPoint?: { x: number; y: number };
  }>;
  boundingBox?: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
}

// Vocabulary interfaces
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

// Lesson interfaces
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

// Media interfaces
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

// Search interfaces
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

// API Response interfaces
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

// Error Response interface
export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  timestamp: string;
  path?: string;
  statusCode?: number;
}

// Service Response interface
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination interface
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Cache interfaces
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

// File processing interfaces
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

// Character learning interfaces
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

// Progress tracking interfaces
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

// Statistics interfaces
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

// Health check interface
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

// Configuration interface
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

// Validation interfaces
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Log entry interface
export interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}
