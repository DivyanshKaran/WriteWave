import { z } from 'zod';

export const UserSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  email: z.string().email().optional(),
  username: z.string().optional(),
  displayName: z.string().optional(),
  preferences: z.any().optional(),
});

export const NotificationSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  title: z.string().optional(),
  message: z.string().optional(),
  content: z.string().optional(),
  read: z.boolean().optional(),
  createdAt: z.string().optional(),
});

export const ArticleSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  title: z.string(),
  content: z.string().optional(),
  author: z.object({
    name: z.string().optional(),
    username: z.string().optional(),
  }).optional(),
  tags: z.array(z.string()).optional(),
});

export const VocabularyItemSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String).optional(),
  word: z.string().optional(),
  reading: z.string().optional(),
  meaning: z.string().optional(),
  level: z.string().optional(),
  category: z.string().optional(),
});

export const GrammarPointSchema = z.object({
  id: z.string(),
  pattern: z.string(),
  meaning: z.string(),
  jlptLevel: z.string().optional(),
  category: z.string().optional(),
});

export const KanjiItemSchema = z.object({
  char: z.string(),
  meaning: z.string().optional(),
  level: z.string().optional(),
});

export const LessonItemSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  title: z.string().optional(),
  description: z.string().optional(),
  jlptLevel: z.string().optional(),
  type: z.string().optional(),
});

export const ForumSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String).optional(),
  slug: z.string().optional(),
  title: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  groupId: z.union([z.string(), z.number()]).transform(String).optional(),
});

export const PostSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  title: z.string().optional(),
  content: z.string().optional(),
  author: z.string().optional(),
  createdAt: z.string().optional(),
  repliesCount: z.number().optional(),
});

export const ProgressSummarySchema = z.object({
  totalTime: z.number().optional(),
  sessions: z.number().optional(),
  charactersLearned: z.number().optional(),
});

export const StreakSchema = z.object({
  current: z.number().optional(),
  longest: z.number().optional(),
});

export type UserType = z.infer<typeof UserSchema>;
export type NotificationType = z.infer<typeof NotificationSchema>;
export type ArticleType = z.infer<typeof ArticleSchema>;
export type VocabularyItemType = z.infer<typeof VocabularyItemSchema>;
export type GrammarPointType = z.infer<typeof GrammarPointSchema>;
export type ForumType = z.infer<typeof ForumSchema>;
export type PostType = z.infer<typeof PostSchema>;
export type ProgressSummaryType = z.infer<typeof ProgressSummarySchema>;
export type StreakType = z.infer<typeof StreakSchema>;
export type KanjiItemType = z.infer<typeof KanjiItemSchema>;
export type LessonItemType = z.infer<typeof LessonItemSchema>;


