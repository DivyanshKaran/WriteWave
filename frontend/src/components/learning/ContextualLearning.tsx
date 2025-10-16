"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, MessageSquare, Globe, Lightbulb, Target, TrendingUp, Play, Pause, SkipForward, Volume2, VolumeX, Eye, EyeOff, Filter, Search, Settings, Star, Heart, Share2, Bookmark } from 'lucide-react';
import type { Character } from '@/types/character';

interface ContextualLearningProps {
  userId: string;
  className?: string;
}

interface VocabularyWord {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'particle' | 'other';
  difficulty: number;
  frequency: number;
  characters: string[];
  context: string;
  exampleSentence: string;
  exampleTranslation: string;
  audioUrl?: string;
  imageUrl?: string;
  culturalNotes?: string;
  relatedWords: string[];
  tags: string[];
}

interface ContextualLesson {
  id: string;
  title: string;
  description: string;
  theme: 'daily-life' | 'food' | 'travel' | 'work' | 'school' | 'culture' | 'nature' | 'technology';
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  vocabulary: VocabularyWord[];
  characters: Character[];
  context: string;
  learningObjectives: string[];
  culturalContext?: string;
  interactiveElements: Array<{
    type: 'dialogue' | 'exercise' | 'quiz' | 'story' | 'game';
    title: string;
    description: string;
    estimatedTime: number;
  }>;
  progress: {
    completed: boolean;
    score: number;
    timeSpent: number;
    attempts: number;
    lastAccessed: string;
  };
}

interface ContextualLearningSession {
  id: string;
  lesson: ContextualLesson;
  currentStep: number;
  totalSteps: number;
  sessionType: 'vocabulary' | 'characters' | 'context' | 'practice';
  startTime: string;
  isActive: boolean;
  progress: {
    vocabularyLearned: number;
    charactersPracticed: number;
    exercisesCompleted: number;
    score: number;
  };
}

interface ContextualLearningStats {
  totalLessons: number;
  completedLessons: number;
  vocabularyLearned: number;
  charactersInContext: number;
  averageScore: number;
  favoriteThemes: string[];
  learningVelocity: number;
  retentionRate: number;
  culturalKnowledge: number;
}

interface ContextualLearningInsight {
  id: string;
  type: 'pattern' | 'recommendation' | 'achievement' | 'cultural';
  title: string;
  description: string;
  theme: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  actionUrl?: string;
  createdAt: string;
}

