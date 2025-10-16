"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Calendar, Clock, Target, Zap, Shield, AlertTriangle, CheckCircle, TrendingUp, Star } from 'lucide-react';
import type { StreakData } from '@/types/progress';

interface StreakSystemProps {
  userId: string;
  className?: string;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  streakStartDate: string;
  lastPracticeDate: string;
  streakHistory: Array<{ date: string; practiced: boolean; xp: number }>;
  streakGoals: Array<{ days: number; achieved: boolean; achievedAt?: string }>;
  streakProtection: {
    available: boolean;
    used: boolean;
    expiresAt?: string;
  };
}

interface StreakMilestone {
  days: number;
  title: string;
  description: string;
  reward: string;
  icon: string;
  color: string;
  achieved: boolean;
  achievedAt?: string;
}

export const StreakSystem: React.FC<StreakSystemProps> = ({
  userId,
  className = ''
}) => {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProtectionModal, setShowProtectionModal] = useState(false);
  const [showStreakBreakModal, setShowStreakBreakModal] = useState(false);

  // Mock streak data - in real app, this would come from progress service
  useEffect(() => {
    const loadStreakData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock streak data
      const mockStreakData: StreakData = {
        currentStreak: 12,
        longestStreak: 18,
        totalDays: 45,
        streakStartDate: '2024-01-10T08:00:00Z',
        lastPracticeDate: '2024-01-21T19:30:00Z',
        streakHistory: Array.from({ length: 30 }, (_, i) => {
          const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
          const practiced = i < 12; // Last 12 days practiced
          return {
            date: date.toISOString().split('T')[0],
            practiced,
            xp: practiced ? Math.floor(Math.random() * 100) + 50 : 0
          };
        }),
        streakGoals: [
          { days: 3, achieved: true, achievedAt: '2024-01-13T10:00:00Z' },
          { days: 7, achieved: true, achievedAt: '2024-01-17T09:30:00Z' },
          { days: 14, achieved: false },
          { days: 30, achieved: false },
          { days: 60, achieved: false },
          { days: 100, achieved: false }
        ],
        streakProtection: {
          available: true,
          used: false,
          expiresAt: '2024-01-25T23:59:59Z'
        }
      };

      setStreakData(mockStreakData);
      setIsLoading(false);
    };

    loadStreakData();
  }, [userId]);

  const streakMilestones: StreakMilestone[] = [
    {
      days: 3,
      title: 'Getting Started',
      description: 'Three days in a row!',
      reward: '50 XP + Streak Badge',
      icon: '🌱',
      color: 'text-green-600 bg-green-50',
      achieved: streakData?.currentStreak >= 3 || false,
      achievedAt: streakData?.streakGoals.find(g => g.days === 3)?.achievedAt
    },
    {
      days: 7,
      title: 'Week Warrior',
      description: 'A full week of practice!',
      reward: '100 XP + Week Badge',
      icon: '🔥',
      color: 'text-orange-600 bg-orange-50',
      achieved: streakData?.currentStreak >= 7 || false,
      achievedAt: streakData?.streakGoals.find(g => g.days === 7)?.achievedAt
    },
    {
      days: 14,
      title: 'Fortnight Fighter',
      description: 'Two weeks strong!',
      reward: '200 XP + Fortnight Badge',
      icon: '⚡',
      color: 'text-blue-600 bg-blue-50',
      achieved: streakData?.currentStreak >= 14 || false,
      achievedAt: streakData?.streakGoals.find(g => g.days === 14)?.achievedAt
    },
    {
      days: 30,
      title: 'Month Master',
      description: 'A full month of dedication!',
      reward: '500 XP + Month Badge',
      icon: '🌟',
      color: 'text-purple-600 bg-purple-50',
      achieved: streakData?.currentStreak >= 30 || false,
      achievedAt: streakData?.streakGoals.find(g => g.days === 30)?.achievedAt
    },
    {
      days: 60,
      title: 'Dedication Demon',
      description: 'Two months of consistency!',
      reward: '1000 XP + Dedication Badge',
      icon: '👑',
      color: 'text-yellow-600 bg-yellow-50',
      achieved: streakData?.currentStreak >= 60 || false,
      achievedAt: streakData?.streakGoals.find(g => g.days === 60)?.achievedAt
    },
    {
      days: 100,
      title: 'Century Champion',
      description: '100 days of learning!',
      reward: '2000 XP + Champion Badge',
      icon: '🏆',
      color: 'text-red-600 bg-red-50',
      achieved: streakData?.currentStreak >= 100 || false,
      achievedAt: streakData?.streakGoals.find(g => g.days === 100)?.achievedAt
    }
  ];

  const getStreakStatus = () => {
    if (!streakData) return 'loading';
    
    const today = new Date().toISOString().split('T')[0];
    const lastPractice = streakData.lastPracticeDate.split('T')[0];
    const daysSinceLastPractice = Math.floor((Date.now() - new Date(streakData.lastPracticeDate).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastPractice === 0) return 'active';
    if (daysSinceLastPractice === 1) return 'at-risk';
    return 'broken';
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 100) return 'text-red-600 bg-red-50';
    if (streak >= 60) return 'text-yellow-600 bg-yellow-50';
    if (streak >= 30) return 'text-purple-600 bg-purple-50';
    if (streak >= 14) return 'text-blue-600 bg-blue-50';
    if (streak >= 7) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 100) return '🏆';
    if (streak >= 60) return '👑';
    if (streak >= 30) return '🌟';
    if (streak >= 14) return '⚡';
    if (streak >= 7) return '🔥';
    return '🌱';
  };

  const handleUseProtection = () => {
    if (streakData?.streakProtection.available && !streakData.streakProtection.used) {
      setShowProtectionModal(true);
    }
  };

  const handleProtectionConfirm = () => {
    // In real app, this would call the API to use streak protection
    setStreakData(prev => prev ? {
      ...prev,
      streakProtection: {
        ...prev.streakProtection,
        used: true
      }
    } : null);
    setShowProtectionModal(false);
  };

  const handleStreakBreak = () => {
    setShowStreakBreakModal(true);
  };

  const handleStreakBreakConfirm = () => {
    // In real app, this would call the API to break the streak
    setStreakData(prev => prev ? {
      ...prev,
      currentStreak: 0,
      streakStartDate: new Date().toISOString()
    } : null);
    setShowStreakBreakModal(false);
  };

  const streakStatus = getStreakStatus();
  const nextMilestone = streakMilestones.find(m => !m.achieved && m.days > (streakData?.currentStreak || 0));

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading streak data...</p>
        </div>
      </div>
    );
  }

  if (!streakData) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className="text-gray-600">No streak data available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Learning Streak</h2>
          <p className="body text-gray-600">
            Build consistency and unlock rewards
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {streakStatus === 'at-risk' && (
            <button
              onClick={handleUseProtection}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Use Protection</span>
            </button>
          )}
          
          {streakStatus === 'broken' && (
            <button
              onClick={handleStreakBreak}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Reset Streak</span>
            </button>
          )}
        </div>
      </div>

      {/* Current Streak Display */}
      <div className="bg-white border-base rounded-lg p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">{getStreakIcon(streakData.currentStreak)}</div>
            <div>
              <h3 className="heading text-3xl font-bold text-gray-900">
                {streakData.currentStreak} Days
              </h3>
              <p className="body text-gray-600">
                Current streak
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {streakData.longestStreak}
            </div>
            <div className="text-sm text-gray-600">Longest streak</div>
          </div>
        </div>

        {/* Streak Status */}
        <div className={`p-4 rounded-lg mb-6 ${
          streakStatus === 'active' ? 'bg-green-50 border border-green-200' :
          streakStatus === 'at-risk' ? 'bg-yellow-50 border border-yellow-200' :
          'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center space-x-3">
            {streakStatus === 'active' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {streakStatus === 'at-risk' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
            {streakStatus === 'broken' && <AlertTriangle className="w-5 h-5 text-red-600" />}
            <div>
              <h4 className="font-semibold text-gray-900">
                {streakStatus === 'active' && 'Streak Active!'}
                {streakStatus === 'at-risk' && 'Streak at Risk!'}
                {streakStatus === 'broken' && 'Streak Broken'}
              </h4>
              <p className="text-sm text-gray-600">
                {streakStatus === 'active' && 'Keep up the great work! Practice today to maintain your streak.'}
                {streakStatus === 'at-risk' && 'You haven\'t practiced today. Use streak protection or practice now!'}
                {streakStatus === 'broken' && 'Your streak has been broken. Start a new one today!'}
              </p>
            </div>
          </div>
        </div>

        {/* Next Milestone */}
        {nextMilestone && (
          <div className="bg-gradient-to-r from-primary to-blue-500 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold mb-1">Next Milestone</h4>
                <p className="text-sm opacity-90">
                  {nextMilestone.days - streakData.currentStreak} days to {nextMilestone.title}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl">{nextMilestone.icon}</div>
                <div className="text-sm opacity-90">{nextMilestone.reward}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Streak Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Total Days</h3>
            <Calendar className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {streakData.totalDays}
          </div>
          <div className="text-sm text-gray-600">
            Days practiced
          </div>
        </div>

        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Longest Streak</h3>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {streakData.longestStreak}
          </div>
          <div className="text-sm text-gray-600">
            Best streak
          </div>
        </div>

        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Streak Start</h3>
            <Clock className="w-6 h-6 text-purple-500" />
          </div>
          <div className="text-lg font-bold text-gray-900 mb-2">
            {new Date(streakData.streakStartDate).toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-600">
            Current streak began
          </div>
        </div>
      </div>

      {/* Streak History */}
      <div className="bg-white border-base rounded-lg p-6 shadow-sm">
        <h3 className="heading text-lg font-semibold mb-4">Streak History</h3>
        <div className="grid grid-cols-7 gap-2">
          {streakData.streakHistory.map((day, index) => (
            <div
              key={index}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                day.practiced
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {new Date(day.date).getDate()}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>Last 30 days</span>
          <span>
            {streakData.streakHistory.filter(d => d.practiced).length} days practiced
          </span>
        </div>
      </div>

      {/* Streak Milestones */}
      <div className="bg-white border-base rounded-lg p-6 shadow-sm">
        <h3 className="heading text-lg font-semibold mb-4">Streak Milestones</h3>
        <div className="space-y-4">
          {streakMilestones.map((milestone) => (
            <div
              key={milestone.days}
              className={`flex items-center space-x-4 p-4 rounded-lg border ${
                milestone.achieved
                  ? 'bg-green-50 border-green-200'
                  : streakData.currentStreak >= milestone.days * 0.8
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="text-3xl">{milestone.icon}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900">
                    {milestone.days} Days - {milestone.title}
                  </h4>
                  {milestone.achieved && (
                    <div className="text-green-600">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">{milestone.description}</p>
                <div className="text-sm font-medium text-primary">{milestone.reward}</div>
                {milestone.achievedAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    Achieved {new Date(milestone.achievedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Streak Protection */}
      {streakData.streakProtection.available && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Streak Protection</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-500" />
              <div>
                <h4 className="font-semibold text-gray-900">Protection Available</h4>
                <p className="text-sm text-gray-600">
                  Use this to protect your streak from breaking
                </p>
                {streakData.streakProtection.expiresAt && (
                  <p className="text-xs text-gray-500">
                    Expires {new Date(streakData.streakProtection.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleUseProtection}
              disabled={streakData.streakProtection.used}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {streakData.streakProtection.used ? 'Used' : 'Use Protection'}
            </button>
          </div>
        </div>
      )}

      {/* Protection Modal */}
      <AnimatePresence>
        {showProtectionModal && (
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
                <div className="text-6xl">🛡️</div>
                
                <div>
                  <h3 className="heading text-2xl font-bold text-gray-900 mb-2">
                    Use Streak Protection?
                  </h3>
                  <p className="text-gray-600">
                    This will protect your current streak from breaking. You can only use this once per month.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowProtectionModal(false)}
                    className="flex-1 px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProtectionConfirm}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Use Protection
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak Break Modal */}
      <AnimatePresence>
        {showStreakBreakModal && (
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
                <div className="text-6xl">💔</div>
                
                <div>
                  <h3 className="heading text-2xl font-bold text-gray-900 mb-2">
                    Break Streak?
                  </h3>
                  <p className="text-gray-600">
                    This will reset your current streak to 0. Are you sure you want to continue?
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowStreakBreakModal(false)}
                    className="flex-1 px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStreakBreakConfirm}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    Break Streak
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
