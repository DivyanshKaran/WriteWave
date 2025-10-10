"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AccessibleButton } from '@/components/accessibility';

interface RecoveryOnboardingProps {
  onComplete: () => void;
  className?: string;
}

interface RecoveryData {
  daysAway: number;
  streakStatus: 'lost' | 'protected' | 'active';
  lastProgress: string;
  missedLessons: number;
}

export const RecoveryOnboarding: React.FC<RecoveryOnboardingProps> = ({ 
  onComplete, 
  className = '' 
}) => {
  const [showRefresher, setShowRefresher] = useState(false);
  const [recoveryData] = useState<RecoveryData>({
    daysAway: 8,
    streakStatus: 'lost',
    lastProgress: 'Hiragana: 12/46 characters',
    missedLessons: 3,
  });

  const handleStartRefresher = () => {
    setShowRefresher(true);
  };

  const handleSkipRefresher = () => {
    onComplete();
  };

  const handleCompleteRefresher = () => {
    onComplete();
  };

  if (showRefresher) {
    return (
      <div className={`min-h-screen bg-white flex items-center justify-center p-4 ${className}`}>
        <div className="max-w-2xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="heading text-2xl font-bold">Quick Refresher</h2>
            <p className="body text-base text-gray-600">
              Let&apos;s review what you&apos;ve learned to get back on track
            </p>
          </div>

          {/* Refresher Content */}
          <div className="space-y-6">
            {/* Character Review */}
            <div className="bg-gray-50 border-base p-6 rounded-sm">
              <h3 className="heading text-lg font-semibold mb-4">Review Characters</h3>
              <div className="grid grid-cols-5 gap-4">
                {['あ', 'い', 'う', 'え', 'お'].map((char, index) => (
                  <motion.button
                    key={char}
                    className="aspect-square border-base flex items-center justify-center text-2xl font-bold hover:border-strong"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {char}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quick Quiz */}
            <div className="bg-gray-50 border-base p-6 rounded-sm">
              <h3 className="heading text-lg font-semibold mb-4">Quick Quiz</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">あ</div>
                  <p className="text-sm text-gray-600 mb-4">What sound does this character make?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['a', 'i', 'u', 'e'].map((option, index) => (
                      <motion.button
                        key={option}
                        className="p-3 border-base hover:border-strong text-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="bg-gray-50 border-base p-6 rounded-sm">
              <h3 className="heading text-lg font-semibold mb-4">Your Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Hiragana</span>
                  <span>12/46</span>
                </div>
                <div className="w-full bg-gray-200 h-2">
                  <div className="bg-primary h-2" style={{ width: '26%' }} />
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total XP</span>
                  <span>450 XP</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Level</span>
                  <span>Level 2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <AccessibleButton
              onClick={handleCompleteRefresher}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Continue Learning
            </AccessibleButton>
            
            <div className="text-center">
              <button
                onClick={handleSkipRefresher}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Skip refresher
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-6xl"
          >
            👋
          </motion.div>
          
          <motion.h1
            className="heading text-3xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Welcome back!
          </motion.h1>
          
          <motion.p
            className="body text-base text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            You&apos;ve been away for {recoveryData.daysAway} days. Here&apos;s what you missed:
          </motion.p>
        </div>

        {/* Status Cards */}
        <div className="space-y-4">
          {/* Streak Status */}
          <motion.div
            className={`p-6 border-base rounded-sm ${
              recoveryData.streakStatus === 'lost' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {recoveryData.streakStatus === 'lost' ? '💔' : '🔥'}
              </span>
              <div>
                <h3 className="heading text-lg font-semibold">
                  {recoveryData.streakStatus === 'lost' ? 'Streak Lost' : 'Streak Protected'}
                </h3>
                <p className="text-sm text-gray-600">
                  {recoveryData.streakStatus === 'lost' 
                    ? 'Your streak has been reset. Start fresh today!'
                    : 'Your streak is still active. Keep it going!'
                  }
                </p>
              </div>
            </div>
          </motion.div>

          {/* Progress Status */}
          <motion.div
            className="p-6 border-base rounded-sm bg-blue-50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <div>
                <h3 className="heading text-lg font-semibold">Your Progress</h3>
                <p className="text-sm text-gray-600">{recoveryData.lastProgress}</p>
                <p className="text-sm text-gray-500">
                  {recoveryData.missedLessons} lessons missed
                </p>
              </div>
            </div>
          </motion.div>

          {/* Encouragement */}
          <motion.div
            className="p-6 border-base rounded-sm bg-yellow-50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">💪</span>
              <div>
                <h3 className="heading text-lg font-semibold">You&apos;ve Got This!</h3>
                <p className="text-sm text-gray-600">
                  Don&apos;t worry about the break. Many successful learners take breaks and come back stronger!
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <AccessibleButton
            onClick={handleStartRefresher}
            variant="primary"
            size="lg"
            className="w-full"
          >
            Take Quick Refresher
          </AccessibleButton>
          
          <AccessibleButton
            onClick={onComplete}
            variant="secondary"
            size="lg"
            className="w-full"
          >
            Start Fresh with Today&apos;s Lesson
          </AccessibleButton>
          
          <div className="text-center">
            <button
              onClick={onComplete}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip and go to dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
