"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Target, TrendingUp, Clock, Star, Zap, BookOpen, Lightbulb, ArrowRight, CheckCircle, XCircle, RefreshCw, Filter, Search, Settings } from 'lucide-react';
import type { Character } from '@/types/character';

interface PersonalizedRecommendationsProps {
  userId: string;
  className?: string;
}

interface CharacterRecommendation {
  id: string;
  character: Character;
  score: number;
  reasons: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number; // minutes
  difficulty: number;
  category: 'next-logical' | 'review-needed' | 'skill-building' | 'challenge' | 'foundation';
  tags: string[];
  prerequisites: string[];
  benefits: string[];
  learningPath: string[];
}

interface UserLearningProfile {
  strengths: string[];
  weaknesses: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  preferredPace: 'slow' | 'moderate' | 'fast';
  focusAreas: string[];
  goals: string[];
  timeAvailable: number; // minutes per session
  sessionFrequency: 'daily' | 'weekly' | 'flexible';
  motivationLevel: 'low' | 'medium' | 'high';
  currentLevel: number;
  targetLevel: number;
  learningHistory: Array<{
    characterId: string;
    attempts: number;
    accuracy: number;
    timeSpent: number;
    lastPracticed: string;
    mastery: number;
  }>;
}

interface RecommendationEngine {
  algorithm: 'collaborative' | 'content-based' | 'hybrid';
  factors: {
    performance: number;
    learningStyle: number;
    goals: number;
    difficulty: number;
    frequency: number;
    social: number;
  };
  confidence: number;
  lastUpdated: string;
}

interface LearningInsight {
  id: string;
  type: 'pattern' | 'recommendation' | 'warning' | 'achievement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  actionUrl?: string;
  createdAt: string;
}

