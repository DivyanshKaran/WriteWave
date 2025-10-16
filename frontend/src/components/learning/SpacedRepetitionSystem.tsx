"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Target, TrendingUp, Brain, Zap, CheckCircle, XCircle, AlertCircle, BarChart3, Settings, RefreshCw, Play, Pause, SkipForward } from 'lucide-react';
import type { Character } from '@/types/character';

interface SpacedRepetitionSystemProps {
  userId: string;
  className?: string;
}

interface SpacedRepetitionCard {
  id: string;
  character: Character;
  easeFactor: number;
  interval: number; // days
  repetitions: number;
  lastReviewed: string;
  nextReview: string;
  dueDate: string;
  isOverdue: boolean;
  difficulty: 'again' | 'hard' | 'good' | 'easy';
  streak: number;
  totalReviews: number;
  averageScore: number;
  retentionRate: number;
  learningPhase: 'learning' | 'review' | 'mastered';
  algorithm: 'sm-2' | 'fsrs' | 'custom';
  metadata: {
    createdAt: string;
    firstReview: string;
    lastScore: number;
    reviewHistory: Array<{
      date: string;
      score: number;
      difficulty: string;
      timeSpent: number;
    }>;
  };
}

interface SpacedRepetitionSession {
  id: string;
  cards: SpacedRepetitionCard[];
  currentCardIndex: number;
  sessionType: 'new' | 'review' | 'mixed';
  targetCards: number;
  completedCards: number;
  sessionScore: number;
  startTime: string;
  estimatedDuration: number;
  isActive: boolean;
}

interface SpacedRepetitionStats {
  totalCards: number;
  newCards: number;
  reviewCards: number;
  overdueCards: number;
  masteredCards: number;
  averageRetention: number;
  streakDays: number;
  totalReviews: number;
  averageScore: number;
  learningVelocity: number;
  algorithmEfficiency: number;
}

interface SpacedRepetitionSettings {
  algorithm: 'sm-2' | 'fsrs' | 'custom';
  newCardsPerDay: number;
  maxReviewsPerDay: number;
  easyBonus: number;
  hardPenalty: number;
  intervalModifier: number;
  minimumInterval: number;
  maximumInterval: number;
  graduationInterval: number;
  relearningSteps: number[];
  showAnswerTimer: boolean;
  autoAdvance: boolean;
  audioEnabled: boolean;
}

