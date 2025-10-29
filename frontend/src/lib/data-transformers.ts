/**
 * Data transformers to convert API responses to UI-friendly formats
 */

// User profile transformers
export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  location?: string;
  bio?: string;
  avatar?: string;
  joinedDate: string;
  stats: {
    totalCharacters: number;
    totalVocabulary: number;
    studyStreak: number;
    totalHours: number;
    lessonsCompleted: number;
    articlesWritten: number;
    totalViews: number;
    totalLikes: number;
  };
}

export interface ApiUserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  statistics: {
    characters_learned: number;
    vocabulary_learned: number;
    study_streak: number;
    total_study_time_minutes: number;
    lessons_completed: number;
    articles_written: number;
    total_views: number;
    total_likes: number;
  };
}

export function transformUserProfile(apiData: ApiUserProfile): UserProfile {
  return {
    id: apiData.id,
    name: apiData.name,
    username: apiData.username,
    email: apiData.email,
    location: apiData.location,
    bio: apiData.bio,
    avatar: apiData.avatar_url,
    joinedDate: new Date(apiData.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    }),
    stats: {
      totalCharacters: apiData.statistics.characters_learned,
      totalVocabulary: apiData.statistics.vocabulary_learned,
      studyStreak: apiData.statistics.study_streak,
      totalHours: Math.floor(apiData.statistics.total_study_time_minutes / 60),
      lessonsCompleted: apiData.statistics.lessons_completed,
      articlesWritten: apiData.statistics.articles_written,
      totalViews: apiData.statistics.total_views,
      totalLikes: apiData.statistics.total_likes,
    },
  };
}

// Article transformers
export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  tags: string[];
  publishedAt: string;
  readTime: string;
  views: number;
  likes: number;
  comments: number;
  trending: boolean;
  featured: boolean;
}

export interface ApiArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author_id: string;
  author_name: string;
  author_username: string;
  author_avatar: string;
  tags: string[];
  published_at: string;
  word_count: number;
  views: number;
  likes: number;
  comments_count: number;
  is_trending: boolean;
  is_featured: boolean;
}

export function transformArticle(apiData: ApiArticle): Article {
  const readTime = Math.ceil(apiData.word_count / 200); // Assuming 200 words per minute
  
  return {
    id: apiData.id,
    title: apiData.title,
    excerpt: apiData.excerpt,
    content: apiData.content,
    author: {
      id: apiData.author_id,
      name: apiData.author_name,
      username: apiData.author_username,
      avatar: apiData.author_avatar,
    },
    tags: apiData.tags,
    publishedAt: apiData.published_at,
    readTime: `${readTime} min read`,
    views: apiData.views,
    likes: apiData.likes,
    comments: apiData.comments_count,
    trending: apiData.is_trending,
    featured: apiData.is_featured,
  };
}

// Badge transformers
export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

export interface ApiBadge {
  id: number;
  name: string;
  description: string;
  icon_name: string;
  is_earned: boolean;
  earned_at?: string;
}

export function transformBadge(apiData: ApiBadge): Badge {
  return {
    id: apiData.id,
    name: apiData.name,
    description: apiData.description,
    icon: apiData.icon_name,
    earned: apiData.is_earned,
    earnedAt: apiData.earned_at,
  };
}

// Progress transformers
export interface ProgressData {
  overallStats: {
    totalCharacters: number;
    totalVocabulary: number;
    studyStreak: number;
    totalStudyTime: number; // minutes
    lastStudyDate: string;
  };
  categoryProgress: {
    hiragana: { learned: number; total: number; percentage: number };
    katakana: { learned: number; total: number; percentage: number };
    kanji: { learned: number; total: number; percentage: number };
  };
  jlptProgress: {
    N5: { kanji: number; vocabulary: number; kanjiProgress: number; vocabProgress: number };
    N4: { kanji: number; vocabulary: number; kanjiProgress: number; vocabProgress: number };
    N3: { kanji: number; vocabulary: number; kanjiProgress: number; vocabProgress: number };
    N2: { kanji: number; vocabulary: number; kanjiProgress: number; vocabProgress: number };
    N1: { kanji: number; vocabulary: number; kanjiProgress: number; vocabProgress: number };
  };
}