export const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  userId,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState<CharacterRecommendation[]>([]);
  const [userProfile, setUserProfile] = useState<UserLearningProfile | null>(null);
  const [recommendationEngine, setRecommendationEngine] = useState<RecommendationEngine | null>(null);
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | CharacterRecommendation['category']>('all');
  const [showEngineDetails, setShowEngineDetails] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [filters, setFilters] = useState({
    priority: 'all' as 'all' | CharacterRecommendation['priority'],
    difficulty: 'all' as 'all' | 'easy' | 'medium' | 'hard',
    estimatedTime: 'all' as 'all' | 'quick' | 'medium' | 'long',
    search: ''
  });

  // Mock data - in real app, this would come from AI recommendation service
  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock user profile
      const mockUserProfile: UserLearningProfile = {
        strengths: ['Visual Learning', 'Consistency', 'Stroke Order'],
        weaknesses: ['Speed', 'Complex Characters', 'Memory Retention'],
        learningStyle: 'visual',
        preferredPace: 'moderate',
        focusAreas: ['Hiragana', 'Basic Kanji', 'Stroke Order'],
        goals: ['JLPT N5', 'Basic Communication', 'Reading Practice'],
        timeAvailable: 30,
        sessionFrequency: 'daily',
        motivationLevel: 'high',
        currentLevel: 3,
        targetLevel: 5,
        learningHistory: [
          {
            characterId: 'hiragana-あ',
            attempts: 15,
            accuracy: 85,
            timeSpent: 45,
            lastPracticed: '2024-01-21T19:30:00Z',
            mastery: 0.8
          },
          {
            characterId: 'hiragana-い',
            attempts: 12,
            accuracy: 78,
            timeSpent: 38,
            lastPracticed: '2024-01-20T18:15:00Z',
            mastery: 0.7
          }
        ]
      };

      // Mock recommendations
      const mockRecommendations: CharacterRecommendation[] = [
        {
          id: 'rec-1',
          character: {
            id: 'hiragana-う',
            character: 'う',
            type: 'hiragana',
            readings: ['u'],
            meanings: ['cry', 'weep'],
            difficulty: 2,
            frequency: 8,
            strokeCount: 2,
            radicals: [],
            similarCharacters: ['hiragana-あ', 'hiragana-い'],
            learningTips: ['Think of it as a person with arms up', 'Practice the curve'],
            commonWords: ['うた (song)', 'うみ (sea)'],
            culturalNotes: ['Used in many common words'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          score: 95,
          reasons: [
            'Natural progression from あ and い',
            'Matches your visual learning style',
            'Builds on your stroke order strengths',
            'Common character in basic vocabulary'
          ],
          priority: 'high',
          estimatedTime: 15,
          difficulty: 2,
          category: 'next-logical',
          tags: ['hiragana', 'basic', 'progression'],
          prerequisites: ['hiragana-あ', 'hiragana-い'],
          benefits: [
            'Completes basic vowel set',
            'Improves stroke consistency',
            'Builds confidence for harder characters'
          ],
          learningPath: ['hiragana-あ', 'hiragana-い', 'hiragana-う', 'hiragana-え', 'hiragana-お']
        },
        {
          id: 'rec-2',
          character: {
            id: 'hiragana-か',
            character: 'か',
            type: 'hiragana',
            readings: ['ka'],
            meanings: ['mosquito', 'or'],
            difficulty: 3,
            frequency: 9,
            strokeCount: 3,
            radicals: [],
            similarCharacters: ['hiragana-が'],
            learningTips: ['Think of it as a person with a hat', 'Focus on the angle'],
            commonWords: ['かわ (river)', 'かみ (paper)'],
            culturalNotes: ['Very common in Japanese'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          score: 88,
          reasons: [
            'High frequency character',
            'Good for building vocabulary',
            'Challenges your speed improvement goal',
            'Foundation for consonant-vowel combinations'
          ],
          priority: 'high',
          estimatedTime: 20,
          difficulty: 3,
          category: 'foundation',
          tags: ['hiragana', 'consonant', 'vocabulary'],
          prerequisites: ['hiragana-あ', 'hiragana-い', 'hiragana-う'],
          benefits: [
            'Essential for reading practice',
            'Opens up many new words',
            'Improves character recognition speed'
          ],
          learningPath: ['hiragana-あ', 'hiragana-い', 'hiragana-う', 'hiragana-か', 'hiragana-き']
        },
        {
          id: 'rec-3',
          character: {
            id: 'hiragana-あ',
            character: 'あ',
            type: 'hiragana',
            readings: ['a'],
            meanings: ['ah', 'oh'],
            difficulty: 1,
            frequency: 10,
            strokeCount: 3,
            radicals: [],
            similarCharacters: ['hiragana-お'],
            learningTips: ['Think of it as a person with arms up', 'Practice the curve'],
            commonWords: ['あめ (rain)', 'あさ (morning)'],
            culturalNotes: ['First character many learn'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          score: 75,
          reasons: [
            'Review needed - accuracy declining',
            'Foundation character for other learning',
            'Quick practice session',
            'Builds confidence'
          ],
          priority: 'medium',
          estimatedTime: 10,
          difficulty: 1,
          category: 'review-needed',
          tags: ['hiragana', 'review', 'foundation'],
          prerequisites: [],
          benefits: [
            'Reinforces basic skills',
            'Improves accuracy',
            'Quick confidence boost'
          ],
          learningPath: ['hiragana-あ', 'hiragana-い', 'hiragana-う']
        }
      ];

      // Mock recommendation engine
      const mockEngine: RecommendationEngine = {
        algorithm: 'hybrid',
        factors: {
          performance: 0.35,
          learningStyle: 0.25,
          goals: 0.20,
          difficulty: 0.15,
          frequency: 0.03,
          social: 0.02
        },
        confidence: 87,
        lastUpdated: '2024-01-21T19:30:00Z'
      };

      // Mock insights
      const mockInsights: LearningInsight[] = [
        {
          id: 'insight-1',
          type: 'pattern',
          title: 'Learning Pattern Detected',
          description: 'You perform best with visual characters and struggle with complex stroke patterns. Focus on building stroke order skills.',
          impact: 'high',
          actionable: true,
          actionUrl: '/learn/stroke-order',
          createdAt: '2024-01-21T19:00:00Z'
        },
        {
          id: 'insight-2',
          type: 'recommendation',
          title: 'Optimal Learning Time',
          description: 'Your performance is 23% better in morning sessions. Consider scheduling practice for 9-11 AM.',
          impact: 'medium',
          actionable: true,
          actionUrl: '/settings/schedule',
          createdAt: '2024-01-21T18:30:00Z'
        },
        {
          id: 'insight-3',
          type: 'achievement',
          title: 'Consistency Milestone',
          description: 'You\'ve maintained 12 days of consistent practice! This is your longest streak yet.',
          impact: 'high',
          actionable: false,
          createdAt: '2024-01-21T17:45:00Z'
        }
      ];

      setUserProfile(mockUserProfile);
      setRecommendations(mockRecommendations);
      setRecommendationEngine(mockEngine);
      setInsights(mockInsights);
      setIsLoading(false);
    };

    loadRecommendations();
  }, [userId]);

  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(rec => rec.category === selectedCategory);
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      filtered = filtered.filter(rec => rec.priority === filters.priority);
    }

    // Filter by difficulty
    if (filters.difficulty !== 'all') {
      const difficultyMap = { easy: [1, 2], medium: [3, 4], hard: [5] };
      const range = difficultyMap[filters.difficulty];
      filtered = filtered.filter(rec => range.includes(rec.difficulty));
    }

    // Filter by estimated time
    if (filters.estimatedTime !== 'all') {
      const timeMap = { quick: [0, 15], medium: [16, 30], long: [31, 60] };
      const range = timeMap[filters.estimatedTime];
      filtered = filtered.filter(rec => range[0] <= rec.estimatedTime && rec.estimatedTime <= range[1]);
    }

    // Filter by search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(rec =>
        rec.character.character.toLowerCase().includes(query) ||
        rec.character.readings.some(r => r.toLowerCase().includes(query)) ||
        rec.character.meanings.some(m => m.toLowerCase().includes(query)) ||
        rec.reasons.some(r => r.toLowerCase().includes(query))
      );
    }

    // Sort by score
    filtered.sort((a, b) => b.score - a.score);

    return filtered;
  }, [recommendations, selectedCategory, filters]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'next-logical': return 'text-blue-600 bg-blue-50';
      case 'review-needed': return 'text-orange-600 bg-orange-50';
      case 'skill-building': return 'text-purple-600 bg-purple-50';
      case 'challenge': return 'text-red-600 bg-red-50';
      case 'foundation': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'next-logical': return <ArrowRight className="w-4 h-4" />;
      case 'review-needed': return <RefreshCw className="w-4 h-4" />;
      case 'skill-building': return <Target className="w-4 h-4" />;
      case 'challenge': return <Zap className="w-4 h-4" />;
      case 'foundation': return <BookOpen className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <Brain className="w-5 h-5 text-blue-500" />;
      case 'recommendation': return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'warning': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'achievement': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Star className="w-5 h-5 text-gray-500" />;
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
          <p className="text-gray-600">Analyzing your learning patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Personalized Recommendations</h2>
          <p className="body text-gray-600">
            AI-powered character recommendations based on your learning profile
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowEngineDetails(!showEngineDetails)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showEngineDetails
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowInsights(!showInsights)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showInsights
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            <Brain className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User Profile Summary */}
      {userProfile && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Your Learning Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Strengths</h4>
              <div className="space-y-1">
                {userProfile.strengths.map((strength) => (
                  <div key={strength} className="flex items-center space-x-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{strength}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Focus Areas</h4>
              <div className="space-y-1">
                {userProfile.focusAreas.map((area) => (
                  <div key={area} className="flex items-center space-x-2 text-sm text-gray-700">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span>{area}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Goals</h4>
              <div className="space-y-1">
                {userProfile.goals.map((goal) => (
                  <div key={goal} className="flex items-center space-x-2 text-sm text-gray-700">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{goal}</span>
                  </div>
                ))}
              </div>
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

      {/* Recommendation Engine Details */}
      {showEngineDetails && recommendationEngine && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Recommendation Engine</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Algorithm Factors</h4>
              <div className="space-y-3">
                {Object.entries(recommendationEngine.factors).map(([factor, weight]) => (
                  <div key={factor}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{factor.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span>{Math.round(weight * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${weight * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Engine Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Algorithm</span>
                  <span className="text-sm font-medium capitalize">{recommendationEngine.algorithm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Confidence</span>
                  <span className="text-sm font-medium">{recommendationEngine.confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium">
                    {new Date(recommendationEngine.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Selector */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'next-logical', 'review-needed', 'skill-building', 'challenge', 'foundation'] as const).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            {category !== 'all' && getCategoryIcon(category)}
            <span className="capitalize">{category.replace('-', ' ')}</span>
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
              placeholder="Search recommendations..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as any }))}
            className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value as any }))}
            className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy (1-2)</option>
            <option value="medium">Medium (3-4)</option>
            <option value="hard">Hard (5)</option>
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
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredRecommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white border-base rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {recommendation.character.character}
                    </div>
                    <div className="text-sm text-gray-600">
                      {recommendation.character.readings.join(', ')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {recommendation.character.meanings.join(', ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {recommendation.score}
                    </div>
                    <div className="text-xs text-gray-600">Score</div>
                  </div>
                </div>

                {/* Category and Priority */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(recommendation.category)}`}>
                      {getCategoryIcon(recommendation.category)}
                      <span className="ml-1 capitalize">{recommendation.category.replace('-', ' ')}</span>
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                    {recommendation.priority} priority
                  </span>
                </div>

                {/* Reasons */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Why this character?</h4>
                  <div className="space-y-1">
                    {recommendation.reasons.slice(0, 2).map((reason, i) => (
                      <div key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                        <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">Difficulty</div>
                    <div className="text-gray-600">{recommendation.difficulty}/5</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">Time</div>
                    <div className="text-gray-600">{recommendation.estimatedTime} min</div>
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                  <div className="flex flex-wrap gap-1">
                    {recommendation.benefits.slice(0, 2).map((benefit, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium">
                    Start Learning
                  </button>
                  <button className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🧠</div>
          <h3 className="heading text-xl font-semibold text-gray-900 mb-2">No recommendations found</h3>
          <p className="body text-gray-600 mb-4">
            Try adjusting your filters or complete more characters to get personalized recommendations
          </p>
        </div>
      )}
    </div>
  );
};
