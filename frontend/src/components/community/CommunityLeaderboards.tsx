"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, Medal, Star, Users, Target, Zap, Flame, Award, TrendingUp, TrendingDown, Eye, EyeOff, Filter, Search, Calendar, Clock, Globe, MapPin } from 'lucide-react';

interface CommunityLeaderboardsProps {
  userId: string;
  className?: string;
}

interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  charactersMastered: number;
  accuracy: number;
  totalStudyTime: number;
  achievements: number;
  challengesCompleted: number;
  feedbackGiven: number;
  feedbackReceived: number;
  studyGroups: number;
  discussions: number;
  location: string;
  timezone: string;
  joinedAt: string;
  lastActive: string;
  isOnline: boolean;
  isCurrentUser: boolean;
  rank: number;
  previousRank: number;
  rankChange: number;
  badges: string[];
  specializations: string[];
  socialScore: number;
  communityContributions: number;
}

interface LeaderboardCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  sortBy: keyof LeaderboardEntry;
  unit: string;
}

interface LeaderboardTimeframe {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface CommunityStats {
  totalUsers: number;
  activeUsers: number;
  totalXP: number;
  totalCharacters: number;
  totalStudyTime: number;
  averageLevel: number;
  topCountries: Array<{ country: string; users: number }>;
  topTimezones: Array<{ timezone: string; users: number }>;
  growthRate: number;
}

export const CommunityLeaderboards: React.FC<CommunityLeaderboardsProps> = ({
  userId,
  className = ''
}) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('xp');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'all-time'>('weekly');
  const [showUserOnly, setShowUserOnly] = useState(false);
  const [showCommunityStats, setShowCommunityStats] = useState(false);
  const [filters, setFilters] = useState({
    location: 'all' as 'all' | 'same-country' | 'same-timezone',
    level: 'all' as 'all' | 'beginner' | 'intermediate' | 'advanced',
    onlineOnly: false,
    search: ''
  });

