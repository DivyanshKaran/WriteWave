"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Target, Trophy, Star, Play, Pause, SkipForward, RotateCcw, Settings, BarChart3, TrendingUp, Award, Flame, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { Character } from '@/types/character';

interface SpeedWritingChallengesProps {
  userId: string;
  className?: string;
}

interface SpeedChallenge {
  id: string;
  title: string;
  description: string;
  type: 'timed' | 'race' | 'endurance' | 'accuracy' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  duration: number; // seconds
  characters: Character[];
  targetScore: number;
  timeLimit: number; // seconds
  accuracyRequirement: number; // percentage
  rewards: {
    xp: number;
    achievements: string[];
    badges: string[];
    leaderboardPoints: number;
  };
  rules: string[];
  tips: string[];
  isCompleted: boolean;
  bestScore: number;
  bestTime: number;
  attempts: number;
  averageScore: number;
  completionRate: number;
}

interface SpeedWritingSession {
  id: string;
  challenge: SpeedChallenge;
  startTime: string;
  endTime?: string;
  isActive: boolean;
  currentCharacterIndex: number;
  charactersCompleted: number;
  totalCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
  timeSpent: number;
  currentScore: number;
  accuracy: number;
  speed: number; // characters per minute
  streak: number;
  maxStreak: number;
  mistakes: Array<{
    character: string;
    expected: string;
    actual: string;
    timestamp: string;
  }>;
}

interface SpeedWritingStats {
  totalChallenges: number;
  completedChallenges: number;
  averageSpeed: number;
  averageAccuracy: number;
  bestSpeed: number;
  bestAccuracy: number;
  totalCharactersWritten: number;
  totalTimeSpent: number;
  streakRecord: number;
  currentStreak: number;
  rank: number;
  percentile: number;
  improvements: {
    speed: number;
    accuracy: number;
    consistency: number;
  };
}

interface SpeedWritingLeaderboard {
  id: string;
  challengeId: string;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  score: number;
  time: number;
  accuracy: number;
  speed: number;
  rank: number;
  timestamp: string;
}

