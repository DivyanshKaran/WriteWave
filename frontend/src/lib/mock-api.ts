// Mock API responses for demo mode
// This file provides mock data for all API endpoints

import { mockUser } from './mock-data';

// Simulate API delay
const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

// Mock response wrapper
const mockResponse = <T>(data: T) => ({ data, status: 200, statusText: 'OK' });

// ============ USER DATA ============
export const mockUserProfile = {
  ...mockUser,
  stats: {
    totalCharacters: 212,
    totalVocabulary: 450,
    studyStreak: 15,
    totalStudyTime: 4520,
    lessonsCompleted: 48,
    articlesWritten: 3,
    totalViews: 1250,
    totalLikes: 89,
    level: 12,
    experience: 4850,
  }
};

export const mockUserSettings = {
  learning: { dailyGoal: 30, difficulty: 'intermediate', audioPlayback: true, strokeOrder: true },
  preferences: { theme: 'system', fontSize: 'medium', language: 'en', romanization: 'hepburn' },
  privacy: { profilePublic: true, showProgress: true },
};

// ============ PROGRESS DATA ============
export const mockProgressData = {
  overallStats: {
    totalCharacters: 212,
    totalVocabulary: 450,
    studyStreak: 15,
    totalStudyTime: 4520,
    lastStudyDate: '2025-01-14',
  },
  weeklyActivity: [
    { day: 'Mon', minutes: 45, characters: 12, vocabulary: 8, lessons: 1 },
    { day: 'Tue', minutes: 30, characters: 8, vocabulary: 5, lessons: 1 },
    { day: 'Wed', minutes: 60, characters: 15, vocabulary: 12, lessons: 2 },
    { day: 'Thu', minutes: 25, characters: 6, vocabulary: 4, lessons: 0 },
    { day: 'Fri', minutes: 50, characters: 10, vocabulary: 10, lessons: 1 },
    { day: 'Sat', minutes: 75, characters: 20, vocabulary: 15, lessons: 2 },
    { day: 'Sun', minutes: 40, characters: 8, vocabulary: 6, lessons: 1 },
  ],
  jlptProgress: {
    N5: { kanji: 80, vocabulary: 650, kanjiProgress: 75, vocabProgress: 82, grammarProgress: 70, listeningProgress: 60, readingProgress: 65 },
    N4: { kanji: 170, vocabulary: 1200, kanjiProgress: 45, vocabProgress: 38, grammarProgress: 40, listeningProgress: 35, readingProgress: 42 },
    N3: { kanji: 370, vocabulary: 2500, kanjiProgress: 15, vocabProgress: 12, grammarProgress: 10, listeningProgress: 8, readingProgress: 14 },
    N2: { kanji: 1000, vocabulary: 5000, kanjiProgress: 5, vocabProgress: 3, grammarProgress: 2, listeningProgress: 1, readingProgress: 4 },
    N1: { kanji: 2000, vocabulary: 10000, kanjiProgress: 0, vocabProgress: 0, grammarProgress: 0, listeningProgress: 0, readingProgress: 0 },
  },
  recentAchievements: [
    { title: 'Week Warrior', description: 'Maintained a 7-day study streak', date: '2025-01-10', icon: 'flame' },
    { title: 'Kanji Explorer', description: 'Learned 100 kanji characters', date: '2025-01-08', icon: 'book' },
    { title: 'Vocabulary Builder', description: 'Mastered 400 vocabulary words', date: '2025-01-05', icon: 'target' },
  ],
};

export const mockStreakData = {
  currentStreak: 15,
  longestStreak: 23,
  lastStudyDate: '2025-01-14',
  freezesAvailable: 2,
};

// ============ CHARACTERS DATA ============

