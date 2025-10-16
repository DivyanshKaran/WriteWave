"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, Medal, Star, TrendingUp, Users, Target, Zap, Flame, Award, Eye, EyeOff } from 'lucide-react';
import type { LeaderboardEntry } from '@/types/progress';

interface LeaderboardSystemProps {
  userId: string;
  className?: string;
}

interface LeaderboardData {
  entries: LeaderboardEntry[];
  userRank: number;
  userEntry: LeaderboardEntry | null;
  totalUsers: number;
  lastUpdated: string;
}

interface LeaderboardCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  sortBy: 'xp' | 'streak' | 'characters' | 'accuracy';
}

export const LeaderboardSystem: React.FC<LeaderboardSystemProps> = ({
  userId,
  className = ''
}) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('xp');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'all-time'>('weekly');
  const [showUserOnly, setShowUserOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock leaderboard data - in real app, this would come from progress service
  useEffect(() => {
    const loadLeaderboardData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock leaderboard entries
      const mockEntries: LeaderboardEntry[] = [
        {
          id: 'user-1',
          userId: 'user-1',
          username: 'SakuraSensei',
          displayName: 'Sakura Sensei',
          avatar: '🌸',
          rank: 1,
          xp: 25420,
          level: 12,
          streak: 45,
          charactersMastered: 89,
          accuracy: 94.5,
          totalPracticeTime: 1250,
          achievements: 23,
          lastActive: '2024-01-21T19:30:00Z',
          isCurrentUser: false
        },
        {
          id: 'user-2',
          userId: 'user-2',
          username: 'KanjiMaster',
          displayName: 'Kanji Master',
          avatar: '🎌',
          rank: 2,
          xp: 23150,
          level: 11,
          streak: 38,
          charactersMastered: 76,
          accuracy: 91.2,
          totalPracticeTime: 1100,
          achievements: 19,
          lastActive: '2024-01-21T18:45:00Z',
          isCurrentUser: false
        },
        {
          id: 'user-3',
          userId: 'user-3',
          username: 'HiraganaHero',
          displayName: 'Hiragana Hero',
          avatar: '⚡',
          rank: 3,
          xp: 19870,
          level: 10,
          streak: 42,
          charactersMastered: 67,
          accuracy: 89.8,
          totalPracticeTime: 980,
          achievements: 16,
          lastActive: '2024-01-21T17:20:00Z',
          isCurrentUser: false
        },
        {
          id: userId,
          userId: userId,
          username: 'WriteWaveUser',
          displayName: 'WriteWave User',
          avatar: '🚀',
          rank: 4,
          xp: 15420,
          level: 8,
          streak: 12,
          charactersMastered: 45,
          accuracy: 87.3,
          totalPracticeTime: 650,
          achievements: 12,
          lastActive: '2024-01-21T19:30:00Z',
          isCurrentUser: true
        },
        {
          id: 'user-5',
          userId: 'user-5',
          username: 'KatakanaKnight',
          displayName: 'Katakana Knight',
          avatar: '🛡️',
          rank: 5,
          xp: 14230,
          level: 7,
          streak: 28,
          charactersMastered: 38,
          accuracy: 85.6,
          totalPracticeTime: 720,
          achievements: 10,
          lastActive: '2024-01-21T16:10:00Z',
          isCurrentUser: false
        },
        {
          id: 'user-6',
          userId: 'user-6',
          username: 'StrokeSage',
          displayName: 'Stroke Sage',
          avatar: '🧙‍♂️',
          rank: 6,
          xp: 12890,
          level: 7,
          streak: 35,
          charactersMastered: 42,
          accuracy: 92.1,
          totalPracticeTime: 580,
          achievements: 14,
          lastActive: '2024-01-21T15:30:00Z',
          isCurrentUser: false
        },
        {
          id: 'user-7',
          userId: 'user-7',
          username: 'PracticePanda',
          displayName: 'Practice Panda',
          avatar: '🐼',
          rank: 7,
          xp: 11560,
          level: 6,
          streak: 19,
          charactersMastered: 33,
          accuracy: 83.4,
          totalPracticeTime: 890,
          achievements: 8,
          lastActive: '2024-01-21T14:45:00Z',
          isCurrentUser: false
        },
        {
          id: 'user-8',
          userId: 'user-8',
          username: 'CharacterChamp',
          displayName: 'Character Champ',
          avatar: '🏆',
          rank: 8,
          xp: 9870,
          level: 6,
          streak: 22,
          charactersMastered: 29,
          accuracy: 88.9,
          totalPracticeTime: 520,
          achievements: 11,
          lastActive: '2024-01-21T13:20:00Z',
          isCurrentUser: false
        }
      ];

      const mockLeaderboardData: LeaderboardData = {
        entries: mockEntries,
        userRank: 4,
        userEntry: mockEntries.find(e => e.isCurrentUser) || null,
        totalUsers: 1247,
        lastUpdated: new Date().toISOString()
      };

      setLeaderboardData(mockLeaderboardData);
      setIsLoading(false);
    };

    loadLeaderboardData();
  }, [userId, selectedCategory, selectedTimeframe]);

  const leaderboardCategories: LeaderboardCategory[] = [
    {
      id: 'xp',
      name: 'Total XP',
      description: 'Ranked by total experience points',
      icon: <Zap className="w-5 h-5" />,
      color: 'text-yellow-600 bg-yellow-50',
      sortBy: 'xp'
    },
    {
      id: 'streak',
      name: 'Current Streak',
      description: 'Ranked by current learning streak',
      icon: <Flame className="w-5 h-5" />,
      color: 'text-orange-600 bg-orange-50',
      sortBy: 'streak'
    },
    {
      id: 'characters',
      name: 'Characters Mastered',
      description: 'Ranked by characters mastered',
      icon: <Target className="w-5 h-5" />,
      color: 'text-blue-600 bg-blue-50',
      sortBy: 'characters'
    },
    {
      id: 'accuracy',
      name: 'Accuracy',
      description: 'Ranked by average accuracy',
      icon: <Star className="w-5 h-5" />,
      color: 'text-green-600 bg-green-50',
      sortBy: 'accuracy'
    }
  ];

  const sortedEntries = useMemo(() => {
    if (!leaderboardData) return [];
    
    const category = leaderboardCategories.find(c => c.id === selectedCategory);
    if (!category) return leaderboardData.entries;
    
    return [...leaderboardData.entries].sort((a, b) => {
      switch (category.sortBy) {
        case 'xp':
          return b.xp - a.xp;
        case 'streak':
          return b.streak - a.streak;
        case 'characters':
          return b.charactersMastered - a.charactersMastered;
        case 'accuracy':
          return b.accuracy - a.accuracy;
        default:
          return 0;
      }
    });
  }, [leaderboardData, selectedCategory]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-500" />;
      default: return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 2: return 'text-gray-600 bg-gray-50 border-gray-200';
      case 3: return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryValue = (entry: LeaderboardEntry, category: string) => {
    switch (category) {
      case 'xp':
        return entry.xp.toLocaleString();
      case 'streak':
        return `${entry.streak} days`;
      case 'characters':
        return `${entry.charactersMastered} characters`;
      case 'accuracy':
        return `${entry.accuracy}%`;
      default:
        return '';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'xp':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'streak':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'characters':
        return <Target className="w-4 h-4 text-blue-500" />;
      case 'accuracy':
        return <Star className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (!leaderboardData) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className="text-gray-600">No leaderboard data available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Leaderboard</h2>
          <p className="body text-gray-600">
            Compete with other learners and climb the ranks
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowUserOnly(!showUserOnly)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showUserOnly
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            {showUserOnly ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>Show My Rank</span>
          </button>
        </div>
      </div>

      {/* User Rank Summary */}
      {leaderboardData.userEntry && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Your Rank</h3>
            <div className="text-2xl font-bold text-primary">
              #{leaderboardData.userRank}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{leaderboardData.userEntry.avatar}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{leaderboardData.userEntry.displayName}</h4>
              <p className="text-sm text-gray-600">@{leaderboardData.userEntry.username}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {getCategoryValue(leaderboardData.userEntry, selectedCategory)}
              </div>
              <div className="text-sm text-gray-600">
                {leaderboardCategories.find(c => c.id === selectedCategory)?.name}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Selector */}
      <div className="flex flex-wrap gap-2">
        {leaderboardCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category.id
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            <div className={selectedCategory === category.id ? 'text-white' : category.color.split(' ')[0]}>
              {category.icon}
            </div>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center border-base rounded-lg p-1 w-fit">
        {(['daily', 'weekly', 'monthly', 'all-time'] as const).map((timeframe) => (
          <button
            key={timeframe}
            onClick={() => setSelectedTimeframe(timeframe)}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              selectedTimeframe === timeframe
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {timeframe === 'daily' ? 'Today' : 
             timeframe === 'weekly' ? 'This Week' :
             timeframe === 'monthly' ? 'This Month' : 'All Time'}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="bg-white border-base rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="heading text-lg font-semibold">
              {leaderboardCategories.find(c => c.id === selectedCategory)?.name} Leaderboard
            </h3>
            <div className="text-sm text-gray-600">
              {leaderboardData.totalUsers.toLocaleString()} total users
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          <AnimatePresence>
            {sortedEntries
              .filter(entry => !showUserOnly || entry.isCurrentUser)
              .slice(0, showUserOnly ? 1 : 10)
              .map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    entry.isCurrentUser ? 'bg-primary/5 border-l-4 border-primary' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(entry.rank)}
                      </div>
                      
                      {/* Avatar */}
                      <div className="text-3xl">{entry.avatar}</div>
                      
                      {/* User Info */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">
                            {entry.displayName}
                          </h4>
                          {entry.isCurrentUser && (
                            <span className="px-2 py-1 bg-primary text-white rounded-full text-xs font-medium">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">@{entry.username}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Level {entry.level}</span>
                          <span>{entry.achievements} achievements</span>
                          <span>
                            Last active {new Date(entry.lastActive).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Category Value */}
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(selectedCategory)}
                        <span className="text-2xl font-bold text-gray-900">
                          {getCategoryValue(entry, selectedCategory)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {leaderboardCategories.find(c => c.id === selectedCategory)?.name}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Leaderboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Total Users</h3>
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {leaderboardData.totalUsers.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            Active learners
          </div>
        </div>

        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Your Rank</h3>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            #{leaderboardData.userRank}
          </div>
          <div className="text-sm text-gray-600">
            Top {Math.round((leaderboardData.userRank / leaderboardData.totalUsers) * 100)}%
          </div>
        </div>

        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Last Updated</h3>
            <Trophy className="w-6 h-6 text-purple-500" />
          </div>
          <div className="text-lg font-bold text-gray-900 mb-2">
            {new Date(leaderboardData.lastUpdated).toLocaleTimeString()}
          </div>
          <div className="text-sm text-gray-600">
            Real-time updates
          </div>
        </div>
      </div>

      {/* Empty State */}
      {showUserOnly && !leaderboardData.userEntry && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="heading text-xl font-semibold text-gray-900 mb-2">No Rank Found</h3>
          <p className="body text-gray-600 mb-4">
            You need to practice more to appear on the leaderboard
          </p>
          <button
            onClick={() => setShowUserOnly(false)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            View Full Leaderboard
          </button>
        </div>
      )}
    </div>
  );
};