export interface ApiProgressData {
  overall_stats: {
    characters_learned: number;
    vocabulary_learned: number;
    study_streak: number;
    total_study_time_minutes: number;
    last_study_date: string;
  };
  category_progress: {
    hiragana: { learned: number; total: number };
    katakana: { learned: number; total: number };
    kanji: { learned: number; total: number };
  };
  jlpt_progress: {
    N5: { kanji_total: number; vocabulary_total: number; kanji_learned: number; vocabulary_learned: number };
    N4: { kanji_total: number; vocabulary_total: number; kanji_learned: number; vocabulary_learned: number };
    N3: { kanji_total: number; vocabulary_total: number; kanji_learned: number; vocabulary_learned: number };
    N2: { kanji_total: number; vocabulary_total: number; kanji_learned: number; vocabulary_learned: number };
    N1: { kanji_total: number; vocabulary_total: number; kanji_learned: number; vocabulary_learned: number };
  };
}

export function transformProgressData(apiData: ApiProgressData): ProgressData {
  const calculatePercentage = (learned: number, total: number) => 
    total > 0 ? Math.round((learned / total) * 100) : 0;

  return {
    overallStats: {
      totalCharacters: apiData.overall_stats.characters_learned,
      totalVocabulary: apiData.overall_stats.vocabulary_learned,
      studyStreak: apiData.overall_stats.study_streak,
      totalStudyTime: apiData.overall_stats.total_study_time_minutes,
      lastStudyDate: apiData.overall_stats.last_study_date,
    },
    categoryProgress: {
      hiragana: {
        learned: apiData.category_progress.hiragana.learned,
        total: apiData.category_progress.hiragana.total,
        percentage: calculatePercentage(
          apiData.category_progress.hiragana.learned,
          apiData.category_progress.hiragana.total
        ),
      },
      katakana: {
        learned: apiData.category_progress.katakana.learned,
        total: apiData.category_progress.katakana.total,
        percentage: calculatePercentage(
          apiData.category_progress.katakana.learned,
          apiData.category_progress.katakana.total
        ),
      },
      kanji: {
        learned: apiData.category_progress.kanji.learned,
        total: apiData.category_progress.kanji.total,
        percentage: calculatePercentage(
          apiData.category_progress.kanji.learned,
          apiData.category_progress.kanji.total
        ),
      },
    },
    jlptProgress: {
      N5: {
        kanji: apiData.jlpt_progress.N5.kanji_total,
        vocabulary: apiData.jlpt_progress.N5.vocabulary_total,
        kanjiProgress: calculatePercentage(
          apiData.jlpt_progress.N5.kanji_learned,
          apiData.jlpt_progress.N5.kanji_total
        ),
        vocabProgress: calculatePercentage(
          apiData.jlpt_progress.N5.vocabulary_learned,
          apiData.jlpt_progress.N5.vocabulary_total
        ),
      },
      N4: {
        kanji: apiData.jlpt_progress.N4.kanji_total,
        vocabulary: apiData.jlpt_progress.N4.vocabulary_total,
        kanjiProgress: calculatePercentage(
          apiData.jlpt_progress.N4.kanji_learned,
          apiData.jlpt_progress.N4.kanji_total
        ),
        vocabProgress: calculatePercentage(
          apiData.jlpt_progress.N4.vocabulary_learned,
          apiData.jlpt_progress.N4.vocabulary_total
        ),
      },
      N3: {
        kanji: apiData.jlpt_progress.N3.kanji_total,
        vocabulary: apiData.jlpt_progress.N3.vocabulary_total,
        kanjiProgress: calculatePercentage(
          apiData.jlpt_progress.N3.kanji_learned,
          apiData.jlpt_progress.N3.kanji_total
        ),
        vocabProgress: calculatePercentage(
          apiData.jlpt_progress.N3.vocabulary_learned,
          apiData.jlpt_progress.N3.vocabulary_total
        ),
      },
      N2: {
        kanji: apiData.jlpt_progress.N2.kanji_total,
        vocabulary: apiData.jlpt_progress.N2.vocabulary_total,
        kanjiProgress: calculatePercentage(
          apiData.jlpt_progress.N2.kanji_learned,
          apiData.jlpt_progress.N2.kanji_total
        ),
        vocabProgress: calculatePercentage(
          apiData.jlpt_progress.N2.vocabulary_learned,
          apiData.jlpt_progress.N2.vocabulary_total
        ),
      },
      N1: {
        kanji: apiData.jlpt_progress.N1.kanji_total,
        vocabulary: apiData.jlpt_progress.N1.vocabulary_total,
        kanjiProgress: calculatePercentage(
          apiData.jlpt_progress.N1.kanji_learned,
          apiData.jlpt_progress.N1.kanji_total
        ),
        vocabProgress: calculatePercentage(
          apiData.jlpt_progress.N1.vocabulary_learned,
          apiData.jlpt_progress.N1.vocabulary_total
        ),
      },
    },
  };
}