const hiraganaChars = [
  { char: 'あ', romaji: 'a' }, { char: 'い', romaji: 'i' }, { char: 'う', romaji: 'u' }, { char: 'え', romaji: 'e' }, { char: 'お', romaji: 'o' },
  { char: 'か', romaji: 'ka' }, { char: 'き', romaji: 'ki' }, { char: 'く', romaji: 'ku' }, { char: 'け', romaji: 'ke' }, { char: 'こ', romaji: 'ko' },
  { char: 'さ', romaji: 'sa' }, { char: 'し', romaji: 'shi' }, { char: 'す', romaji: 'su' }, { char: 'せ', romaji: 'se' }, { char: 'そ', romaji: 'so' },
  { char: 'た', romaji: 'ta' }, { char: 'ち', romaji: 'chi' }, { char: 'つ', romaji: 'tsu' }, { char: 'て', romaji: 'te' }, { char: 'と', romaji: 'to' },
  { char: 'な', romaji: 'na' }, { char: 'に', romaji: 'ni' }, { char: 'ぬ', romaji: 'nu' }, { char: 'ね', romaji: 'ne' }, { char: 'の', romaji: 'no' },
  { char: 'は', romaji: 'ha' }, { char: 'ひ', romaji: 'hi' }, { char: 'ふ', romaji: 'fu' }, { char: 'へ', romaji: 'he' }, { char: 'ほ', romaji: 'ho' },
  { char: 'ま', romaji: 'ma' }, { char: 'み', romaji: 'mi' }, { char: 'む', romaji: 'mu' }, { char: 'め', romaji: 'me' }, { char: 'も', romaji: 'mo' },
  { char: 'や', romaji: 'ya' }, { char: 'ゆ', romaji: 'yu' }, { char: 'よ', romaji: 'yo' },
  { char: 'ら', romaji: 'ra' }, { char: 'り', romaji: 'ri' }, { char: 'る', romaji: 'ru' }, { char: 'れ', romaji: 're' }, { char: 'ろ', romaji: 'ro' },
  { char: 'わ', romaji: 'wa' }, { char: 'を', romaji: 'wo' }, { char: 'ん', romaji: 'n' },
];

const katakanaChars = [
  { char: 'ア', romaji: 'a' }, { char: 'イ', romaji: 'i' }, { char: 'ウ', romaji: 'u' }, { char: 'エ', romaji: 'e' }, { char: 'オ', romaji: 'o' },
  { char: 'カ', romaji: 'ka' }, { char: 'キ', romaji: 'ki' }, { char: 'ク', romaji: 'ku' }, { char: 'ケ', romaji: 'ke' }, { char: 'コ', romaji: 'ko' },
  { char: 'サ', romaji: 'sa' }, { char: 'シ', romaji: 'shi' }, { char: 'ス', romaji: 'su' }, { char: 'セ', romaji: 'se' }, { char: 'ソ', romaji: 'so' },
  { char: 'タ', romaji: 'ta' }, { char: 'チ', romaji: 'chi' }, { char: 'ツ', romaji: 'tsu' }, { char: 'テ', romaji: 'te' }, { char: 'ト', romaji: 'to' },
  { char: 'ナ', romaji: 'na' }, { char: 'ニ', romaji: 'ni' }, { char: 'ヌ', romaji: 'nu' }, { char: 'ネ', romaji: 'ne' }, { char: 'ノ', romaji: 'no' },
  { char: 'ハ', romaji: 'ha' }, { char: 'ヒ', romaji: 'hi' }, { char: 'フ', romaji: 'fu' }, { char: 'ヘ', romaji: 'he' }, { char: 'ホ', romaji: 'ho' },
  { char: 'マ', romaji: 'ma' }, { char: 'ミ', romaji: 'mi' }, { char: 'ム', romaji: 'mu' }, { char: 'メ', romaji: 'me' }, { char: 'モ', romaji: 'mo' },
  { char: 'ヤ', romaji: 'ya' }, { char: 'ユ', romaji: 'yu' }, { char: 'ヨ', romaji: 'yo' },
  { char: 'ラ', romaji: 'ra' }, { char: 'リ', romaji: 'ri' }, { char: 'ル', romaji: 'ru' }, { char: 'レ', romaji: 're' }, { char: 'ロ', romaji: 'ro' },
  { char: 'ワ', romaji: 'wa' }, { char: 'ヲ', romaji: 'wo' }, { char: 'ン', romaji: 'n' },
];

const kanjiData = [
  { char: '日', meanings: ['day', 'sun'], readings: [{ type: 'on', reading: 'ニチ' }, { type: 'kun', reading: 'ひ' }], level: 'N5', strokes: 4 },
  { char: '月', meanings: ['month', 'moon'], readings: [{ type: 'on', reading: 'ゲツ' }, { type: 'kun', reading: 'つき' }], level: 'N5', strokes: 4 },
  { char: '火', meanings: ['fire'], readings: [{ type: 'on', reading: 'カ' }, { type: 'kun', reading: 'ひ' }], level: 'N5', strokes: 4 },
  { char: '水', meanings: ['water'], readings: [{ type: 'on', reading: 'スイ' }, { type: 'kun', reading: 'みず' }], level: 'N5', strokes: 4 },
  { char: '木', meanings: ['tree', 'wood'], readings: [{ type: 'on', reading: 'モク' }, { type: 'kun', reading: 'き' }], level: 'N5', strokes: 4 },
  { char: '金', meanings: ['gold', 'money'], readings: [{ type: 'on', reading: 'キン' }, { type: 'kun', reading: 'かね' }], level: 'N5', strokes: 8 },
  { char: '土', meanings: ['earth', 'soil'], readings: [{ type: 'on', reading: 'ド' }, { type: 'kun', reading: 'つち' }], level: 'N5', strokes: 3 },
  { char: '人', meanings: ['person'], readings: [{ type: 'on', reading: 'ジン' }, { type: 'kun', reading: 'ひと' }], level: 'N5', strokes: 2 },
  { char: '山', meanings: ['mountain'], readings: [{ type: 'on', reading: 'サン' }, { type: 'kun', reading: 'やま' }], level: 'N5', strokes: 3 },
  { char: '川', meanings: ['river'], readings: [{ type: 'on', reading: 'セン' }, { type: 'kun', reading: 'かわ' }], level: 'N5', strokes: 3 },
  { char: '大', meanings: ['big', 'large'], readings: [{ type: 'on', reading: 'ダイ' }, { type: 'kun', reading: 'おお' }], level: 'N5', strokes: 3 },
  { char: '小', meanings: ['small', 'little'], readings: [{ type: 'on', reading: 'ショウ' }, { type: 'kun', reading: 'ちい' }], level: 'N5', strokes: 3 },
];

