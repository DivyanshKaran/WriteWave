import { useQuery } from '@tanstack/react-query';
import { contentService, LessonParams, VocabularyParams, apiClient } from '@/lib/api-client';
import { VocabularyItemSchema, GrammarPointSchema, KanjiItemSchema, LessonItemSchema } from '@/types/schemas';

export function useKanjiList(level?: string) {
  return useQuery({
    queryKey: ['content','kanji', level || 'all'],
    queryFn: async () => {
      if (level) {
        const res = await contentService.getKanji(level);
        const arr = Array.isArray(res.data) ? res.data : [];
        return arr.map((k: any) => {
          const item = { char: k.char || k.character || k, meaning: k.meaning, level: k.level };
          const parsed = KanjiItemSchema.safeParse(item);
          return parsed.success ? parsed.data : null;
        }).filter(Boolean);
      }
      const res = await contentService.getKanji('all');
      const arr = Array.isArray(res.data) ? res.data : [];
      return arr.map((k: any) => {
        const item = { char: k.char || k.character || k, meaning: k.meaning, level: k.level };
        const parsed = KanjiItemSchema.safeParse(item);
        return parsed.success ? parsed.data : null;
      }).filter(Boolean);
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useVocabulary(params?: VocabularyParams) {
  return useQuery({
    queryKey: ['content','vocabulary', params || {}],
    queryFn: async () => {
      const res = await contentService.getVocabulary(params);
      const arr = Array.isArray(res.data) ? res.data : [];
      return arr.map((v: any) => {
        const parsed = VocabularyItemSchema.safeParse({
          id: v.id ?? v.word,
          word: v.word || v.term || v.kanji,
          reading: v.reading || v.kana,
          meaning: v.meaning || v.translation,
          level: v.level || v.jlpt,
          category: v.category,
        });
        return parsed.success ? parsed.data : null;
      }).filter(Boolean);
    },
    keepPreviousData: true,
    staleTime: 10 * 60 * 1000,
  });
}

export function useLessons(params?: LessonParams) {
  return useQuery({
    queryKey: ['content','lessons', params || {}],
    queryFn: async () => {
      const res = await contentService.getLessons(params);
      const arr = Array.isArray(res.data) ? res.data : [];
      return arr.map((l: any) => {
        const parsed = LessonItemSchema.safeParse({
          id: l.id,
          title: l.title,
          description: l.description,
          jlptLevel: l.jlptLevel,
          type: l.type,
        });
        return parsed.success ? parsed.data : null;
      }).filter(Boolean);
    },
    keepPreviousData: true,
    staleTime: 10 * 60 * 1000,
  });
}

// New hooks for radicals and grammar
export function useRadicals(params?: { q?: string; strokes?: number }) {
  return useQuery({
    queryKey: ['content','radicals', params || {}],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/radicals', { params });
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 10 * 60 * 1000,
  });
}

export function useGrammar(params?: { q?: string; level?: string; category?: string }) {
  return useQuery({
    queryKey: ['content','grammar', params || {}],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/grammar', { params });
      const arr = Array.isArray(res.data?.items) ? res.data.items : [];
      return arr.map((g: any) => {
        const parsed = GrammarPointSchema.safeParse(g);
        return parsed.success ? parsed.data : null;
      }).filter(Boolean);
    },
    keepPreviousData: true,
    staleTime: 10 * 60 * 1000,
  });
}


