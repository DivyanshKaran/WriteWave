"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Users, Clock, Star, Zap, Flame, Award, Calendar, TrendingUp, CheckCircle, Plus, Filter, Search, Crown, Gem, Sparkles } from 'lucide-react';

interface GroupChallengesProps {
  userId: string;
  className?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: 'hiragana' | 'katakana' | 'kanji' | 'mixed' | 'streak' | 'accuracy' | 'speed';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  status: 'upcoming' | 'active' | 'completed' | 'expired';
  startDate: string;
  endDate: string;
  duration: number; // days
  participants: number;
  maxParticipants?: number;
  rewards: {
    xp: number;
    achievements: string[];
    badges: string[];
    specialRewards?: string[];
  };
  requirements: {
    minLevel?: number;
    maxLevel?: number;
    characterTypes?: string[];
    prerequisites?: string[];
  };
  progress: {
    current: number;
    target: number;
    unit: string;
    percentage: number;
  };
  leaderboard: Array<{
    userId: string;
    username: string;
    displayName: string;
    avatar: string;
    score: number;
    rank: number;
    progress: number;
  }>;
  myRank?: number;
  myScore?: number;
  myProgress?: number;
  rules: string[];
  tips: string[];
  createdBy: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  isJoined: boolean;
  canJoin: boolean;
  joinDeadline?: string;
}

interface ChallengeStats {
  totalChallenges: number;
  completedChallenges: number;
  activeChallenges: number;
  totalXP: number;
  achievements: number;
  badges: number;
  bestRank: number;
  averageRank: number;
  winRate: number;
}

