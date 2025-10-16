"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Target, Clock, Star, Zap, Calendar, Award, BarChart3, Eye, EyeOff } from 'lucide-react';
import type { Character, CharacterMastery, LearningSession } from '@/types/character';

interface ProgressTrackingSystemProps {
  userId: string;
  className?: string;
}

interface ProgressData {
  totalCharacters: number;
  masteredCharacters: number;
  learningCharacters: number;
  newCharacters: number;
  totalXP: number;
  currentLevel: number;
  streak: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

interface LearningAnalytics {
  dailyProgress: Array<{ date: string; characters: number; xp: number; time: number }>;
  weeklyProgress: Array<{ week: string; characters: number; xp: number; accuracy: number }>;
  monthlyProgress: Array<{ month: string; characters: number; xp: number; streak: number }>;
  characterTypeProgress: Array<{ type: string; total: number; mastered: number; percentage: number }>;
  difficultyProgress: Array<{ difficulty: number; total: number; mastered: number; percentage: number }>;
  timeDistribution: Array<{ timeOfDay: string; minutes: number; percentage: number }>;
  accuracyTrend: Array<{ date: string; accuracy: number; attempts: number }>;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
  unlockedAt?: string;
}

interface LearningInsight {
  type: 'improvement' | 'warning' | 'suggestion' | 'achievement';
  title: string;
  message: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

export const ProgressTrackingSystem: React.FC<ProgressTrackingSystemProps> = ({
  userId,
  className = ''
}) => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedView, setSelectedView] = useState<'overview' | 'analytics' | 'achievements' | 'insights'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  // Mock data - in real app, this would come from analytics service
  useEffect(() => {
    const loadProgressData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock progress data
      const mockProgressData: ProgressData = {
        totalCharacters: 146,
        masteredCharacters: 67,
        learningCharacters: 23,
        newCharacters: 56,
        totalXP: 15420,
        currentLevel: 8,
        streak: 12,
        weeklyGoal: 20,
        weeklyProgress: 14
      };

      // Mock analytics data
      const mockAnalytics: LearningAnalytics = {
        dailyProgress: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          characters: Math.floor(Math.random() * 8) + 1,
          xp: Math.floor(Math.random() * 200) + 50,
          time: Math.floor(Math.random() * 60) + 15
        })),
        weeklyProgress: Array.from({ length: 12 }, (_, i) => ({
          week: `Week ${i + 1}`,
          characters: Math.floor(Math.random() * 15) + 5,
          xp: Math.floor(Math.random() * 1000) + 200,
          accuracy: Math.floor(Math.random() * 20) + 75
        })),
        monthlyProgress: Array.from({ length: 6 }, (_, i) => ({
          month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          characters: Math.floor(Math.random() * 50) + 20,
          xp: Math.floor(Math.random() * 3000) + 1000,
          streak: Math.floor(Math.random() * 15) + 5
        })),
        characterTypeProgress: [
          { type: 'Hiragana', total: 46, mastered: 42, percentage: 91 },
          { type: 'Katakana', total: 46, mastered: 18, percentage: 39 },
          { type: 'Kanji', total: 54, mastered: 7, percentage: 13 }
        ],
        difficultyProgress: [
          { difficulty: 1, total: 30, mastered: 28, percentage: 93 },
          { difficulty: 2, total: 35, mastered: 25, percentage: 71 },
          { difficulty: 3, total: 40, mastered: 12, percentage: 30 },
          { difficulty: 4, total: 25, mastered: 2, percentage: 8 },
          { difficulty: 5, total: 16, mastered: 0, percentage: 0 }
        ],
        timeDistribution: [
          { timeOfDay: 'Morning', minutes: 45, percentage: 35 },
          { timeOfDay: 'Afternoon', minutes: 30, percentage: 23 },
          { timeOfDay: 'Evening', minutes: 35, percentage: 27 },
          { timeOfDay: 'Night', minutes: 20, percentage: 15 }
        ],
        accuracyTrend: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          accuracy: Math.floor(Math.random() * 15) + 80,
          attempts: Math.floor(Math.random() * 20) + 5
        }))
      };

      // Mock achievements
      const mockAchievements: Achievement[] = [
        {
          id: 'first-character',
          title: 'First Steps',
          description: 'Complete your first character',
          icon: '🎉',
          unlocked: true,
          progress: 1,
          target: 1,
          unlockedAt: '2024-01-15'
        },
        {
          id: 'hiragana-master',
          title: 'Hiragana Master',
          description: 'Master all Hiragana characters',
          icon: '🏆',
          unlocked: false,
          progress: 42,
          target: 46
        },
        {
          id: 'streak-7',
          title: 'Week Warrior',
          description: 'Maintain a 7-day streak',
          icon: '🔥',
          unlocked: true,
          progress: 7,
          target: 7,
          unlockedAt: '2024-01-20'
        },
        {
          id: 'speed-demon',
          title: 'Speed Demon',
          description: 'Complete 10 characters in under 5 minutes',
          icon: '⚡',
          unlocked: false,
          progress: 6,
          target: 10
        },
        {
          id: 'perfectionist',
          title: 'Perfectionist',
          description: 'Achieve 95% accuracy on 20 characters',
          icon: '💎',
          unlocked: false,
          progress: 15,
          target: 20
        }
      ];

      // Mock insights
      const mockInsights: LearningInsight[] = [
        {
          type: 'improvement',
          title: 'Great Progress!',
          message: 'Your accuracy has improved by 15% this week',
          priority: 'high'
        },
        {
          type: 'suggestion',
          title: 'Focus on Katakana',
          message: 'You\'ve mastered Hiragana! Consider focusing on Katakana characters',
          action: 'Start Katakana lessons',
          priority: 'medium'
        },
        {
          type: 'warning',
          title: 'Streak at Risk',
          message: 'You haven\'t practiced in 2 days. Keep your streak going!',
          action: 'Practice now',
          priority: 'high'
        },
        {
          type: 'achievement',
          title: 'New Achievement!',
          message: 'You\'ve unlocked the "Week Warrior" achievement',
          priority: 'medium'
        }
      ];

      setProgressData(mockProgressData);
      setAnalytics(mockAnalytics);
      setAchievements(mockAchievements);
      setInsights(mockInsights);
      setIsLoading(false);
    };

    loadProgressData();
  }, [userId, selectedTimeframe]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getInsightColor = (type: LearningInsight['type']) => {
    switch (type) {
      case 'improvement': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-red-600 bg-red-50 border-red-200';
      case 'suggestion': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'achievement': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getInsightIcon = (type: LearningInsight['type']) => {
    switch (type) {
      case 'improvement': return <TrendingUp className="w-5 h-5" />;
      case 'warning': return <TrendingDown className="w-5 h-5" />;
      case 'suggestion': return <Target className="w-5 h-5" />;
      case 'achievement': return <Award className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const toggleDetails = (key: string) => {
    setShowDetails(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading progress data...</p>
        </div>
      </div>
    );
  }

  if (!progressData || !analytics) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className="text-gray-600">No progress data available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Progress Tracking</h2>
          <p className="body text-gray-600">
            Track your learning journey and discover insights
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Timeframe Selector */}
          <div className="flex items-center border-base rounded-lg p-1">
            {(['7d', '30d', '90d', '1y'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {timeframe === '7d' ? '7 Days' : timeframe === '30d' ? '30 Days' : timeframe === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex items-center border-base rounded-lg p-1 w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'achievements', label: 'Achievements', icon: Award },
          { id: 'insights', label: 'Insights', icon: Eye }
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setSelectedView(view.id as typeof selectedView)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded transition-colors ${
              selectedView === view.id
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <view.icon className="w-4 h-4" />
            <span>{view.label}</span>
          </button>
        ))}
      </div>

      {/* Overview */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="heading text-lg font-semibold">Characters Mastered</h3>
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {progressData.masteredCharacters}
              </div>
              <div className="text-sm text-gray-600">
                of {progressData.totalCharacters} total
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-3">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progressData.masteredCharacters / progressData.totalCharacters) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="heading text-lg font-semibold">Total XP</h3>
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {progressData.totalXP.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Level {progressData.currentLevel}
              </div>
            </div>

            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="heading text-lg font-semibold">Current Streak</h3>
                <Calendar className="w-6 h-6 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {progressData.streak}
              </div>
              <div className="text-sm text-gray-600">
                days in a row
              </div>
            </div>

            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="heading text-lg font-semibold">Weekly Goal</h3>
                <Target className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {progressData.weeklyProgress}
              </div>
              <div className="text-sm text-gray-600">
                of {progressData.weeklyGoal} characters
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-3">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progressData.weeklyProgress / progressData.weeklyGoal) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Progress Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Progress */}
            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <h3 className="heading text-lg font-semibold mb-4">Daily Progress</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.dailyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="characters" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="xp" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Character Type Progress */}
            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <h3 className="heading text-lg font-semibold mb-4">Character Type Progress</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.characterTypeProgress}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="mastered"
                    label={({ type, percentage }) => `${type}: ${percentage}%`}
                  >
                    {analytics.characterTypeProgress.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658'][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Analytics */}
      {selectedView === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accuracy Trend */}
            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <h3 className="heading text-lg font-semibold mb-4">Accuracy Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.accuracyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="accuracy" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Time Distribution */}
            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <h3 className="heading text-lg font-semibold mb-4">Learning Time Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.timeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timeOfDay" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="minutes" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Difficulty Progress */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Difficulty Progress</h3>
            <div className="space-y-4">
              {analytics.difficultyProgress.map((difficulty, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 text-sm font-medium">Level {difficulty.difficulty}</div>
                    <div className="flex-1 bg-gray-200 h-3 rounded-full">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-300"
                        style={{ width: `${difficulty.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-sm text-gray-600 text-right">
                    {difficulty.mastered}/{difficulty.total}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      {selectedView === 'achievements' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-white border-base rounded-lg p-6 shadow-sm transition-all ${
                  achievement.unlocked ? 'border-green-200 bg-green-50' : 'opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{achievement.icon}</div>
                  {achievement.unlocked && (
                    <div className="text-green-600">
                      <Award className="w-5 h-5" />
                    </div>
                  )}
                </div>
                
                <h3 className="heading text-lg font-semibold mb-2">{achievement.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{achievement.progress}/{achievement.target}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        achievement.unlocked ? 'bg-green-500' : 'bg-primary'
                      }`}
                      style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                    />
                  </div>
                </div>
                
                {achievement.unlockedAt && (
                  <div className="text-xs text-gray-500 mt-2">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {selectedView === 'insights' && (
        <div className="space-y-6">
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`border rounded-lg p-6 ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-primary">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{insight.message}</p>
                      {insight.action && (
                        <button className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                          {insight.action}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                    insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {insight.priority} priority
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