export const ContextualLearning: React.FC<ContextualLearningProps> = ({
  userId,
  className = ''
}) => {
  const [lessons, setLessons] = useState<ContextualLesson[]>([]);
  const [currentSession, setCurrentSession] = useState<ContextualLearningSession | null>(null);
  const [stats, setStats] = useState<ContextualLearningStats | null>(null);
  const [insights, setInsights] = useState<ContextualLearningInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<'all' | ContextualLesson['theme']>('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | ContextualLesson['level']>('all');
  const [showInsights, setShowInsights] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    estimatedTime: 'all' as 'all' | 'quick' | 'medium' | 'long',
    completed: 'all' as 'all' | 'completed' | 'in-progress' | 'not-started'
  });

  // Mock data - in real app, this would come from contextual learning service
  useEffect(() => {
    const loadContextualLearningData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock lessons
      const mockLessons: ContextualLesson[] = [
        {
          id: 'lesson-1',
          title: 'Ordering Food at a Restaurant',
          description: 'Learn essential vocabulary and characters for ordering food in Japanese restaurants.',
          theme: 'food',
          level: 'beginner',
          estimatedTime: 25,
          vocabulary: [
            {
              id: 'vocab-1',
              word: 'メニュー',
              reading: 'menyuu',
              meaning: 'menu',
              partOfSpeech: 'noun',
              difficulty: 2,
              frequency: 8,
              characters: ['メ', 'ニ', 'ュ', 'ー'],
              context: 'restaurant',
              exampleSentence: 'メニューを見せてください。',
              exampleTranslation: 'Please show me the menu.',
              culturalNotes: 'In Japan, menus are often displayed outside restaurants',
              relatedWords: ['注文', '料理', 'レストラン'],
              tags: ['food', 'restaurant', 'ordering']
            },
            {
              id: 'vocab-2',
              word: '注文',
              reading: 'chuumon',
              meaning: 'order',
              partOfSpeech: 'noun',
              difficulty: 3,
              frequency: 7,
              characters: ['注', '文'],
              context: 'restaurant',
              exampleSentence: '注文をお願いします。',
              exampleTranslation: 'I would like to place an order.',
              relatedWords: ['メニュー', '料理', 'お願い'],
              tags: ['food', 'restaurant', 'ordering']
            }
          ],
          characters: [
            {
              id: 'katakana-メ',
              character: 'メ',
              type: 'katakana',
              readings: ['me'],
              meanings: ['eye'],
              difficulty: 2,
              frequency: 6,
              strokeCount: 2,
              radicals: [],
              similarCharacters: ['katakana-ナ'],
              learningTips: ['Think of it as an eye shape', 'Practice the angle'],
              commonWords: ['メニュー (menu)', 'メール (email)'],
              culturalNotes: ['Used in many loanwords'],
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z'
            }
          ],
          context: 'You are at a Japanese restaurant and need to order food. The waiter brings you a menu and you need to make your selection.',
          learningObjectives: [
            'Learn restaurant vocabulary',
            'Practice ordering food',
            'Understand Japanese dining culture',
            'Master katakana characters used in food terms'
          ],
          culturalContext: 'Japanese restaurants often have different ordering systems than Western restaurants. Understanding the cultural context helps with proper communication.',
          interactiveElements: [
            {
              type: 'dialogue',
              title: 'Restaurant Dialogue',
              description: 'Practice ordering food with a virtual waiter',
              estimatedTime: 10
            },
            {
              type: 'exercise',
              title: 'Menu Reading',
              description: 'Read and understand a Japanese menu',
              estimatedTime: 8
            },
            {
              type: 'quiz',
              title: 'Food Vocabulary Quiz',
              description: 'Test your knowledge of food-related vocabulary',
              estimatedTime: 7
            }
          ],
          progress: {
            completed: false,
            score: 0,
            timeSpent: 0,
            attempts: 0,
            lastAccessed: '2024-01-21T19:30:00Z'
          }
        },
        {
          id: 'lesson-2',
          title: 'Daily Greetings and Introductions',
          description: 'Master essential greetings and self-introduction phrases with proper character usage.',
          theme: 'daily-life',
          level: 'beginner',
          estimatedTime: 20,
          vocabulary: [
            {
              id: 'vocab-3',
              word: 'こんにちは',
              reading: 'konnichiwa',
              meaning: 'hello (good afternoon)',
              partOfSpeech: 'other',
              difficulty: 3,
              frequency: 10,
              characters: ['こ', 'ん', 'に', 'ち', 'は'],
              context: 'greeting',
              exampleSentence: 'こんにちは、元気ですか？',
              exampleTranslation: 'Hello, how are you?',
              culturalNotes: 'Used from around 10 AM to 6 PM',
              relatedWords: ['おはよう', 'こんばんは', 'さようなら'],
              tags: ['greeting', 'daily', 'polite']
            }
          ],
          characters: [
            {
              id: 'hiragana-こ',
              character: 'こ',
              type: 'hiragana',
              readings: ['ko'],
              meanings: ['child', 'small'],
              difficulty: 2,
              frequency: 9,
              strokeCount: 2,
              radicals: [],
              similarCharacters: ['hiragana-に'],
              learningTips: ['Think of it as two people', 'Practice the curves'],
              commonWords: ['こども (child)', 'こんにちは (hello)'],
              culturalNotes: ['Very common in greetings'],
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z'
            }
          ],
          context: 'You are meeting someone for the first time and need to greet them properly in Japanese.',
          learningObjectives: [
            'Learn basic greetings',
            'Practice self-introduction',
            'Understand politeness levels',
            'Master hiragana characters in greetings'
          ],
          culturalContext: 'Japanese greetings are highly contextual and depend on the time of day and relationship between speakers.',
          interactiveElements: [
            {
              type: 'dialogue',
              title: 'Greeting Practice',
              description: 'Practice greetings with different people',
              estimatedTime: 8
            },
            {
              type: 'story',
              title: 'Meeting New People',
              description: 'Follow a story about meeting new people',
              estimatedTime: 12
            }
          ],
          progress: {
            completed: true,
            score: 85,
            timeSpent: 18,
            attempts: 1,
            lastAccessed: '2024-01-20T16:30:00Z'
          }
        }
      ];

      // Mock stats
      const mockStats: ContextualLearningStats = {
        totalLessons: 12,
        completedLessons: 8,
        vocabularyLearned: 156,
        charactersInContext: 89,
        averageScore: 82,
        favoriteThemes: ['food', 'daily-life', 'travel'],
        learningVelocity: 4.2,
        retentionRate: 78,
        culturalKnowledge: 65
      };

      // Mock insights
      const mockInsights: ContextualLearningInsight[] = [
        {
          id: 'insight-1',
          type: 'pattern',
          title: 'Contextual Learning Pattern',
          description: 'You learn vocabulary 40% faster when it\'s presented in real-world contexts like restaurant scenarios.',
          theme: 'food',
          impact: 'high',
          actionable: true,
          actionUrl: '/learn/contextual/food',
          createdAt: '2024-01-21T19:00:00Z'
        },
        {
          id: 'insight-2',
          type: 'cultural',
          title: 'Cultural Understanding',
          description: 'Your cultural knowledge has improved by 15% through contextual lessons. Keep exploring cultural contexts!',
          theme: 'culture',
          impact: 'medium',
          actionable: true,
          actionUrl: '/learn/contextual/culture',
          createdAt: '2024-01-21T18:30:00Z'
        }
      ];

      setLessons(mockLessons);
      setStats(mockStats);
      setInsights(mockInsights);
      setIsLoading(false);
    };

    loadContextualLearningData();
  }, [userId]);

  const filteredLessons = useMemo(() => {
    let filtered = lessons;

    // Filter by theme
    if (selectedTheme !== 'all') {
      filtered = filtered.filter(lesson => lesson.theme === selectedTheme);
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(lesson => lesson.level === selectedLevel);
    }

    // Filter by completion status
    if (filters.completed !== 'all') {
      filtered = filtered.filter(lesson => {
        if (filters.completed === 'completed') return lesson.progress.completed;
        if (filters.completed === 'in-progress') return !lesson.progress.completed && lesson.progress.attempts > 0;
        if (filters.completed === 'not-started') return lesson.progress.attempts === 0;
        return true;
      });
    }

    // Filter by estimated time
    if (filters.estimatedTime !== 'all') {
      const timeMap = { quick: [0, 15], medium: [16, 30], long: [31, 60] };
      const range = timeMap[filters.estimatedTime];
      filtered = filtered.filter(lesson => range[0] <= lesson.estimatedTime && lesson.estimatedTime <= range[1]);
    }

    // Filter by search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(lesson =>
        lesson.title.toLowerCase().includes(query) ||
        lesson.description.toLowerCase().includes(query) ||
        lesson.vocabulary.some(v => v.word.toLowerCase().includes(query) || v.meaning.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [lessons, selectedTheme, selectedLevel, filters]);

  const handleStartLesson = (lesson: ContextualLesson) => {
    const newSession: ContextualLearningSession = {
      id: `session-${Date.now()}`,
      lesson,
      currentStep: 0,
      totalSteps: lesson.interactiveElements.length + 2, // +2 for intro and summary
      sessionType: 'vocabulary',
      startTime: new Date().toISOString(),
      isActive: true,
      progress: {
        vocabularyLearned: 0,
        charactersPracticed: 0,
        exercisesCompleted: 0,
        score: 0
      }
    };

    setCurrentSession(newSession);
  };

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'daily-life': return 'text-blue-600 bg-blue-50';
      case 'food': return 'text-orange-600 bg-orange-50';
      case 'travel': return 'text-green-600 bg-green-50';
      case 'work': return 'text-purple-600 bg-purple-50';
      case 'school': return 'text-indigo-600 bg-indigo-50';
      case 'culture': return 'text-red-600 bg-red-50';
      case 'nature': return 'text-emerald-600 bg-emerald-50';
      case 'technology': return 'text-cyan-600 bg-cyan-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'daily-life': return '🏠';
      case 'food': return '🍜';
      case 'travel': return '✈️';
      case 'work': return '💼';
      case 'school': return '🎓';
      case 'culture': return '🎌';
      case 'nature': return '🌿';
      case 'technology': return '💻';
      default: return '📚';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'recommendation': return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'achievement': return <Star className="w-5 h-5 text-green-500" />;
      case 'cultural': return <Globe className="w-5 h-5 text-purple-500" />;
      default: return <BookOpen className="w-5 h-5 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading contextual learning...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Contextual Learning</h2>
          <p className="body text-gray-600">
            Learn characters and vocabulary through real-world contexts and scenarios
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showInsights
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Lessons</h3>
              <BookOpen className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.completedLessons}/{stats.totalLessons}
            </div>
            <div className="text-sm text-gray-600">
              Lessons completed
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Vocabulary</h3>
              <MessageSquare className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.vocabularyLearned}
            </div>
            <div className="text-sm text-gray-600">
              Words learned in context
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Characters</h3>
              <Target className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.charactersInContext}
            </div>
            <div className="text-sm text-gray-600">
              Characters learned in context
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Cultural Knowledge</h3>
              <Globe className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.culturalKnowledge}%
            </div>
            <div className="text-sm text-gray-600">
              Cultural understanding
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      {showInsights && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Learning Insights</h3>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getThemeColor(insight.theme)}`}>
                      {getThemeIcon(insight.theme)} {insight.theme}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                      {insight.impact} impact
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {new Date(insight.createdAt).toLocaleDateString()}
                    </div>
                    {insight.actionable && insight.actionUrl && (
                      <button className="text-sm text-primary hover:text-primary-dark font-medium">
                        Take Action →
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Theme Selector */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'daily-life', 'food', 'travel', 'work', 'school', 'culture', 'nature', 'technology'] as const).map((theme) => (
          <button
            key={theme}
            onClick={() => setSelectedTheme(theme)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              selectedTheme === theme
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            {theme !== 'all' && <span className="text-lg">{getThemeIcon(theme)}</span>}
            <span className="capitalize">{theme.replace('-', ' ')}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border-base rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search lessons..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as any)}
            className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Time Filter */}
          <select
            value={filters.estimatedTime}
            onChange={(e) => setFilters(prev => ({ ...prev, estimatedTime: e.target.value as any }))}
            className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Times</option>
            <option value="quick">Quick (0-15 min)</option>
            <option value="medium">Medium (16-30 min)</option>
            <option value="long">Long (31+ min)</option>
          </select>

          {/* Completion Filter */}
          <select
            value={filters.completed}
            onChange={(e) => setFilters(prev => ({ ...prev, completed: e.target.value as any }))}
            className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="not-started">Not Started</option>
          </select>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredLessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white border-base rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{getThemeIcon(lesson.theme)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getThemeColor(lesson.theme)}`}>
                        {lesson.theme.replace('-', ' ')}
                      </span>
                    </div>
                    <h3 className="heading text-lg font-semibold text-gray-900 mb-1">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {lesson.description}
                    </p>
                  </div>
                </div>

                {/* Level and Time */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(lesson.level)}`}>
                    {lesson.level}
                  </span>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{lesson.estimatedTime} min</span>
                  </div>
                </div>

                {/* Progress */}
                {lesson.progress.attempts > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{lesson.progress.completed ? 'Completed' : 'In Progress'}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          lesson.progress.completed ? 'bg-green-500' : 'bg-primary'
                        }`}
                        style={{ width: `${lesson.progress.completed ? 100 : (lesson.progress.score / 100) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600">
                      Score: {lesson.progress.score}% • {lesson.progress.attempts} attempts
                    </div>
                  </div>
                )}

                {/* Vocabulary Preview */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Vocabulary</h4>
                  <div className="flex flex-wrap gap-1">
                    {lesson.vocabulary.slice(0, 3).map((vocab) => (
                      <span
                        key={vocab.id}
                        className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium"
                      >
                        {vocab.word}
                      </span>
                    ))}
                    {lesson.vocabulary.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        +{lesson.vocabulary.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Characters Preview */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Characters</h4>
                  <div className="flex flex-wrap gap-1">
                    {lesson.characters.slice(0, 4).map((char) => (
                      <span
                        key={char.id}
                        className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium"
                      >
                        {char.character}
                      </span>
                    ))}
                    {lesson.characters.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        +{lesson.characters.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Interactive Elements */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Activities</h4>
                  <div className="flex flex-wrap gap-1">
                    {lesson.interactiveElements.map((element) => (
                      <span
                        key={element.type}
                        className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium"
                      >
                        {element.type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleStartLesson(lesson)}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                  >
                    {lesson.progress.attempts > 0 ? 'Continue' : 'Start Lesson'}
                  </button>
                  <button className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Active Session */}
      {currentSession && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="heading text-lg font-semibold">{currentSession.lesson.title}</h3>
              <p className="text-sm text-gray-600">
                Step {currentSession.currentStep + 1} of {currentSession.totalSteps}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                <Pause className="w-4 h-4" />
              </button>
              <button className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-3 rounded-full mb-6">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentSession.currentStep + 1) / currentSession.totalSteps) * 100}%` }}
            />
          </div>

          {/* Session Content */}
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="heading text-2xl font-bold text-gray-900">Contextual Learning Session</h3>
            <p className="text-gray-600">
              Learn characters and vocabulary through real-world scenarios
            </p>
            <button
              onClick={() => setCurrentSession(null)}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Start Learning
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredLessons.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="heading text-xl font-semibold text-gray-900 mb-2">No lessons found</h3>
          <p className="body text-gray-600 mb-4">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}
    </div>
  );
};