  // Mock data - in real app, this would come from community service
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
          level: 12,
          xp: 25420,
          streak: 45,
          charactersMastered: 89,
          accuracy: 94.5,
          totalStudyTime: 1250,
          achievements: 23,
          challengesCompleted: 15,
          feedbackGiven: 45,
          feedbackReceived: 32,
          studyGroups: 3,
          discussions: 28,
          location: 'Tokyo, Japan',
          timezone: 'Asia/Tokyo',
          joinedAt: '2023-06-15T10:00:00Z',
          lastActive: '2024-01-21T19:30:00Z',
          isOnline: true,
          isCurrentUser: false,
          rank: 1,
          previousRank: 1,
          rankChange: 0,
          badges: ['Teacher', 'Mentor', 'Helper'],
          specializations: ['Hiragana', 'Teaching', 'Calligraphy'],
          socialScore: 95,
          communityContributions: 156
        },
        {
          id: 'user-2',
          userId: 'user-2',
          username: 'KanjiMaster',
          displayName: 'Kanji Master',
          avatar: '🎌',
          level: 15,
          xp: 23150,
          streak: 38,
          charactersMastered: 156,
          accuracy: 91.2,
          totalStudyTime: 2100,
          achievements: 31,
          challengesCompleted: 28,
          feedbackGiven: 67,
          feedbackReceived: 89,
          studyGroups: 2,
          discussions: 45,
          location: 'Osaka, Japan',
          timezone: 'Asia/Tokyo',
          joinedAt: '2023-03-20T14:30:00Z',
          lastActive: '2024-01-21T18:45:00Z',
          isOnline: false,
          isCurrentUser: false,
          rank: 2,
          previousRank: 3,
          rankChange: 1,
          badges: ['Expert', 'Scholar', 'Leader'],
          specializations: ['Kanji', 'History', 'Advanced'],
          socialScore: 88,
          communityContributions: 203
        },
        {
          id: 'user-3',
          userId: 'user-3',
          username: 'HiraganaHero',
          displayName: 'Hiragana Hero',
          avatar: '⚡',
          level: 8,
          xp: 19870,
          streak: 42,
          charactersMastered: 67,
          accuracy: 89.8,
          totalStudyTime: 980,
          achievements: 16,
          challengesCompleted: 12,
          feedbackGiven: 23,
          feedbackReceived: 18,
          studyGroups: 4,
          discussions: 15,
          location: 'Seoul, South Korea',
          timezone: 'Asia/Seoul',
          joinedAt: '2023-11-10T09:15:00Z',
          lastActive: '2024-01-21T17:20:00Z',
          isOnline: true,
          isCurrentUser: false,
          rank: 3,
          previousRank: 2,
          rankChange: -1,
          badges: ['Rising Star', 'Helper'],
          specializations: ['Hiragana', 'Beginners'],
          socialScore: 82,
          communityContributions: 89
        },
        {
          id: userId,
          userId: userId,
          username: 'WriteWaveUser',
          displayName: 'WriteWave User',
          avatar: '🚀',
          level: 8,
          xp: 15420,
          streak: 12,
          charactersMastered: 45,
          accuracy: 87.3,
          totalStudyTime: 650,
          achievements: 12,
          challengesCompleted: 8,
          feedbackGiven: 15,
          feedbackReceived: 23,
          studyGroups: 2,
          discussions: 8,
          location: 'Tokyo, Japan',
          timezone: 'Asia/Tokyo',
          joinedAt: '2023-12-01T10:00:00Z',
          lastActive: '2024-01-21T19:30:00Z',
          isOnline: true,
          isCurrentUser: true,
          rank: 4,
          previousRank: 5,
          rankChange: 1,
          badges: ['Learner', 'Active'],
          specializations: ['Hiragana', 'Katakana'],
          socialScore: 75,
          communityContributions: 45
        },
        {
          id: 'user-4',
          userId: 'user-4',
          username: 'KatakanaKnight',
          displayName: 'Katakana Knight',
          avatar: '🛡️',
          level: 7,
          xp: 14230,
          streak: 28,
          charactersMastered: 38,
          accuracy: 85.6,
          totalStudyTime: 720,
          achievements: 10,
          challengesCompleted: 6,
          feedbackGiven: 8,
          feedbackReceived: 12,
          studyGroups: 1,
          discussions: 5,
          location: 'Kyoto, Japan',
          timezone: 'Asia/Tokyo',
          joinedAt: '2023-09-15T16:20:00Z',
          lastActive: '2024-01-21T16:10:00Z',
          isOnline: false,
          isCurrentUser: false,
          rank: 5,
          previousRank: 4,
          rankChange: -1,
          badges: ['Knight', 'Dedicated'],
          specializations: ['Katakana', 'Intermediate'],
          socialScore: 68,
          communityContributions: 34
        }
      ];

      setLeaderboardData(mockEntries);
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
      sortBy: 'xp',
      unit: 'XP'
    },
    {
      id: 'streak',
      name: 'Current Streak',
      description: 'Ranked by current learning streak',
      icon: <Flame className="w-5 h-5" />,
      color: 'text-orange-600 bg-orange-50',
      sortBy: 'streak',
      unit: 'days'
    },
    {
      id: 'characters',
      name: 'Characters Mastered',
      description: 'Ranked by characters mastered',
      icon: <Target className="w-5 h-5" />,
      color: 'text-blue-600 bg-blue-50',
      sortBy: 'charactersMastered',
      unit: 'characters'
    },
    {
      id: 'accuracy',
      name: 'Accuracy',
      description: 'Ranked by average accuracy',
      icon: <Star className="w-5 h-5" />,
      color: 'text-green-600 bg-green-50',
      sortBy: 'accuracy',
      unit: '%'
    },
    {
      id: 'study-time',
      name: 'Study Time',
      description: 'Ranked by total study time',
      icon: <Clock className="w-5 h-5" />,
      color: 'text-purple-600 bg-purple-50',
      sortBy: 'totalStudyTime',
      unit: 'minutes'
    },
    {
      id: 'achievements',
      name: 'Achievements',
      description: 'Ranked by achievements unlocked',
      icon: <Award className="w-5 h-5" />,
      color: 'text-indigo-600 bg-indigo-50',
      sortBy: 'achievements',
      unit: 'achievements'
    },
    {
      id: 'challenges',
      name: 'Challenges',
      description: 'Ranked by challenges completed',
      icon: <Trophy className="w-5 h-5" />,
      color: 'text-red-600 bg-red-50',
      sortBy: 'challengesCompleted',
      unit: 'challenges'
    },
    {
      id: 'social',
      name: 'Social Score',
      description: 'Ranked by community contributions',
      icon: <Users className="w-5 h-5" />,
      color: 'text-pink-600 bg-pink-50',
      sortBy: 'socialScore',
      unit: 'points'
    }
  ];

  const timeframes: LeaderboardTimeframe[] = [
    {
      id: 'daily',
      name: 'Today',
      description: 'Today\'s top performers',
      icon: <Calendar className="w-4 h-4" />
    },
    {
      id: 'weekly',
      name: 'This Week',
      description: 'This week\'s top performers',
      icon: <Calendar className="w-4 h-4" />
    },
    {
      id: 'monthly',
      name: 'This Month',
      description: 'This month\'s top performers',
      icon: <Calendar className="w-4 h-4" />
    },
    {
      id: 'all-time',
      name: 'All Time',
      description: 'All-time top performers',
      icon: <Globe className="w-4 h-4" />
    }
  ];

  const filteredEntries = useMemo(() => {
    let filtered = leaderboardData;

    // Filter by location
    if (filters.location === 'same-country') {
      filtered = filtered.filter(entry => entry.location.includes('Japan'));
    } else if (filters.location === 'same-timezone') {
      filtered = filtered.filter(entry => entry.timezone === 'Asia/Tokyo');
    }

    // Filter by level
    if (filters.level !== 'all') {
      const levelRanges = {
        beginner: [1, 5],
        intermediate: [6, 10],
        advanced: [11, 20]
      };
      const [min, max] = levelRanges[filters.level];
      filtered = filtered.filter(entry => entry.level >= min && entry.level <= max);
    }

    // Filter by online status
    if (filters.onlineOnly) {
      filtered = filtered.filter(entry => entry.isOnline);
    }

    // Filter by search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.username.toLowerCase().includes(query) ||
        entry.displayName.toLowerCase().includes(query) ||
        entry.location.toLowerCase().includes(query)
      );
    }

    // Sort by selected category
    const category = leaderboardCategories.find(c => c.id === selectedCategory);
    if (category) {
      filtered.sort((a, b) => {
        const aValue = a[category.sortBy] as number;
        const bValue = b[category.sortBy] as number;
        return bValue - aValue;
      });
    }

    // Update ranks
    filtered = filtered.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    return filtered;
  }, [leaderboardData, selectedCategory, filters]);

  const communityStats: CommunityStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalXP: 1542000,
    totalCharacters: 45600,
    totalStudyTime: 125000,
    averageLevel: 6.8,
    topCountries: [
      { country: 'Japan', users: 456 },
      { country: 'United States', users: 234 },
      { country: 'South Korea', users: 123 },
      { country: 'United Kingdom', users: 89 },
      { country: 'Germany', users: 67 }
    ],
    topTimezones: [
      { timezone: 'Asia/Tokyo', users: 456 },
      { timezone: 'America/New_York', users: 234 },
      { timezone: 'Europe/London', users: 123 },
      { timezone: 'Asia/Seoul', users: 89 },
      { timezone: 'Europe/Berlin', users: 67 }
    ],
    growthRate: 12.5
  };

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
    const categoryData = leaderboardCategories.find(c => c.id === category);
    if (!categoryData) return '';
    
    const value = entry[categoryData.sortBy] as number;
    return `${value.toLocaleString()} ${categoryData.unit}`;
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = leaderboardCategories.find(c => c.id === category);
    return categoryData?.icon || <Trophy className="w-4 h-4" />;
  };

  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading leaderboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Community Leaderboards</h2>
          <p className="body text-gray-600">
            See how you rank against other learners in the community
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCommunityStats(!showCommunityStats)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showCommunityStats
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            Community Stats
          </button>
          <button
            onClick={() => setShowUserOnly(!showUserOnly)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showUserOnly
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            {showUserOnly ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="ml-2">My Rank</span>
          </button>
        </div>
      </div>

      {/* Community Stats */}
      {showCommunityStats && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Community Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {communityStats.totalUsers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {communityStats.activeUsers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.round(communityStats.totalStudyTime / 60).toLocaleString()}h
              </div>
              <div className="text-sm text-gray-600">Total Study Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {communityStats.averageLevel.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Average Level</div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Top Countries</h4>
              <div className="space-y-2">
                {communityStats.topCountries.map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{country.country}</span>
                    <span className="text-sm font-medium text-gray-900">{country.users}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Top Timezones</h4>
              <div className="space-y-2">
                {communityStats.topTimezones.map((timezone, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{timezone.timezone}</span>
                    <span className="text-sm font-medium text-gray-900">{timezone.users}</span>
                  </div>
                ))}
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
        {timeframes.map((timeframe) => (
          <button
            key={timeframe.id}
            onClick={() => setSelectedTimeframe(timeframe.id as any)}
            className={`flex items-center space-x-2 px-3 py-1 text-sm font-medium rounded transition-colors ${
              selectedTimeframe === timeframe.id
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {timeframe.icon}
            <span>{timeframe.name}</span>
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
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Location Filter */}
          <select
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value as any }))}
            className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Locations</option>
            <option value="same-country">Same Country</option>
            <option value="same-timezone">Same Timezone</option>
          </select>

          {/* Level Filter */}
          <select
            value={filters.level}
            onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value as any }))}
            className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner (1-5)</option>
            <option value="intermediate">Intermediate (6-10)</option>
            <option value="advanced">Advanced (11+)</option>
          </select>

          {/* Online Only Filter */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="onlineOnly"
              checked={filters.onlineOnly}
              onChange={(e) => setFilters(prev => ({ ...prev, onlineOnly: e.target.checked }))}
              className="w-4 h-4 text-primary border-base rounded focus:ring-primary"
            />
            <label htmlFor="onlineOnly" className="text-sm text-gray-700">
              Online Only
            </label>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white border-base rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="heading text-lg font-semibold">
              {leaderboardCategories.find(c => c.id === selectedCategory)?.name} Leaderboard
            </h3>
            <div className="text-sm text-gray-600">
              {filteredEntries.length} users
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          <AnimatePresence>
            {filteredEntries
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
                          {entry.isOnline && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
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
                        
                        {/* Badges */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.badges.slice(0, 3).map((badge) => (
                            <span
                              key={badge}
                              className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Category Value and Rank Change */}
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        {getCategoryIcon(selectedCategory)}
                        <span className="text-2xl font-bold text-gray-900">
                          {getCategoryValue(entry, selectedCategory)}
                        </span>
                      </div>
                      <div className="flex items-center justify-end space-x-2">
                        {getRankChangeIcon(entry.rankChange)}
                        <span className={`text-sm font-medium ${
                          entry.rankChange > 0 ? 'text-green-600' :
                          entry.rankChange < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {entry.rankChange > 0 ? `+${entry.rankChange}` : 
                           entry.rankChange < 0 ? entry.rankChange : 'No change'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>

      {/* User Rank Summary */}
      {!showUserOnly && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Your Rank</h3>
            <div className="text-2xl font-bold text-primary">
              #{filteredEntries.find(e => e.isCurrentUser)?.rank || 'N/A'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {filteredEntries.find(e => e.isCurrentUser)?.xp.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {filteredEntries.find(e => e.isCurrentUser)?.streak || '0'}
              </div>
              <div className="text-sm text-gray-600">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {filteredEntries.find(e => e.isCurrentUser)?.charactersMastered || '0'}
              </div>
              <div className="text-sm text-gray-600">Characters Mastered</div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {showUserOnly && !filteredEntries.find(e => e.isCurrentUser) && (
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