export const GroupChallenges: React.FC<GroupChallengesProps> = ({
  userId,
  className = ''
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showChallengeDetails, setShowChallengeDetails] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | Challenge['type'],
    category: 'all' as 'all' | Challenge['category'],
    difficulty: 'all' as 'all' | Challenge['difficulty'],
    status: 'all' as 'all' | Challenge['status'],
    search: ''
  });
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'ending-soon' | 'difficulty'>('recent');
  const [viewMode, setViewMode] = useState<'all' | 'joined' | 'available' | 'stats'>('all');

  // Mock data - in real app, this would come from community service
  useEffect(() => {
    const loadChallenges = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock challenges
      const mockChallenges: Challenge[] = [
        {
          id: 'challenge-1',
          title: 'Hiragana Mastery Week',
          description: 'Master 20 new Hiragana characters in 7 days. Perfect for beginners looking to build a solid foundation!',
          type: 'weekly',
          category: 'hiragana',
          difficulty: 'easy',
          status: 'active',
          startDate: '2024-01-15T00:00:00Z',
          endDate: '2024-01-22T23:59:59Z',
          duration: 7,
          participants: 45,
          maxParticipants: 100,
          rewards: {
            xp: 500,
            achievements: ['Hiragana Week Warrior', 'Character Master'],
            badges: ['Hiragana Expert', 'Weekly Champion'],
            specialRewards: ['Exclusive Hiragana Practice Sheet', 'Bonus XP Multiplier']
          },
          requirements: {
            minLevel: 1,
            maxLevel: 10,
            characterTypes: ['hiragana']
          },
          progress: {
            current: 12,
            target: 20,
            unit: 'characters',
            percentage: 60
          },
          leaderboard: [
            {
              userId: 'user-1',
              username: 'SakuraSensei',
              displayName: 'Sakura Sensei',
              avatar: '🌸',
              score: 20,
              rank: 1,
              progress: 100
            },
            {
              userId: userId,
              username: 'WriteWaveUser',
              displayName: 'WriteWave User',
              avatar: '🚀',
              score: 12,
              rank: 2,
              progress: 60
            },
            {
              userId: 'user-2',
              username: 'HiraganaHero',
              displayName: 'Hiragana Hero',
              avatar: '⚡',
              score: 10,
              rank: 3,
              progress: 50
            }
          ],
          myRank: 2,
          myScore: 12,
          myProgress: 60,
          rules: [
            'Practice at least 30 minutes daily',
            'Complete character recognition tests',
            'Share progress in the group chat',
            'Help other participants when possible'
          ],
          tips: [
            'Focus on stroke order first',
            'Practice writing each character 10 times',
            'Use mnemonics to remember characters',
            'Test yourself regularly'
          ],
          createdBy: {
            id: 'user-1',
            username: 'SakuraSensei',
            displayName: 'Sakura Sensei',
            avatar: '🌸'
          },
          isJoined: true,
          canJoin: false
        },
        {
          id: 'challenge-2',
          title: 'Speed Writing Championship',
          description: 'Compete in timed character writing challenges. Fastest and most accurate writers win!',
          type: 'special',
          category: 'speed',
          difficulty: 'hard',
          status: 'upcoming',
          startDate: '2024-01-25T00:00:00Z',
          endDate: '2024-01-28T23:59:59Z',
          duration: 3,
          participants: 0,
          maxParticipants: 50,
          rewards: {
            xp: 1000,
            achievements: ['Speed Demon', 'Lightning Writer'],
            badges: ['Speed Champion', 'Accuracy Master'],
            specialRewards: ['Custom Speed Writing Tool', 'Exclusive Speed Badge']
          },
          requirements: {
            minLevel: 5,
            characterTypes: ['hiragana', 'katakana', 'kanji']
          },
          progress: {
            current: 0,
            target: 100,
            unit: 'characters',
            percentage: 0
          },
          leaderboard: [],
          rules: [
            'Complete as many characters as possible in 5 minutes',
            'Accuracy must be above 80%',
            'No external help allowed',
            'Submit results within time limit'
          ],
          tips: [
            'Practice common characters first',
            'Focus on accuracy over speed initially',
            'Use proper stroke order',
            'Stay calm under pressure'
          ],
          createdBy: {
            id: 'user-2',
            username: 'KanjiMaster',
            displayName: 'Kanji Master',
            avatar: '🎌'
          },
          isJoined: false,
          canJoin: true,
          joinDeadline: '2024-01-24T23:59:59Z'
        },
        {
          id: 'challenge-3',
          title: '30-Day Streak Challenge',
          description: 'Maintain a 30-day learning streak. Consistency is key to mastering Japanese!',
          type: 'monthly',
          category: 'streak',
          difficulty: 'medium',
          status: 'active',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z',
          duration: 30,
          participants: 78,
          rewards: {
            xp: 2000,
            achievements: ['Streak Master', 'Consistency King'],
            badges: ['30-Day Warrior', 'Dedication Badge'],
            specialRewards: ['Streak Protection Token', 'Exclusive Streak Avatar']
          },
          requirements: {
            minLevel: 3
          },
          progress: {
            current: 21,
            target: 30,
            unit: 'days',
            percentage: 70
          },
          leaderboard: [
            {
              userId: 'user-3',
              username: 'PracticePanda',
              displayName: 'Practice Panda',
              avatar: '🐼',
              score: 30,
              rank: 1,
              progress: 100
            },
            {
              userId: userId,
              username: 'WriteWaveUser',
              displayName: 'WriteWave User',
              avatar: '🚀',
              score: 21,
              rank: 2,
              progress: 70
            }
          ],
          myRank: 2,
          myScore: 21,
          myProgress: 70,
          rules: [
            'Practice at least 15 minutes daily',
            'Log your practice session',
            'Share your daily progress',
            'Encourage other participants'
          ],
          tips: [
            'Set a consistent time for practice',
            'Start with small goals',
            'Use reminders and notifications',
            'Celebrate small wins'
          ],
          createdBy: {
            id: 'user-3',
            username: 'PracticePanda',
            displayName: 'Practice Panda',
            avatar: '🐼'
          },
          isJoined: true,
          canJoin: false
        },
        {
          id: 'challenge-4',
          title: 'Kanji Recognition Mastery',
          description: 'Master 50 Kanji characters with 95% accuracy. For intermediate to advanced learners.',
          type: 'weekly',
          category: 'kanji',
          difficulty: 'expert',
          status: 'completed',
          startDate: '2024-01-08T00:00:00Z',
          endDate: '2024-01-15T23:59:59Z',
          duration: 7,
          participants: 23,
          rewards: {
            xp: 1500,
            achievements: ['Kanji Master', 'Accuracy Expert'],
            badges: ['Kanji Champion', 'Precision Badge']
          },
          requirements: {
            minLevel: 8,
            characterTypes: ['kanji']
          },
          progress: {
            current: 50,
            target: 50,
            unit: 'characters',
            percentage: 100
          },
          leaderboard: [
            {
              userId: 'user-2',
              username: 'KanjiMaster',
              displayName: 'Kanji Master',
              avatar: '🎌',
              score: 50,
              rank: 1,
              progress: 100
            },
            {
              userId: 'user-4',
              username: 'StrokeSage',
              displayName: 'Stroke Sage',
              avatar: '🧙‍♂️',
              score: 48,
              rank: 2,
              progress: 96
            }
          ],
          myRank: 5,
          myScore: 42,
          myProgress: 84,
          rules: [
            'Achieve 95% accuracy on recognition tests',
            'Complete all 50 characters',
            'Submit results by deadline',
            'No cheating or external help'
          ],
          tips: [
            'Study radicals first',
            'Practice stroke order',
            'Use spaced repetition',
            'Focus on meaning and readings'
          ],
          createdBy: {
            id: 'user-2',
            username: 'KanjiMaster',
            displayName: 'Kanji Master',
            avatar: '🎌'
          },
          isJoined: true,
          canJoin: false
        }
      ];

      setChallenges(mockChallenges);
      setIsLoading(false);
    };

    loadChallenges();
  }, [userId]);

  const filteredChallenges = useMemo(() => {
    let filtered = challenges;

    // Filter by view mode
    if (viewMode === 'joined') {
      filtered = filtered.filter(challenge => challenge.isJoined);
    } else if (viewMode === 'available') {
      filtered = filtered.filter(challenge => challenge.canJoin && !challenge.isJoined);
    }

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(challenge => challenge.type === filters.type);
    }

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(challenge => challenge.category === filters.category);
    }

    // Filter by difficulty
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(challenge => challenge.difficulty === filters.difficulty);
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(challenge => challenge.status === filters.status);
    }

    // Filter by search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(query) ||
        challenge.description.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case 'popular':
          return b.participants - a.participants;
        case 'ending-soon':
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3, expert: 4 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        default:
          return 0;
      }
    });

    return filtered;
  }, [challenges, viewMode, filters, sortBy]);

  const challengeStats: ChallengeStats = {
    totalChallenges: challenges.length,
    completedChallenges: challenges.filter(c => c.status === 'completed').length,
    activeChallenges: challenges.filter(c => c.status === 'active').length,
    totalXP: challenges.reduce((sum, c) => sum + (c.myScore ? c.rewards.xp : 0), 0),
    achievements: 8,
    badges: 12,
    bestRank: 1,
    averageRank: 3.2,
    winRate: 75
  };

  const handleJoinChallenge = async (challengeId: string) => {
    setChallenges(prev => prev.map(challenge =>
      challenge.id === challengeId
        ? { 
            ...challenge, 
            isJoined: true, 
            canJoin: false,
            participants: challenge.participants + 1
          }
        : challenge
    ));
  };

  const handleLeaveChallenge = async (challengeId: string) => {
    setChallenges(prev => prev.map(challenge =>
      challenge.id === challengeId
        ? { 
            ...challenge, 
            isJoined: false, 
            canJoin: true,
            participants: challenge.participants - 1
          }
        : challenge
    ));
  };

  const handleCreateChallenge = async (challengeData: any) => {
    const newChallenge: Challenge = {
      id: `challenge-${Date.now()}`,
      title: challengeData.title,
      description: challengeData.description,
      type: challengeData.type,
      category: challengeData.category,
      difficulty: challengeData.difficulty,
      status: 'upcoming',
      startDate: challengeData.startDate,
      endDate: challengeData.endDate,
      duration: challengeData.duration,
      participants: 1,
      maxParticipants: challengeData.maxParticipants,
      rewards: challengeData.rewards,
      requirements: challengeData.requirements,
      progress: {
        current: 0,
        target: challengeData.target,
        unit: challengeData.unit,
        percentage: 0
      },
      leaderboard: [],
      rules: challengeData.rules,
      tips: challengeData.tips,
      createdBy: {
        id: userId,
        username: 'WriteWaveUser',
        displayName: 'WriteWave User',
        avatar: '🚀'
      },
      isJoined: true,
      canJoin: false
    };

    setChallenges(prev => [newChallenge, ...prev]);
    setShowCreateModal(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-50';
      case 'active': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-gray-600 bg-gray-50';
      case 'expired': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hiragana': return 'あ';
      case 'katakana': return 'ア';
      case 'kanji': return '漢';
      case 'mixed': return '🔤';
      case 'streak': return '🔥';
      case 'accuracy': return '🎯';
      case 'speed': return '⚡';
      default: return '🏆';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Calendar className="w-4 h-4" />;
      case 'weekly': return <Clock className="w-4 h-4" />;
      case 'monthly': return <Calendar className="w-4 h-4" />;
      case 'special': return <Star className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Group Challenges</h2>
          <p className="body text-gray-600">
            Compete with others and achieve your learning goals together
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode('stats')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'stats'
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            My Stats
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Challenge</span>
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center border-base rounded-lg p-1 w-fit">
        {(['all', 'joined', 'available', 'stats'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
              viewMode === mode
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {mode === 'all' ? 'All Challenges' : 
             mode === 'joined' ? 'My Challenges' : 
             mode === 'available' ? 'Available' : 'Statistics'}
          </button>
        ))}
      </div>

      {/* Content based on view mode */}
      {viewMode !== 'stats' && (
        <>
          {/* Filters */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
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
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="special">Special</option>
              </select>

              {/* Category Filter */}
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
                className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="hiragana">Hiragana</option>
                <option value="katakana">Katakana</option>
                <option value="kanji">Kanji</option>
                <option value="mixed">Mixed</option>
                <option value="streak">Streak</option>
                <option value="accuracy">Accuracy</option>
                <option value="speed">Speed</option>
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

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <div className="flex items-center space-x-2">
                {(['recent', 'popular', 'ending-soon', 'difficulty'] as const).map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setSortBy(sort)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      sortBy === sort
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {sort === 'recent' ? 'Most Recent' : 
                     sort === 'popular' ? 'Most Popular' : 
                     sort === 'ending-soon' ? 'Ending Soon' : 'Difficulty'}
                  </button>
                ))}
              </div>
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
                  className="bg-white border-base rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedChallenge(challenge);
                    setShowChallengeDetails(true);
                  }}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">{getCategoryIcon(challenge.category)}</span>
                          <div className="flex items-center space-x-1">
                            {getTypeIcon(challenge.type)}
                            <span className="text-sm text-gray-600 capitalize">{challenge.type}</span>
                          </div>
                        </div>
                        <h3 className="heading text-lg font-semibold text-gray-900 mb-1">
                          {challenge.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {challenge.description}
                        </p>
                      </div>
                    </div>

                    {/* Status and Difficulty */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(challenge.status)}`}>
                          {challenge.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </span>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{challenge.participants}</span>
                          {challenge.maxParticipants && (
                            <span>/{challenge.maxParticipants}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    {challenge.isJoined && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Your Progress</span>
                          <span>{challenge.myProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${challenge.myProgress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-600">
                          {challenge.myScore}/{challenge.progress.target} {challenge.progress.unit}
                        </div>
                      </div>
                    )}

                    {/* Rewards */}
                    <div className="bg-gray-50 rounded-lg p-3">
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
                            className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium"
                          >
                            {achievement}
                          </span>
                        ))}
                        {challenge.rewards.achievements.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            +{challenge.rewards.achievements.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Duration and Dates */}
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>{challenge.duration} days</span>
                      </div>
                    </div>

                    {/* My Rank */}
                    {challenge.myRank && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-900">
                            Rank #{challenge.myRank}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {challenge.leaderboard.length} participants
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {challenge.isJoined ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLeaveChallenge(challenge.id);
                          }}
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                          Leave Challenge
                        </button>
                      ) : challenge.canJoin ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinChallenge(challenge.id);
                          }}
                          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                        >
                          Join Challenge
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex-1 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm font-medium"
                        >
                          Cannot Join
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedChallenge(challenge);
                          setShowChallengeDetails(true);
                        }}
                        className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {viewMode === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Total Challenges</h3>
              <Trophy className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {challengeStats.totalChallenges}
            </div>
            <div className="text-sm text-gray-600">
              Challenges participated
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Completed</h3>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {challengeStats.completedChallenges}
            </div>
            <div className="text-sm text-gray-600">
              Challenges completed
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Total XP</h3>
              <Zap className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {challengeStats.totalXP.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              XP earned from challenges
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Best Rank</h3>
              <Crown className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              #{challengeStats.bestRank}
            </div>
            <div className="text-sm text-gray-600">
              Best ranking achieved
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {viewMode !== 'stats' && filteredChallenges.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="heading text-xl font-semibold text-gray-900 mb-2">No challenges found</h3>
          <p className="body text-gray-600 mb-4">
            {filters.search || filters.type !== 'all' || filters.category !== 'all' || filters.difficulty !== 'all' || filters.status !== 'all'
              ? 'Try adjusting your filters'
              : 'Be the first to create a challenge!'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Create Challenge
          </button>
        </div>
      )}

      {/* Challenge Details Modal */}
      <AnimatePresence>
        {showChallengeDetails && selectedChallenge && (
          <ChallengeDetailsModal
            challenge={selectedChallenge}
            onClose={() => setShowChallengeDetails(false)}
            onJoin={() => handleJoinChallenge(selectedChallenge.id)}
            onLeave={() => handleLeaveChallenge(selectedChallenge.id)}
          />
        )}
      </AnimatePresence>

      {/* Create Challenge Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateChallengeModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateChallenge}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Challenge Details Modal Component
interface ChallengeDetailsModalProps {
  challenge: Challenge;
  onClose: () => void;
  onJoin: () => void;
  onLeave: () => void;
}

const ChallengeDetailsModal: React.FC<ChallengeDetailsModalProps> = ({ 
  challenge, 
  onClose, 
  onJoin, 
  onLeave 
}) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white border-base rounded-lg p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="heading text-2xl font-bold text-gray-900">{challenge.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="heading text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{challenge.description}</p>
              </div>

              {/* Progress */}
              {challenge.isJoined && (
                <div>
                  <h3 className="heading text-lg font-semibold mb-2">Your Progress</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{challenge.myProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-3 rounded-full">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-300"
                        style={{ width: `${challenge.myProgress}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {challenge.myScore}/{challenge.progress.target} {challenge.progress.unit}
                    </div>
                    {challenge.myRank && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">Rank #{challenge.myRank}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rules */}
              <div>
                <h3 className="heading text-lg font-semibold mb-2">Rules</h3>
                <div className="space-y-2">
                  {challenge.rules.map((rule, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div>
                <h3 className="heading text-lg font-semibold mb-2">Tips</h3>
                <div className="space-y-2">
                  {challenge.tips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div>
                <h3 className="heading text-lg font-semibold mb-2">Leaderboard</h3>
                <div className="space-y-2">
                  {challenge.leaderboard.slice(0, 5).map((entry) => (
                    <div key={entry.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg">{entry.avatar}</div>
                        <div>
                          <div className="font-medium text-gray-900">{entry.displayName}</div>
                          <div className="text-sm text-gray-600">@{entry.username}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{entry.score}</div>
                        <div className="text-sm text-gray-600">Rank #{entry.rank}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Challenge Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="heading text-lg font-semibold mb-3">Challenge Info</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Type</span>
                    <span className="text-sm font-medium capitalize">{challenge.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Category</span>
                    <span className="text-sm font-medium capitalize">{challenge.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Difficulty</span>
                    <span className="text-sm font-medium capitalize">{challenge.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Participants</span>
                    <span className="text-sm font-medium">{challenge.participants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="text-sm font-medium">{challenge.duration} days</span>
                  </div>
                </div>
              </div>

              {/* Rewards */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="heading text-lg font-semibold mb-3">Rewards</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{challenge.rewards.xp} XP</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Achievements</h4>
                    <div className="space-y-1">
                      {challenge.rewards.achievements.map((achievement, index) => (
                        <div key={index} className="text-sm text-gray-600">• {achievement}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Badges</h4>
                    <div className="space-y-1">
                      {challenge.rewards.badges.map((badge, index) => (
                        <div key={index} className="text-sm text-gray-600">• {badge}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Created By */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="heading text-lg font-semibold mb-3">Created By</h3>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{challenge.createdBy.avatar}</div>
                  <div>
                    <div className="font-medium text-gray-900">{challenge.createdBy.displayName}</div>
                    <div className="text-sm text-gray-600">@{challenge.createdBy.username}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {challenge.isJoined ? (
                  <button
                    onClick={onLeave}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    Leave Challenge
                  </button>
                ) : challenge.canJoin ? (
                  <button
                    onClick={onJoin}
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                  >
                    Join Challenge
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                  >
                    Cannot Join
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Create Challenge Modal Component
interface CreateChallengeModalProps {
  onClose: () => void;
  onSubmit: (challengeData: any) => void;
}

const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'weekly' as const,
    category: 'hiragana' as const,
    difficulty: 'medium' as const,
    startDate: '',
    endDate: '',
    duration: 7,
    maxParticipants: 50,
    target: 20,
    unit: 'characters',
    rewards: {
      xp: 500,
      achievements: [] as string[],
      badges: [] as string[]
    },
    requirements: {
      minLevel: 1,
      maxLevel: 10,
      characterTypes: [] as string[]
    },
    rules: [] as string[],
    tips: [] as string[]
  });

  const [newRule, setNewRule] = useState('');
  const [newTip, setNewTip] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  const [newBadge, setNewBadge] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addRule = () => {
    if (newRule.trim()) {
      setFormData(prev => ({ ...prev, rules: [...prev.rules, newRule.trim()] }));
      setNewRule('');
    }
  };

  const addTip = () => {
    if (newTip.trim()) {
      setFormData(prev => ({ ...prev, tips: [...prev.tips, newTip.trim()] }));
      setNewTip('');
    }
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setFormData(prev => ({ 
        ...prev, 
        rewards: { 
          ...prev.rewards, 
          achievements: [...prev.rewards.achievements, newAchievement.trim()] 
        } 
      }));
      setNewAchievement('');
    }
  };

  const addBadge = () => {
    if (newBadge.trim()) {
      setFormData(prev => ({ 
        ...prev, 
        rewards: { 
          ...prev.rewards, 
          badges: [...prev.rewards.badges, newBadge.trim()] 
        } 
      }));
      setNewBadge('');
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white border-base rounded-lg p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="heading text-2xl font-bold text-gray-900">Create Challenge</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Challenge Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter challenge title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                  className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Describe your challenge"
              />
            </div>

            {/* Challenge Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="special">Special</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="hiragana">Hiragana</option>
                  <option value="katakana">Katakana</option>
                  <option value="kanji">Kanji</option>
                  <option value="mixed">Mixed</option>
                  <option value="streak">Streak</option>
                  <option value="accuracy">Accuracy</option>
                  <option value="speed">Speed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Target */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Value
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.target}
                  onChange={(e) => setFormData(prev => ({ ...prev, target: parseInt(e.target.value) }))}
                  className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., characters, minutes, days"
                />
              </div>
            </div>

            {/* Rewards */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                XP Reward
              </label>
              <input
                type="number"
                min="0"
                value={formData.rewards.xp}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  rewards: { ...prev.rewards, xp: parseInt(e.target.value) }
                }))}
                className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Rules */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rules
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
                  className="flex-1 p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add a rule"
                />
                <button
                  type="button"
                  onClick={addRule}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.rules.map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{rule}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        rules: prev.rules.filter((_, i) => i !== index)
                      }))}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tips
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={newTip}
                  onChange={(e) => setNewTip(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTip())}
                  className="flex-1 p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add a tip"
                />
                <button
                  type="button"
                  onClick={addTip}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{tip}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        tips: prev.tips.filter((_, i) => i !== index)
                      }))}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Create Challenge
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};
