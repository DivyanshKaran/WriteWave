"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, TrendingUp, Award, Target, Clock, Flame, Crown, Gem, Sparkles } from 'lucide-react';
import type { XPTransaction, Level } from '@/types/progress';

interface XPLevelingSystemProps {
  userId: string;
  className?: string;
}

interface XPData {
  currentXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  totalXP: number;
  dailyXP: number;
  weeklyXP: number;
  monthlyXP: number;
  xpHistory: Array<{ date: string; xp: number; source: string }>;
  levelHistory: Array<{ level: number; achievedAt: string; xp: number }>;
}

interface LevelReward {
  level: number;
  title: string;
  description: string;
  rewards: string[];
  icon: string;
  color: string;
}

interface XPSource {
  id: string;
  name: string;
  description: string;
  baseXP: number;
  multiplier: number;
  icon: React.ReactNode;
  color: string;
}

export const XPLevelingSystem: React.FC<XPLevelingSystemProps> = ({
  userId,
  className = ''
}) => {
  const [xpData, setXpData] = useState<XPData | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Mock XP data - in real app, this would come from progress service
  useEffect(() => {
    const loadXPData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock XP data
      const mockXPData: XPData = {
        currentXP: 15420,
        currentLevel: 8,
        xpToNextLevel: 580,
        totalXP: 15420,
        dailyXP: 240,
        weeklyXP: 1680,
        monthlyXP: 6720,
        xpHistory: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          xp: Math.floor(Math.random() * 200) + 50,
          source: ['character-practice', 'lesson-complete', 'streak-bonus', 'achievement'][Math.floor(Math.random() * 4)]
        })),
        levelHistory: Array.from({ length: 8 }, (_, i) => ({
          level: i + 1,
          achievedAt: new Date(Date.now() - (7 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
          xp: (i + 1) * 2000
        }))
      };

      setXpData(mockXPData);
      setIsLoading(false);
    };

    loadXPData();
  }, [userId]);

  const levelRewards: LevelReward[] = [
    {
      level: 1,
      title: 'Beginner',
      description: 'Welcome to WriteWave!',
      rewards: ['Access to basic characters', 'Daily practice reminders'],
      icon: '🌱',
      color: 'text-green-600 bg-green-50'
    },
    {
      level: 5,
      title: 'Student',
      description: 'You\'re making great progress!',
      rewards: ['Access to intermediate characters', 'Weekly challenges', 'Progress analytics'],
      icon: '📚',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      level: 10,
      title: 'Scholar',
      description: 'Impressive dedication!',
      rewards: ['Access to advanced characters', 'Custom practice sessions', 'Achievement badges'],
      icon: '🎓',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      level: 15,
      title: 'Expert',
      description: 'You\'re becoming a master!',
      rewards: ['Access to expert characters', 'Community features', 'Personalized insights'],
      icon: '🏆',
      color: 'text-yellow-600 bg-yellow-50'
    },
    {
      level: 20,
      title: 'Master',
      description: 'The ultimate achievement!',
      rewards: ['Access to all characters', 'Master classes', 'Mentor status'],
      icon: '👑',
      color: 'text-red-600 bg-red-50'
    }
  ];

  const xpSources: XPSource[] = [
    {
      id: 'character-practice',
      name: 'Character Practice',
      description: 'Practice drawing characters',
      baseXP: 10,
      multiplier: 1.0,
      icon: <Star className="w-5 h-5" />,
      color: 'text-yellow-600 bg-yellow-50'
    },
    {
      id: 'lesson-complete',
      name: 'Lesson Complete',
      description: 'Complete a full lesson',
      baseXP: 50,
      multiplier: 1.2,
      icon: <Award className="w-5 h-5" />,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      id: 'streak-bonus',
      name: 'Streak Bonus',
      description: 'Maintain your learning streak',
      baseXP: 25,
      multiplier: 1.5,
      icon: <Flame className="w-5 h-5" />,
      color: 'text-orange-600 bg-orange-50'
    },
    {
      id: 'achievement',
      name: 'Achievement',
      description: 'Unlock achievements',
      baseXP: 100,
      multiplier: 2.0,
      icon: <Crown className="w-5 h-5" />,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      id: 'perfect-score',
      name: 'Perfect Score',
      description: 'Achieve 100% accuracy',
      baseXP: 20,
      multiplier: 1.8,
      icon: <Gem className="w-5 h-5" />,
      color: 'text-green-600 bg-green-50'
    }
  ];

  const getCurrentLevelReward = () => {
    return levelRewards.find(reward => reward.level <= (xpData?.currentLevel || 0)) || levelRewards[0];
  };

  const getNextLevelReward = () => {
    return levelRewards.find(reward => reward.level > (xpData?.currentLevel || 0)) || levelRewards[levelRewards.length - 1];
  };

  const getLevelProgress = () => {
    if (!xpData) return 0;
    const currentLevelXP = (xpData.currentLevel - 1) * 2000;
    const nextLevelXP = xpData.currentLevel * 2000;
    const progressXP = xpData.currentXP - currentLevelXP;
    const levelRange = nextLevelXP - currentLevelXP;
    return (progressXP / levelRange) * 100;
  };

  const getXPColor = (level: number) => {
    if (level >= 20) return 'text-red-600 bg-red-50';
    if (level >= 15) return 'text-yellow-600 bg-yellow-50';
    if (level >= 10) return 'text-purple-600 bg-purple-50';
    if (level >= 5) return 'text-blue-600 bg-blue-50';
    return 'text-green-600 bg-green-50';
  };

  const getLevelIcon = (level: number) => {
    if (level >= 20) return '👑';
    if (level >= 15) return '🏆';
    if (level >= 10) return '🎓';
    if (level >= 5) return '📚';
    return '🌱';
  };

  const handleLevelUp = () => {
    if (xpData && xpData.currentLevel < 20) {
      setNewLevel(xpData.currentLevel + 1);
      setShowLevelUp(true);
    }
  };

  const handleLevelUpComplete = () => {
    setShowLevelUp(false);
    setNewLevel(null);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading XP data...</p>
        </div>
      </div>
    );
  }

  if (!xpData) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className="text-gray-600">No XP data available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">XP & Leveling</h2>
          <p className="body text-gray-600">
            Track your progress and unlock rewards
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Timeframe Selector */}
          <div className="flex items-center border-base rounded-lg p-1">
            {(['daily', 'weekly', 'monthly'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Level Display */}
      <div className="bg-white border-base rounded-lg p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">{getLevelIcon(xpData.currentLevel)}</div>
            <div>
              <h3 className="heading text-2xl font-bold text-gray-900">
                Level {xpData.currentLevel}
              </h3>
              <p className="body text-gray-600">
                {getCurrentLevelReward().title}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              {xpData.currentXP.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total XP</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress to Level {xpData.currentLevel + 1}</span>
            <span>{xpData.xpToNextLevel} XP needed</span>
          </div>
          <div className="w-full bg-gray-200 h-4 rounded-full">
            <motion.div
              className="bg-gradient-to-r from-primary to-blue-500 h-4 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${getLevelProgress()}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="text-sm text-gray-500">
            {Math.round(getLevelProgress())}% complete
          </div>
        </div>
      </div>

      {/* XP Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Daily XP</h3>
            <Zap className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {xpData.dailyXP}
          </div>
          <div className="text-sm text-gray-600">
            Today's progress
          </div>
        </div>

        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Weekly XP</h3>
            <TrendingUp className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {xpData.weeklyXP}
          </div>
          <div className="text-sm text-gray-600">
            This week's total
          </div>
        </div>

        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Monthly XP</h3>
            <Target className="w-6 h-6 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {xpData.monthlyXP}
          </div>
          <div className="text-sm text-gray-600">
            This month's total
          </div>
        </div>
      </div>

      {/* XP Sources */}
      <div className="bg-white border-base rounded-lg p-6 shadow-sm">
        <h3 className="heading text-lg font-semibold mb-4">XP Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {xpSources.map((source) => (
            <div
              key={source.id}
              className="flex items-center space-x-3 p-4 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <div className={`p-2 rounded-lg ${source.color}`}>
                {source.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{source.name}</div>
                <div className="text-sm text-gray-600">{source.description}</div>
                <div className="text-sm font-medium text-primary">
                  {source.baseXP} XP (x{source.multiplier})
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Level Rewards */}
      <div className="bg-white border-base rounded-lg p-6 shadow-sm">
        <h3 className="heading text-lg font-semibold mb-4">Level Rewards</h3>
        <div className="space-y-4">
          {levelRewards.map((reward) => (
            <div
              key={reward.level}
              className={`flex items-center space-x-4 p-4 rounded-lg border ${
                xpData.currentLevel >= reward.level
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="text-3xl">{reward.icon}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900">
                    Level {reward.level} - {reward.title}
                  </h4>
                  {xpData.currentLevel >= reward.level && (
                    <div className="text-green-600">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                <div className="flex flex-wrap gap-2">
                  {reward.rewards.map((rewardItem, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                    >
                      {rewardItem}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* XP History Chart */}
      <div className="bg-white border-base rounded-lg p-6 shadow-sm">
        <h3 className="heading text-lg font-semibold mb-4">XP History</h3>
        <div className="space-y-2">
          {xpData.xpHistory.slice(-7).map((entry, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm text-gray-600">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
                <span className="text-sm text-gray-500">
                  {xpSources.find(s => s.id === entry.source)?.name || entry.source}
                </span>
              </div>
              <span className="font-medium text-primary">+{entry.xp} XP</span>
            </div>
          ))}
        </div>
      </div>

      {/* Level Up Button */}
      <div className="text-center">
        <button
          onClick={handleLevelUp}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          Simulate Level Up
        </button>
      </div>

      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && newLevel && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white border-base rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="space-y-6">
                <div className="text-6xl">
                  {getLevelIcon(newLevel)}
                </div>
                
                <div>
                  <h3 className="heading text-2xl font-bold text-gray-900 mb-2">
                    Level Up!
                  </h3>
                  <p className="text-lg text-gray-600">
                    You've reached Level {newLevel}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-primary to-blue-500 text-white p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">New Rewards Unlocked!</h4>
                  <div className="text-sm">
                    {getNextLevelReward().rewards.map((reward, index) => (
                      <div key={index}>• {reward}</div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleLevelUpComplete}
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