export const SpacedRepetitionSystem: React.FC<SpacedRepetitionSystemProps> = ({
  userId,
  className = ''
}) => {
  const [cards, setCards] = useState<SpacedRepetitionCard[]>([]);
  const [currentSession, setCurrentSession] = useState<SpacedRepetitionSession | null>(null);
  const [stats, setStats] = useState<SpacedRepetitionStats | null>(null);
  const [settings, setSettings] = useState<SpacedRepetitionSettings>({
    algorithm: 'sm-2',
    newCardsPerDay: 20,
    maxReviewsPerDay: 100,
    easyBonus: 1.3,
    hardPenalty: 1.2,
    intervalModifier: 1.0,
    minimumInterval: 1,
    maximumInterval: 365,
    graduationInterval: 1,
    relearningSteps: [10, 60],
    showAnswerTimer: true,
    autoAdvance: false,
    audioEnabled: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [sessionType, setSessionType] = useState<'new' | 'review' | 'mixed'>('mixed');
  const [targetCards, setTargetCards] = useState(20);

  // Mock data - in real app, this would come from spaced repetition service
  useEffect(() => {
    const loadSpacedRepetitionData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock spaced repetition cards
      const mockCards: SpacedRepetitionCard[] = [
        {
          id: 'card-1',
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
          easeFactor: 2.5,
          interval: 1,
          repetitions: 3,
          lastReviewed: '2024-01-20T19:30:00Z',
          nextReview: '2024-01-21T19:30:00Z',
          dueDate: '2024-01-21T19:30:00Z',
          isOverdue: false,
          difficulty: 'good',
          streak: 3,
          totalReviews: 5,
          averageScore: 85,
          retentionRate: 80,
          learningPhase: 'review',
          algorithm: 'sm-2',
          metadata: {
            createdAt: '2024-01-15T10:00:00Z',
            firstReview: '2024-01-15T10:00:00Z',
            lastScore: 85,
            reviewHistory: [
              { date: '2024-01-15T10:00:00Z', score: 70, difficulty: 'hard', timeSpent: 45 },
              { date: '2024-01-16T10:00:00Z', score: 80, difficulty: 'good', timeSpent: 30 },
              { date: '2024-01-18T10:00:00Z', score: 90, difficulty: 'good', timeSpent: 25 },
              { date: '2024-01-20T19:30:00Z', score: 85, difficulty: 'good', timeSpent: 20 }
            ]
          }
        },
        {
          id: 'card-2',
          character: {
            id: 'hiragana-い',
            character: 'い',
            type: 'hiragana',
            readings: ['i'],
            meanings: ['stomach', 'needle'],
            difficulty: 2,
            frequency: 9,
            strokeCount: 2,
            radicals: [],
            similarCharacters: ['hiragana-り'],
            learningTips: ['Think of it as two people standing', 'Focus on the angles'],
            commonWords: ['いえ (house)', 'いぬ (dog)'],
            culturalNotes: ['Simple but important character'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          easeFactor: 2.3,
          interval: 3,
          repetitions: 5,
          lastReviewed: '2024-01-18T18:15:00Z',
          nextReview: '2024-01-21T18:15:00Z',
          dueDate: '2024-01-21T18:15:00Z',
          isOverdue: true,
          difficulty: 'hard',
          streak: 2,
          totalReviews: 8,
          averageScore: 75,
          retentionRate: 70,
          learningPhase: 'review',
          algorithm: 'sm-2',
          metadata: {
            createdAt: '2024-01-10T09:00:00Z',
            firstReview: '2024-01-10T09:00:00Z',
            lastScore: 75,
            reviewHistory: [
              { date: '2024-01-10T09:00:00Z', score: 60, difficulty: 'hard', timeSpent: 60 },
              { date: '2024-01-11T09:00:00Z', score: 70, difficulty: 'hard', timeSpent: 50 },
              { date: '2024-01-13T09:00:00Z', score: 80, difficulty: 'good', timeSpent: 40 },
              { date: '2024-01-16T09:00:00Z', score: 85, difficulty: 'good', timeSpent: 35 },
              { date: '2024-01-18T18:15:00Z', score: 75, difficulty: 'hard', timeSpent: 45 }
            ]
          }
        },
        {
          id: 'card-3',
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
          easeFactor: 2.8,
          interval: 7,
          repetitions: 8,
          lastReviewed: '2024-01-14T16:30:00Z',
          nextReview: '2024-01-21T16:30:00Z',
          dueDate: '2024-01-21T16:30:00Z',
          isOverdue: false,
          difficulty: 'easy',
          streak: 5,
          totalReviews: 12,
          averageScore: 92,
          retentionRate: 95,
          learningPhase: 'mastered',
          algorithm: 'sm-2',
          metadata: {
            createdAt: '2024-01-05T14:00:00Z',
            firstReview: '2024-01-05T14:00:00Z',
            lastScore: 95,
            reviewHistory: [
              { date: '2024-01-05T14:00:00Z', score: 65, difficulty: 'hard', timeSpent: 55 },
              { date: '2024-01-06T14:00:00Z', score: 75, difficulty: 'good', timeSpent: 45 },
              { date: '2024-01-08T14:00:00Z', score: 85, difficulty: 'good', timeSpent: 35 },
              { date: '2024-01-11T14:00:00Z', score: 90, difficulty: 'easy', timeSpent: 30 },
              { date: '2024-01-14T16:30:00Z', score: 95, difficulty: 'easy', timeSpent: 25 }
            ]
          }
        }
      ];

      // Mock stats
      const mockStats: SpacedRepetitionStats = {
        totalCards: 45,
        newCards: 12,
        reviewCards: 28,
        overdueCards: 5,
        masteredCards: 15,
        averageRetention: 82,
        streakDays: 12,
        totalReviews: 156,
        averageScore: 78,
        learningVelocity: 3.2,
        algorithmEfficiency: 89
      };

      setCards(mockCards);
      setStats(mockStats);
      setIsLoading(false);
    };

    loadSpacedRepetitionData();
  }, [userId]);

  const dueCards = useMemo(() => {
    const now = new Date();
    return cards.filter(card => new Date(card.dueDate) <= now);
  }, [cards]);

  const overdueCards = useMemo(() => {
    return cards.filter(card => card.isOverdue);
  }, [cards]);

  const newCards = useMemo(() => {
    return cards.filter(card => card.learningPhase === 'learning' && card.repetitions === 0);
  }, [cards]);

  const masteredCards = useMemo(() => {
    return cards.filter(card => card.learningPhase === 'mastered');
  }, [cards]);

  const handleStartSession = () => {
    const sessionCards = dueCards.slice(0, targetCards);
    const newSession: SpacedRepetitionSession = {
      id: `session-${Date.now()}`,
      cards: sessionCards,
      currentCardIndex: 0,
      sessionType,
      targetCards,
      completedCards: 0,
      sessionScore: 0,
      startTime: new Date().toISOString(),
      estimatedDuration: sessionCards.length * 2, // 2 minutes per card
      isActive: true
    };

    setCurrentSession(newSession);
  };

  const handleAnswerCard = (cardId: string, difficulty: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentSession) return;

    const card = currentSession.cards.find(c => c.id === cardId);
    if (!card) return;

    // Update card based on SM-2 algorithm
    const newEaseFactor = Math.max(1.3, card.easeFactor + (0.1 - (5 - getDifficultyValue(difficulty)) * (0.08 + (5 - getDifficultyValue(difficulty)) * 0.02)));
    const newInterval = difficulty === 'again' ? 1 : Math.round(card.interval * newEaseFactor);
    const newRepetitions = difficulty === 'again' ? 0 : card.repetitions + 1;
    const newDueDate = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000);

    const updatedCard: SpacedRepetitionCard = {
      ...card,
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: newRepetitions,
      lastReviewed: new Date().toISOString(),
      nextReview: newDueDate.toISOString(),
      dueDate: newDueDate.toISOString(),
      difficulty,
      streak: difficulty === 'again' ? 0 : card.streak + 1,
      totalReviews: card.totalReviews + 1,
      averageScore: (card.averageScore * card.totalReviews + getDifficultyValue(difficulty) * 20) / (card.totalReviews + 1),
      retentionRate: calculateRetentionRate(card, difficulty),
      learningPhase: newRepetitions >= 5 ? 'mastered' : card.learningPhase,
      metadata: {
        ...card.metadata,
        lastScore: getDifficultyValue(difficulty) * 20,
        reviewHistory: [
          ...card.metadata.reviewHistory,
          {
            date: new Date().toISOString(),
            score: getDifficultyValue(difficulty) * 20,
            difficulty,
            timeSpent: 30 // Mock time
          }
        ]
      }
    };

    // Update cards
    setCards(prev => prev.map(c => c.id === cardId ? updatedCard : c));

    // Update session
    const newSession: SpacedRepetitionSession = {
      ...currentSession,
      currentCardIndex: currentSession.currentCardIndex + 1,
      completedCards: currentSession.completedCards + 1,
      sessionScore: (currentSession.sessionScore * currentSession.completedCards + getDifficultyValue(difficulty) * 20) / (currentSession.completedCards + 1),
      isActive: currentSession.currentCardIndex + 1 < currentSession.cards.length
    };

    setCurrentSession(newSession);

    // End session if completed
    if (newSession.currentCardIndex >= newSession.cards.length) {
      setCurrentSession(null);
    }
  };

  const getDifficultyValue = (difficulty: string) => {
    switch (difficulty) {
      case 'again': return 1;
      case 'hard': return 2;
      case 'good': return 3;
      case 'easy': return 4;
      default: return 3;
    }
  };

  const calculateRetentionRate = (card: SpacedRepetitionCard, difficulty: string) => {
    const recentReviews = card.metadata.reviewHistory.slice(-5);
    const correctReviews = recentReviews.filter(r => r.difficulty !== 'again').length;
    return (correctReviews / recentReviews.length) * 100;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'again': return 'text-red-600 bg-red-50';
      case 'hard': return 'text-orange-600 bg-orange-50';
      case 'good': return 'text-green-600 bg-green-50';
      case 'easy': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getLearningPhaseColor = (phase: string) => {
    switch (phase) {
      case 'learning': return 'text-yellow-600 bg-yellow-50';
      case 'review': return 'text-blue-600 bg-blue-50';
      case 'mastered': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRetentionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading spaced repetition system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Spaced Repetition</h2>
          <p className="body text-gray-600">
            Optimize your learning with scientifically-backed spaced repetition
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showStats
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showSettings
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Due Today</h3>
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {dueCards.length}
            </div>
            <div className="text-sm text-gray-600">
              Cards ready for review
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Overdue</h3>
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {overdueCards.length}
            </div>
            <div className="text-sm text-gray-600">
              Cards past due date
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Retention</h3>
              <Brain className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.averageRetention}%
            </div>
            <div className="text-sm text-gray-600">
              Average retention rate
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Streak</h3>
              <Zap className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.streakDays}
            </div>
            <div className="text-sm text-gray-600">
              Days of consistent practice
            </div>
          </div>
        </div>
      )}

      {/* Session Controls */}
      {!currentSession && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Start Review Session</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Type
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as any)}
                className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="new">New Cards Only</option>
                <option value="review">Review Cards Only</option>
                <option value="mixed">Mixed (New + Review)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Cards
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={targetCards}
                onChange={(e) => setTargetCards(parseInt(e.target.value))}
                className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleStartSession}
                disabled={dueCards.length === 0}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Session */}
      {currentSession && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="heading text-lg font-semibold">Review Session</h3>
              <p className="text-sm text-gray-600">
                Card {currentSession.currentCardIndex + 1} of {currentSession.cards.length}
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
              style={{ width: `${(currentSession.completedCards / currentSession.cards.length) * 100}%` }}
            />
          </div>

          {/* Current Card */}
          {currentSession.currentCardIndex < currentSession.cards.length && (
            <div className="text-center space-y-6">
              <div className="text-8xl font-bold text-primary mb-4">
                {currentSession.cards[currentSession.currentCardIndex].character.character}
              </div>
              
              <div className="text-lg text-gray-600 mb-6">
                {currentSession.cards[currentSession.currentCardIndex].character.readings.join(', ')}
              </div>

              {/* Answer Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => handleAnswerCard(currentSession.cards[currentSession.currentCardIndex].id, 'again')}
                  className="flex flex-col items-center space-y-2 px-6 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                  <span>Again</span>
                  <span className="text-xs">1 min</span>
                </button>
                
                <button
                  onClick={() => handleAnswerCard(currentSession.cards[currentSession.currentCardIndex].id, 'hard')}
                  className="flex flex-col items-center space-y-2 px-6 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <AlertCircle className="w-6 h-6" />
                  <span>Hard</span>
                  <span className="text-xs">6 min</span>
                </button>
                
                <button
                  onClick={() => handleAnswerCard(currentSession.cards[currentSession.currentCardIndex].id, 'good')}
                  className="flex flex-col items-center space-y-2 px-6 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <CheckCircle className="w-6 h-6" />
                  <span>Good</span>
                  <span className="text-xs">1 day</span>
                </button>
                
                <button
                  onClick={() => handleAnswerCard(currentSession.cards[currentSession.currentCardIndex].id, 'easy')}
                  className="flex flex-col items-center space-y-2 px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Zap className="w-6 h-6" />
                  <span>Easy</span>
                  <span className="text-xs">4 days</span>
                </button>
              </div>
            </div>
          )}

          {/* Session Complete */}
          {currentSession.currentCardIndex >= currentSession.cards.length && (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="heading text-2xl font-bold text-gray-900">Session Complete!</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {currentSession.completedCards}
                  </div>
                  <div className="text-sm text-gray-600">Cards Reviewed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {Math.round(currentSession.sessionScore)}%
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {Math.round((Date.now() - new Date(currentSession.startTime).getTime()) / 60000)}m
                  </div>
                  <div className="text-sm text-gray-600">Time Spent</div>
                </div>
              </div>
              <button
                onClick={() => setCurrentSession(null)}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Start New Session
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cards List */}
      <div className="bg-white border-base rounded-lg p-6 shadow-sm">
        <h3 className="heading text-lg font-semibold mb-4">Your Cards</h3>
        <div className="space-y-4">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center justify-between p-4 border-base rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-primary">
                  {card.character.character}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {card.character.readings.join(', ')} - {card.character.meanings.join(', ')}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLearningPhaseColor(card.learningPhase)}`}>
                      {card.learningPhase}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(card.difficulty)}`}>
                      {card.difficulty}
                    </span>
                    {card.isOverdue && (
                      <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">
                  Next review: {new Date(card.nextReview).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Target className="w-4 h-4" />
                    <span>{card.repetitions} reps</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className={getRetentionColor(card.retentionRate)}>
                      {Math.round(card.retentionRate)}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span>{card.streak} streak</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-base rounded-lg p-6 shadow-sm"
          >
            <h3 className="heading text-lg font-semibold mb-4">Spaced Repetition Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Algorithm
                </label>
                <select
                  value={settings.algorithm}
                  onChange={(e) => setSettings(prev => ({ ...prev, algorithm: e.target.value as any }))}
                  className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="sm-2">SM-2 (SuperMemo 2)</option>
                  <option value="fsrs">FSRS (Free Spaced Repetition Scheduler)</option>
                  <option value="custom">Custom Algorithm</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Cards Per Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.newCardsPerDay}
                  onChange={(e) => setSettings(prev => ({ ...prev, newCardsPerDay: parseInt(e.target.value) }))}
                  className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Reviews Per Day
                </label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={settings.maxReviewsPerDay}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxReviewsPerDay: parseInt(e.target.value) }))}
                  className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Easy Bonus
                </label>
                <input
                  type="number"
                  min="1.0"
                  max="2.0"
                  step="0.1"
                  value={settings.easyBonus}
                  onChange={(e) => setSettings(prev => ({ ...prev, easyBonus: parseFloat(e.target.value) }))}
                  className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.showAnswerTimer}
                  onChange={(e) => setSettings(prev => ({ ...prev, showAnswerTimer: e.target.checked }))}
                  className="w-4 h-4 text-primary border-base rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Show answer timer</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.autoAdvance}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoAdvance: e.target.checked }))}
                  className="w-4 h-4 text-primary border-base rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Auto-advance to next card</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.audioEnabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, audioEnabled: e.target.checked }))}
                  className="w-4 h-4 text-primary border-base rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Enable audio pronunciation</span>
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end">
              <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                Save Settings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Panel */}
      <AnimatePresence>
        {showStats && stats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-base rounded-lg p-6 shadow-sm"
          >
            <h3 className="heading text-lg font-semibold mb-4">Detailed Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Card Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">New Cards</span>
                    <span className="text-sm font-medium">{stats.newCards}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Review Cards</span>
                    <span className="text-sm font-medium">{stats.reviewCards}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Mastered Cards</span>
                    <span className="text-sm font-medium">{stats.masteredCards}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Overdue Cards</span>
                    <span className="text-sm font-medium">{stats.overdueCards}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Reviews</span>
                    <span className="text-sm font-medium">{stats.totalReviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Score</span>
                    <span className="text-sm font-medium">{stats.averageScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Learning Velocity</span>
                    <span className="text-sm font-medium">{stats.learningVelocity} cards/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Algorithm Efficiency</span>
                    <span className="text-sm font-medium">{stats.algorithmEfficiency}%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
