"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Flame, Target, Clock, Zap, Crown, Gem, Award, CheckCircle, Lock, Sparkles, Share2 } from 'lucide-react';
import type { Achievement } from '@/types/progress';

interface AchievementSystemProps {
  userId: string;
  className?: string;
}

interface AchievementCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  achievements: Achievement[];
}

interface AchievementProgress {
  achievementId: string;
  progress: number;
  target: number;
  percentage: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export const AchievementSystem: React.FC<AchievementSystemProps> = ({
  userId,
  className = ''
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAchievementUnlock, setShowAchievementUnlock] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);

  // Mock achievement data - in real app, this would come from progress service
  useEffect(() => {
    const loadAchievements = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock achievements
      const mockAchievements: Achievement[] = [
        // Learning Achievements
        {
          id: 'first-character',
          title: 'First Steps',
          description: 'Complete your first character',
          icon: '🎉',
          category: 'learning',
          rarity: 'common',
          xpReward: 50,
          unlocked: true,
          unlockedAt: '2024-01-15T10:30:00Z',
          progress: { current: 1, target: 1 }
        },
        {
          id: 'hiragana-master',
          title: 'Hiragana Master',
          description: 'Master all 46 Hiragana characters',
          icon: '🏆',
          category: 'learning',
          rarity: 'rare',
          xpReward: 500,
          unlocked: false,
          progress: { current: 42, target: 46 }
        },
        {
          id: 'katakana-master',
          title: 'Katakana Master',
          description: 'Master all 46 Katakana characters',
          icon: '⭐',
          category: 'learning',
          rarity: 'rare',
          xpReward: 500,
          unlocked: false,
          progress: { current: 18, target: 46 }
        },
        {
          id: 'kanji-master',
          title: 'Kanji Master',
          description: 'Master 100 Kanji characters',
          icon: '👑',
          category: 'learning',
          rarity: 'legendary',
          xpReward: 2000,
          unlocked: false,
          progress: { current: 7, target: 100 }
        },
        
        // Streak Achievements
        {
          id: 'streak-3',
          title: 'Three Day Streak',
          description: 'Maintain a 3-day learning streak',
          icon: '🔥',
          category: 'streak',
          rarity: 'common',
          xpReward: 100,
          unlocked: true,
          unlockedAt: '2024-01-18T09:15:00Z',
          progress: { current: 3, target: 3 }
        },
        {
          id: 'streak-7',
          title: 'Week Warrior',
          description: 'Maintain a 7-day learning streak',
          icon: '⚡',
          category: 'streak',
          rarity: 'uncommon',
          xpReward: 250,
          unlocked: true,
          unlockedAt: '2024-01-22T08:45:00Z',
          progress: { current: 7, target: 7 }
        },
        {
          id: 'streak-30',
          title: 'Month Master',
          description: 'Maintain a 30-day learning streak',
          icon: '🌟',
          category: 'streak',
          rarity: 'epic',
          xpReward: 1000,
          unlocked: false,
          progress: { current: 12, target: 30 }
        },
        
        // Performance Achievements
        {
          id: 'speed-demon',
          title: 'Speed Demon',
          description: 'Complete 10 characters in under 5 minutes',
          icon: '💨',
          category: 'performance',
          rarity: 'uncommon',
          xpReward: 200,
          unlocked: false,
          progress: { current: 6, target: 10 }
        },
        {
          id: 'perfectionist',
          title: 'Perfectionist',
          description: 'Achieve 95% accuracy on 20 characters',
          icon: '💎',
          category: 'performance',
          rarity: 'rare',
          xpReward: 300,
          unlocked: false,
          progress: { current: 15, target: 20 }
        },
        {
          id: 'consistency-king',
          title: 'Consistency King',
          description: 'Maintain 80% accuracy for 50 characters',
          icon: '🎯',
          category: 'performance',
          rarity: 'epic',
          xpReward: 750,
          unlocked: false,
          progress: { current: 32, target: 50 }
        },
        
        // Social Achievements
        {
          id: 'social-butterfly',
          title: 'Social Butterfly',
          description: 'Join 5 study groups',
          icon: '🦋',
          category: 'social',
          rarity: 'uncommon',
          xpReward: 150,
          unlocked: false,
          progress: { current: 2, target: 5 }
        },
        {
          id: 'mentor',
          title: 'Mentor',
          description: 'Help 10 other learners',
          icon: '👨‍🏫',
          category: 'social',
          rarity: 'rare',
          xpReward: 400,
          unlocked: false,
          progress: { current: 3, target: 10 }
        },
        
        // Special Achievements
        {
          id: 'early-bird',
          title: 'Early Bird',
          description: 'Practice at 6 AM for 7 days',
          icon: '🌅',
          category: 'special',
          rarity: 'uncommon',
          xpReward: 200,
          unlocked: false,
          progress: { current: 4, target: 7 }
        },
        {
          id: 'night-owl',
          title: 'Night Owl',
          description: 'Practice at 11 PM for 7 days',
          icon: '🦉',
          category: 'special',
          rarity: 'uncommon',
          xpReward: 200,
          unlocked: false,
          progress: { current: 2, target: 7 }
        },
        {
          id: 'weekend-warrior',
          title: 'Weekend Warrior',
          description: 'Practice every weekend for a month',
          icon: '🏋️',
          category: 'special',
          rarity: 'rare',
          xpReward: 300,
          unlocked: false,
          progress: { current: 3, target: 8 }
        }
      ];

      setAchievements(mockAchievements);
      setIsLoading(false);
    };

    loadAchievements();
  }, [userId]);

  const achievementCategories: AchievementCategory[] = [
    {
      id: 'all',
      name: 'All Achievements',
      description: 'View all achievements',
      icon: <Trophy className="w-5 h-5" />,
      color: 'text-gray-600 bg-gray-50',
      achievements: achievements
    },
    {
      id: 'learning',
      name: 'Learning',
      description: 'Character mastery achievements',
      icon: <Star className="w-5 h-5" />,
      color: 'text-blue-600 bg-blue-50',
      achievements: achievements.filter(a => a.category === 'learning')
    },
    {
      id: 'streak',
      name: 'Streaks',
      description: 'Consistency achievements',
      icon: <Flame className="w-5 h-5" />,
      color: 'text-orange-600 bg-orange-50',
      achievements: achievements.filter(a => a.category === 'streak')
    },
    {
      id: 'performance',
      name: 'Performance',
      description: 'Speed and accuracy achievements',
      icon: <Target className="w-5 h-5" />,
      color: 'text-green-600 bg-green-50',
      achievements: achievements.filter(a => a.category === 'performance')
    },
    {
      id: 'social',
      name: 'Social',
      description: 'Community achievements',
      icon: <Crown className="w-5 h-5" />,
      color: 'text-purple-600 bg-purple-50',
      achievements: achievements.filter(a => a.category === 'social')
    },
    {
      id: 'special',
      name: 'Special',
      description: 'Unique achievements',
      icon: <Gem className="w-5 h-5" />,
      color: 'text-yellow-600 bg-yellow-50',
      achievements: achievements.filter(a => a.category === 'special')
    }
  ];

  const filteredAchievements = useMemo(() => {
    const category = achievementCategories.find(c => c.id === selectedCategory);
    if (!category) return achievements;
    
    let filtered = category.achievements;
    
    if (showUnlockedOnly) {
      filtered = filtered.filter(a => a.unlocked);
    }
    
    return filtered;
  }, [achievements, selectedCategory, showUnlockedOnly]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'uncommon': return 'text-green-600 bg-green-50 border-green-200';
      case 'rare': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'epic': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'legendary': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Award className="w-4 h-4" />;
      case 'uncommon': return <Star className="w-4 h-4" />;
      case 'rare': return <Gem className="w-4 h-4" />;
      case 'epic': return <Crown className="w-4 h-4" />;
      case 'legendary': return <Trophy className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const handleAchievementUnlock = (achievement: Achievement) => {
    setUnlockedAchievement(achievement);
    setShowAchievementUnlock(true);
  };

  const handleUnlockComplete = () => {
    setShowAchievementUnlock(false);
    setUnlockedAchievement(null);
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = (unlockedCount / totalCount) * 100;

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Achievements</h2>
          <p className="body text-gray-600">
            Unlock rewards by completing challenges
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showUnlockedOnly
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Unlocked Only</span>
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white border-base rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="heading text-lg font-semibold">Achievement Progress</h3>
          <div className="text-2xl font-bold text-primary">
            {unlockedCount}/{totalCount}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Completion</span>
            <span>{Math.round(completionPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 h-3 rounded-full">
            <motion.div
              className="bg-gradient-to-r from-primary to-blue-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Category Selector */}
      <div className="flex flex-wrap gap-2">
        {achievementCategories.map((category) => (
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
            <span className="text-sm opacity-75">
              ({category.achievements.length})
            </span>
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`bg-white border-base rounded-lg p-6 shadow-sm transition-all hover:shadow-md ${
                achievement.unlocked ? 'border-green-200 bg-green-50' : 'opacity-75'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{achievement.icon}</div>
                <div className="flex items-center space-x-2">
                  <div className={`p-1 rounded ${getRarityColor(achievement.rarity)}`}>
                    {getRarityIcon(achievement.rarity)}
                  </div>
                  {achievement.unlocked && (
                    <div className="text-green-600">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="heading text-lg font-semibold mb-2">{achievement.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
              
              {/* Progress Bar */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{achievement.progress.current}/{achievement.progress.target}</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      achievement.unlocked ? 'bg-green-500' : 'bg-primary'
                    }`}
                    style={{ width: `${(achievement.progress.current / achievement.progress.target) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* XP Reward */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-600">
                    +{achievement.xpReward} XP
                  </span>
                </div>
                
                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="text-xs text-gray-500">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              {/* Rarity Badge */}
              <div className="mt-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRarityColor(achievement.rarity)}`}>
                  {achievement.rarity}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="heading text-xl font-semibold text-gray-900 mb-2">No achievements found</h3>
          <p className="body text-gray-600 mb-4">
            {showUnlockedOnly ? 'You haven\'t unlocked any achievements yet' : 'Try adjusting your filters'}
          </p>
          {showUnlockedOnly && (
            <button
              onClick={() => setShowUnlockedOnly(false)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Show All Achievements
            </button>
          )}
        </div>
      )}

      {/* Achievement Unlock Animation */}
      <AnimatePresence>
        {showAchievementUnlock && unlockedAchievement && (
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
                  {unlockedAchievement.icon}
                </div>
                
                <div>
                  <h3 className="heading text-2xl font-bold text-gray-900 mb-2">
                    Achievement Unlocked!
                  </h3>
                  <p className="text-lg text-gray-600 mb-2">
                    {unlockedAchievement.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {unlockedAchievement.description}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span className="font-semibold">
                      +{unlockedAchievement.xpReward} XP Reward!
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleUnlockComplete}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                  >
                    Continue
                  </button>
                  <button
                    onClick={handleUnlockComplete}
                    className="flex-1 px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