export const SpeedWritingChallenges: React.FC<SpeedWritingChallengesProps> = ({
  userId,
  className = ''
}) => {
  const [challenges, setChallenges] = useState<SpeedChallenge[]>([]);
  const [currentSession, setCurrentSession] = useState<SpeedWritingSession | null>(null);
  const [stats, setStats] = useState<SpeedWritingStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<SpeedWritingLeaderboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<SpeedChallenge | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | SpeedChallenge['type'],
    difficulty: 'all' as 'all' | SpeedChallenge['difficulty'],
    completed: 'all' as 'all' | 'completed' | 'not-completed',
    search: ''
  });

  // Mock data - in real app, this would come from speed writing service
  useEffect(() => {
    const loadSpeedWritingData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock challenges
      const mockChallenges: SpeedChallenge[] = [
        {
          id: 'challenge-1',
          title: 'Hiragana Speed Test',
          description: 'Write as many Hiragana characters as possible in 2 minutes with 80% accuracy.',
          type: 'timed',
          difficulty: 'easy',
          duration: 120,
          characters: [
            {
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
            }
          ],
          targetScore: 50,
          timeLimit: 120,
          accuracyRequirement: 80,
          rewards: {
            xp: 200,
            achievements: ['Speed Writer', 'Hiragana Master'],
            badges: ['Speed Badge', 'Accuracy Badge'],
            leaderboardPoints: 100
          },
          rules: [
            'Write characters as quickly as possible',
            'Maintain at least 80% accuracy',
            'No external help allowed',
            'Complete within time limit'
          ],
          tips: [
            'Focus on accuracy over speed initially',
            'Use proper stroke order',
            'Practice common characters first',
            'Stay calm under pressure'
          ],
          isCompleted: true,
          bestScore: 45,
          bestTime: 110,
          attempts: 3,
          averageScore: 42,
          completionRate: 85
        },
        {
          id: 'challenge-2',
          title: 'Katakana Race',
          description: 'Race against other players to write Katakana characters accurately.',
          type: 'race',
          difficulty: 'medium',
          duration: 180,
          characters: [],
          targetScore: 75,
          timeLimit: 180,
          accuracyRequirement: 85,
          rewards: {
            xp: 300,
            achievements: ['Katakana Racer', 'Speed Demon'],
            badges: ['Race Winner', 'Katakana Expert'],
            leaderboardPoints: 150
          },
          rules: [
            'Compete against other players',
            'Write characters in correct order',
            'Maintain 85% accuracy',
            'Fastest accurate writer wins'
          ],
          tips: [
            'Practice Katakana stroke patterns',
            'Focus on character recognition',
            'Use consistent writing style',
            'Don\'t rush - accuracy matters'
          ],
          isCompleted: false,
          bestScore: 0,
          bestTime: 0,
          attempts: 0,
          averageScore: 0,
          completionRate: 0
        },
        {
          id: 'challenge-3',
          title: 'Kanji Endurance',
          description: 'Write Kanji characters for 5 minutes straight with high accuracy.',
          type: 'endurance',
          difficulty: 'hard',
          duration: 300,
          characters: [],
          targetScore: 100,
          timeLimit: 300,
          accuracyRequirement: 90,
          rewards: {
            xp: 500,
            achievements: ['Kanji Endurance', 'Marathon Writer'],
            badges: ['Endurance Badge', 'Kanji Master'],
            leaderboardPoints: 200
          },
          rules: [
            'Write for full 5 minutes',
            'Maintain 90% accuracy',
            'No breaks allowed',
            'Focus on consistency'
          ],
          tips: [
            'Pace yourself for 5 minutes',
            'Focus on stroke order',
            'Take deep breaths',
            'Practice complex characters beforehand'
          ],
          isCompleted: false,
          bestScore: 0,
          bestTime: 0,
          attempts: 0,
          averageScore: 0,
          completionRate: 0
        }
      ];

      // Mock stats
      const mockStats: SpeedWritingStats = {
        totalChallenges: 12,
        completedChallenges: 8,
        averageSpeed: 45,
        averageAccuracy: 82,
        bestSpeed: 67,
        bestAccuracy: 95,
        totalCharactersWritten: 1247,
        totalTimeSpent: 1800,
        streakRecord: 23,
        currentStreak: 5,
        rank: 12,
        percentile: 78,
        improvements: {
          speed: 15,
          accuracy: 8,
          consistency: 12
        }
      };

      // Mock leaderboard
      const mockLeaderboard: SpeedWritingLeaderboard[] = [
        {
          id: 'lb-1',
          challengeId: 'challenge-1',
          userId: 'user-1',
          username: 'SpeedDemon',
          displayName: 'Speed Demon',
          avatar: '💨',
          score: 67,
          time: 95,
          accuracy: 94,
          speed: 42,
          rank: 1,
          timestamp: '2024-01-21T19:30:00Z'
        },
        {
          id: 'lb-2',
          challengeId: 'challenge-1',
          userId: userId,
          username: 'WriteWaveUser',
          displayName: 'WriteWave User',
          avatar: '🚀',
          score: 45,
          time: 110,
          accuracy: 82,
          speed: 25,
          rank: 2,
          timestamp: '2024-01-21T18:45:00Z'
        }
      ];

      setChallenges(mockChallenges);
      setStats(mockStats);
      setLeaderboard(mockLeaderboard);
      setIsLoading(false);
    };

    loadSpeedWritingData();
  }, [userId]);

  const filteredChallenges = useMemo(() => {
    let filtered = challenges;

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(challenge => challenge.type === filters.type);
    }

    // Filter by difficulty
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(challenge => challenge.difficulty === filters.difficulty);
    }

    // Filter by completion
    if (filters.completed !== 'all') {
      filtered = filtered.filter(challenge => 
        filters.completed === 'completed' ? challenge.isCompleted : !challenge.isCompleted
      );
    }

    // Filter by search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(query) ||
        challenge.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [challenges, filters]);

  const handleStartChallenge = (challenge: SpeedChallenge) => {
    const newSession: SpeedWritingSession = {
      id: `session-${Date.now()}`,
      challenge,
      startTime: new Date().toISOString(),
      isActive: true,
      currentCharacterIndex: 0,
      charactersCompleted: 0,
      totalCharacters: challenge.characters.length,
      correctCharacters: 0,
      incorrectCharacters: 0,
      timeSpent: 0,
      currentScore: 0,
      accuracy: 0,
      speed: 0,
      streak: 0,
      maxStreak: 0,
      mistakes: []
    };

    setCurrentSession(newSession);
  };

  const handleEndSession = () => {
    if (!currentSession) return;

    const finalSession: SpeedWritingSession = {
      ...currentSession,
      endTime: new Date().toISOString(),
      isActive: false
    };

    setCurrentSession(null);
    
    // Update challenge stats
    setChallenges(prev => prev.map(challenge =>
      challenge.id === currentSession.challenge.id
        ? {
            ...challenge,
            isCompleted: true,
            bestScore: Math.max(challenge.bestScore, currentSession.currentScore),
            bestTime: Math.min(challenge.bestTime || Infinity, currentSession.timeSpent),
            attempts: challenge.attempts + 1,
            averageScore: (challenge.averageScore * challenge.attempts + currentSession.currentScore) / (challenge.attempts + 1)
          }
        : challenge
    ));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'timed': return 'text-blue-600 bg-blue-50';
      case 'race': return 'text-red-600 bg-red-50';
      case 'endurance': return 'text-purple-600 bg-purple-50';
      case 'accuracy': return 'text-green-600 bg-green-50';
      case 'mixed': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-orange-600 bg-orange-50';
      case 'expert': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'timed': return <Clock className="w-4 h-4" />;
      case 'race': return <Zap className="w-4 h-4" />;
      case 'endurance': return <Flame className="w-4 h-4" />;
      case 'accuracy': return <Target className="w-4 h-4" />;
      case 'mixed': return <Trophy className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading speed writing challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Speed Writing Challenges</h2>
          <p className="body text-gray-600">
            Test your speed and accuracy with timed writing challenges
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
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showLeaderboard
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            <Trophy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Best Speed</h3>
              <Zap className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.bestSpeed}
            </div>
            <div className="text-sm text-gray-600">
              Characters per minute
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Best Accuracy</h3>
              <Target className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.bestAccuracy}%
            </div>
            <div className="text-sm text-gray-600">
              Highest accuracy achieved
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Current Streak</h3>
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.currentStreak}
            </div>
            <div className="text-sm text-gray-600">
              Consecutive challenges
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Rank</h3>
              <Trophy className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              #{stats.rank}
            </div>
            <div className="text-sm text-gray-600">
              Top {stats.percentile}% of players
            </div>
          </div>
        </div>
      )}

      {/* Active Session */}
      {currentSession && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="heading text-lg font-semibold">{currentSession.challenge.title}</h3>
              <p className="text-sm text-gray-600">
                Character {currentSession.currentCharacterIndex + 1} of {currentSession.totalCharacters}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                <Pause className="w-4 h-4" />
              </button>
              <button
                onClick={handleEndSession}
                className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-3 rounded-full mb-6">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${(currentSession.charactersCompleted / currentSession.totalCharacters) * 100}%` }}
            />
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {currentSession.currentScore}
              </div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {Math.round(currentSession.accuracy)}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {Math.round(currentSession.speed)}
              </div>
              <div className="text-sm text-gray-600">Speed (CPM)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {currentSession.streak}
              </div>
              <div className="text-sm text-gray-600">Streak</div>
            </div>
          </div>

          {/* Current Character */}
          <div className="text-center space-y-6">
            <div className="text-8xl font-bold text-primary mb-4">
              {currentSession.challenge.characters[currentSession.currentCharacterIndex]?.character || 'あ'}
            </div>
            
            <div className="text-lg text-gray-600 mb-6">
              {currentSession.challenge.characters[currentSession.currentCharacterIndex]?.readings.join(', ') || 'a'}
            </div>

            {/* Writing Area */}
            <div className="bg-gray-50 rounded-lg p-8 mb-6">
              <div className="text-center text-gray-500">
                Draw the character here
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-4">
              <button className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <CheckCircle className="w-4 h-4" />
                <span>Correct</span>
              </button>
              <button className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                <XCircle className="w-4 h-4" />
                <span>Incorrect</span>
              </button>
              <button className="flex items-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                <RotateCcw className="w-4 h-4" />
                <span>Skip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border-base rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
            className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="timed">Timed</option>
            <option value="race">Race</option>
            <option value="endurance">Endurance</option>
            <option value="accuracy">Accuracy</option>
            <option value="mixed">Mixed</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value as any }))}
            className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>

          {/* Completion Filter */}
          <select
            value={filters.completed}
            onChange={(e) => setFilters(prev => ({ ...prev, completed: e.target.value as any }))}
            className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="not-completed">Not Completed</option>
          </select>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
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
                      {getTypeIcon(challenge.type)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(challenge.type)}`}>
                        {challenge.type}
                      </span>
                    </div>
                    <h3 className="heading text-lg font-semibold text-gray-900 mb-1">
                      {challenge.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {challenge.description}
                    </p>
                  </div>
                </div>

                {/* Difficulty and Time */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{Math.round(challenge.duration / 60)} min</span>
                  </div>
                </div>

                {/* Requirements */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Target Score:</span>
                      <span className="font-medium">{challenge.targetScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accuracy:</span>
                      <span className="font-medium">{challenge.accuracyRequirement}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Limit:</span>
                      <span className="font-medium">{Math.round(challenge.timeLimit / 60)} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Characters:</span>
                      <span className="font-medium">{challenge.characters.length}</span>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                {challenge.attempts > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Best Score</span>
                      <span>{challenge.bestScore}/{challenge.targetScore}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((challenge.bestScore / challenge.targetScore) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600">
                      {challenge.attempts} attempts • {Math.round(challenge.averageScore)} avg
                    </div>
                  </div>
                )}

                {/* Rewards */}
                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">Rewards</span>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-600">
                        {challenge.rewards.xp} XP
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {challenge.rewards.achievements.slice(0, 2).map((achievement, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-medium"
                      >
                        {achievement}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleStartChallenge(challenge)}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                  >
                    {challenge.isCompleted ? 'Retry Challenge' : 'Start Challenge'}
                  </button>
                  <button className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium">
                    <Trophy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Leaderboard */}
      {showLeaderboard && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Speed Writing Leaderboard</h3>
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center justify-between p-4 border-base rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{entry.avatar}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{entry.displayName}</h4>
                    <p className="text-sm text-gray-600">@{entry.username}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {entry.score}
                  </div>
                  <div className="text-sm text-gray-600">
                    {entry.speed} CPM • {entry.accuracy}% accuracy
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Stats */}
      {showStats && stats && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Detailed Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Characters Written</span>
                  <span className="text-sm font-medium">{stats.totalCharactersWritten}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Time Spent</span>
                  <span className="text-sm font-medium">{Math.round(stats.totalTimeSpent / 60)} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Speed</span>
                  <span className="text-sm font-medium">{stats.averageSpeed} CPM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Accuracy</span>
                  <span className="text-sm font-medium">{stats.averageAccuracy}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Improvements</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Speed Improvement</span>
                  <span className="text-sm font-medium text-green-600">+{stats.improvements.speed}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Accuracy Improvement</span>
                  <span className="text-sm font-medium text-green-600">+{stats.improvements.accuracy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Consistency Improvement</span>
                  <span className="text-sm font-medium text-green-600">+{stats.improvements.consistency}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Streak Record</span>
                  <span className="text-sm font-medium">{stats.streakRecord}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredChallenges.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚡</div>
          <h3 className="heading text-xl font-semibold text-gray-900 mb-2">No challenges found</h3>
          <p className="body text-gray-600 mb-4">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}
    </div>
  );
};