export const mockHiragana = hiraganaChars;
export const mockKatakana = katakanaChars;
export const mockKanji = kanjiData;

// ============ ARTICLES DATA ============
export const mockArticles = [
  {
    id: '1',
    title: 'Mastering Hiragana in 30 Days',
    excerpt: 'A comprehensive guide to learning all 46 hiragana characters with proven memorization techniques.',
    content: 'Learning hiragana is the first step in your Japanese journey...',
    author: { id: '1', name: 'Yuki Tanaka', username: 'yuki_sensei', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yuki' },
    tags: ['hiragana', 'beginner', 'guide'],
    category: 'learning',
    publishedAt: '2025-01-10',
    readTime: '8 min',
    views: 1250,
    likes: 89,
    comments: 12,
    trending: true,
    featured: true,
    isPublished: true,
  },
  {
    id: '2',
    title: 'JLPT N5 Grammar Essentials',
    excerpt: 'Everything you need to know about basic Japanese grammar patterns for the N5 exam.',
    content: 'The JLPT N5 tests fundamental grammar patterns...',
    author: { id: '2', name: 'Kenji Yamamoto', username: 'kenji_grammar', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kenji' },
    tags: ['grammar', 'JLPT', 'N5'],
    category: 'exam-prep',
    publishedAt: '2025-01-08',
    readTime: '12 min',
    views: 980,
    likes: 67,
    comments: 8,
    trending: true,
    featured: false,
    isPublished: true,
  },
  {
    id: '3',
    title: 'Common Kanji Radicals Explained',
    excerpt: 'Understanding radicals is key to memorizing kanji efficiently. Learn the most important ones here.',
    content: 'Radicals are the building blocks of kanji...',
    author: { id: '3', name: 'Sakura Ito', username: 'sakura_kanji', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sakura' },
    tags: ['kanji', 'radicals', 'intermediate'],
    category: 'learning',
    publishedAt: '2025-01-05',
    readTime: '10 min',
    views: 756,
    likes: 54,
    comments: 6,
    trending: false,
    featured: true,
    isPublished: true,
  },
  {
    id: '4',
    title: 'Japanese Particles: は vs が',
    excerpt: 'One of the most confusing aspects of Japanese grammar explained simply.',
    content: 'The difference between は and が is subtle but important...',
    author: { id: '2', name: 'Kenji Yamamoto', username: 'kenji_grammar', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kenji' },
    tags: ['grammar', 'particles', 'beginner'],
    category: 'learning',
    publishedAt: '2025-01-03',
    readTime: '6 min',
    views: 1100,
    likes: 78,
    comments: 15,
    trending: true,
    featured: false,
    isPublished: true,
  },
];

// ============ COMMUNITY DATA ============

export const mockForums = [
  { id: '1', title: 'General Discussion', description: 'Talk about anything Japanese learning related', slug: 'general', postCount: 156, memberCount: 1200 },
  { id: '2', title: 'Grammar Questions', description: 'Ask and answer grammar questions', slug: 'grammar', postCount: 89, memberCount: 890 },
  { id: '3', title: 'Kanji Corner', description: 'Discuss kanji learning strategies', slug: 'kanji', postCount: 67, memberCount: 650 },
  { id: '4', title: 'JLPT Preparation', description: 'Tips and resources for JLPT exams', slug: 'jlpt', postCount: 124, memberCount: 980 },
];

export const mockStudyGroups = [
  { id: '1', name: 'JLPT N5 Study Group', description: 'Preparing for N5 together', category: 'jlpt', level: 'beginner', memberCount: 45, maxMembers: 50, isPublic: true },
  { id: '2', name: 'Kanji Masters', description: 'Daily kanji practice and discussion', category: 'general', level: 'intermediate', memberCount: 32, maxMembers: 40, isPublic: true },
  { id: '3', name: 'Conversation Practice', description: 'Practice speaking Japanese', category: 'conversation', level: 'mixed', memberCount: 28, maxMembers: 30, isPublic: true },
];

export const mockNotifications = [
  { id: '1', type: 'achievement', title: 'New Achievement!', message: 'You earned the "Week Warrior" badge', isRead: false, createdAt: '2025-01-14T10:00:00Z' },
  { id: '2', type: 'community', title: 'New Reply', message: 'Yuki replied to your post', isRead: false, createdAt: '2025-01-14T08:30:00Z' },
  { id: '3', type: 'system', title: 'Daily Reminder', message: "Don't forget to study today!", isRead: true, createdAt: '2025-01-13T09:00:00Z' },
];

// ============ MOCK API SERVICE ============
export const MockAPI = {
  // User endpoints
  user: {
    getProfile: async () => { await delay(); return mockResponse(mockUserProfile); },
    getSettings: async () => { await delay(); return mockResponse(mockUserSettings); },
    updateProfile: async (data: any) => { await delay(); return mockResponse({ ...mockUserProfile, ...data }); },
    updateSettings: async (data: any) => { await delay(); return mockResponse({ ...mockUserSettings, ...data }); },
    getMe: async () => { 
      await delay(); 
      return mockResponse({ 
        token: 'mock-jwt-token-' + Date.now(), 
        refreshToken: 'mock-refresh-token-' + Date.now(),
        user: mockUser 
      }); 
    },
    register: async (data: any) => {
      await delay();
      return mockResponse({
        token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        user: { ...mockUser, email: data.email, username: data.username || data.firstName }
      });
    },
  },

  // Progress endpoints
  progress: {
    getUserProgress: async () => { await delay(); return mockResponse(mockProgressData); },
    getUserStreaks: async () => { await delay(); return mockResponse(mockStreakData); },
    getUserAnalytics: async () => { await delay(); return mockResponse(mockProgressData); },
    getUserAchievements: async () => { await delay(); return mockResponse(mockProgressData.recentAchievements); },
    updateCharacterPractice: async () => { await delay(); return mockResponse({ success: true }); },
    updateXP: async () => { await delay(); return mockResponse({ success: true }); },
    updateMastery: async () => { await delay(); return mockResponse({ success: true }); },
  },

  // Content endpoints
  content: {
    getHiragana: async () => { await delay(); return mockResponse(mockHiragana); },
    getKatakana: async () => { await delay(); return mockResponse(mockKatakana); },
    getKanji: async () => { await delay(); return mockResponse(mockKanji); },
    getCharacter: async (id: string) => { 
      await delay(); 
      const char = mockKanji.find(k => k.char === id) || mockKanji[0];
      return mockResponse(char); 
    },
  },

  // Articles endpoints
  articles: {
    getArticles: async () => { await delay(); return mockResponse(mockArticles); },
    getArticle: async (id: string) => { 
      await delay(); 
      return mockResponse(mockArticles.find(a => a.id === id) || mockArticles[0]); 
    },
    getTrendingArticles: async () => { await delay(); return mockResponse(mockArticles.filter(a => a.trending)); },
    getFeaturedArticles: async () => { await delay(); return mockResponse(mockArticles.filter(a => a.featured)); },
    createArticle: async (data: any) => { 
      await delay(); 
      return mockResponse({ id: Date.now().toString(), ...data, author: mockUser, views: 0, likes: 0, comments: 0 }); 
    },
    likeArticle: async () => { await delay(); return mockResponse({ success: true }); },
  },

  // Community endpoints
  community: {
    getForums: async () => { await delay(); return mockResponse(mockForums); },
    getStudyGroups: async () => { await delay(); return mockResponse(mockStudyGroups); },
    getStudyGroup: async (id: string) => { 
      await delay(); 
      return mockResponse(mockStudyGroups.find(g => g.id === id) || mockStudyGroups[0]); 
    },
    getPosts: async () => { await delay(); return mockResponse([]); },
  },

  // Notifications endpoints
  notifications: {
    getNotifications: async () => { await delay(); return mockResponse(mockNotifications); },
    getPreferences: async () => { await delay(); return mockResponse({ dailyReminder: true, achievements: true, community: true, newsletter: false }); },
    updatePreferences: async (data: any) => { await delay(); return mockResponse(data); },
    markAsRead: async () => { await delay(); return mockResponse({ success: true }); },
  },
};

export default MockAPI;
