"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccessibleButton } from '@/components/accessibility';
import { Heart, Flame, BookOpen, Target, TrendingUp, Clock, CheckCircle, ArrowRight, RefreshCw, Zap } from 'lucide-react';

interface RecoveryOnboardingProps {
  onComplete: () => void;
  className?: string;
  userData?: {
    lastLogin: string;
    streak: number;
    level: number;
    xp: number;
    charactersLearned: number;
  };
}

interface RecoveryData {
  daysAway: number;
  streakStatus: 'lost' | 'protected' | 'active';
  lastProgress: string;
  missedLessons: number;
  charactersToReview: string[];
  suggestedActions: string[];
  motivationLevel: 'low' | 'medium' | 'high';
}

export const RecoveryOnboarding: React.FC<RecoveryOnboardingProps> = ({ 
  onComplete, 
  className = '',
  userData
}) => {
  const [showRefresher, setShowRefresher] = useState(false);
  const [currentRefresherStep, setCurrentRefresherStep] = useState(0);
  const [refresherScore, setRefresherScore] = useState(0);
  const [showMotivation, setShowMotivation] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  
  const [recoveryData] = useState<RecoveryData>({
    daysAway: userData ? Math.floor((Date.now() - new Date(userData.lastLogin).getTime()) / (1000 * 60 * 60 * 24)) : 8,
    streakStatus: userData?.streak === 0 ? 'lost' : 'protected',
    lastProgress: `Hiragana: ${userData?.charactersLearned || 12}/46 characters`,
    missedLessons: Math.floor((userData ? Math.floor((Date.now() - new Date(userData.lastLogin).getTime()) / (1000 * 60 * 60 * 24)) : 8) / 2),
    charactersToReview: ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く'],
    suggestedActions: [
      'Review last 5 characters',
      'Take a quick assessment',
      'Start with today\'s lesson',
      'Set a new daily goal'
    ],
    motivationLevel: 'medium'
  });

  const refresherSteps = [
    {
      type: 'character-review',
      title: 'Character Review',
      description: 'Let\'s review the characters you\'ve learned',
      characters: recoveryData.charactersToReview.slice(0, 5)
    },
    {
      type: 'quick-quiz',
      title: 'Quick Quiz',
      description: 'Test your memory with a quick quiz',
      question: 'What sound does あ make?',
      options: ['a', 'i', 'u', 'e'],
      correct: 'a'
    },
    {
      type: 'progress-check',
      title: 'Progress Check',
      description: 'See how you\'re doing',
      progress: recoveryData.lastProgress
    }
  ];

  const handleStartRefresher = () => {
    setShowRefresher(true);
  };

  const handleSkipRefresher = () => {
    onComplete();
  };

  const handleCompleteRefresher = () => {
    onComplete();
  };

  const handleRefresherNext = () => {
    if (currentRefresherStep < refresherSteps.length - 1) {
      setCurrentRefresherStep(prev => prev + 1);
    } else {
      handleCompleteRefresher();
    }
  };

  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const getMotivationMessage = () => {
    const messages = {
      low: "Don't worry about the break! Every expert was once a beginner who didn't give up.",
      medium: "You're doing great! Taking breaks is part of the learning journey.",
      high: "You're back and ready to continue your amazing progress!"
    };
    return messages[recoveryData.motivationLevel];
  };

  const getStreakColor = () => {
    switch (recoveryData.streakStatus) {
      case 'lost': return 'text-red-600 bg-red-50 border-red-200';
      case 'protected': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (showRefresher) {
    const currentStep = refresherSteps[currentRefresherStep];
    
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 ${className}`}>
        <div className="max-w-4xl w-full space-y-8">
          {/* Progress */}
          <div className="text-center">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Refresher Step {currentRefresherStep + 1} of {refresherSteps.length}</span>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>{refresherScore} points</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentRefresherStep + 1) / refresherSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <motion.div
            key={currentRefresherStep}
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h2 className="heading text-3xl font-bold text-gray-900">{currentStep.title}</h2>
              <p className="body text-lg text-gray-600 mt-2">{currentStep.description}</p>
            </div>

            {/* Character Review Step */}
            {currentStep.type === 'character-review' && (
              <div className="bg-white border-base rounded-lg p-8 shadow-sm">
                <div className="grid grid-cols-5 gap-6">
                  {currentStep.characters?.map((char, index) => (
                    <motion.button
                      key={char}
                      className="aspect-square border-2 border-primary rounded-lg flex items-center justify-center text-4xl font-bold hover:bg-primary/5 transition-colors"
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
                <p className="text-sm text-gray-600 mt-4">Click each character to hear its pronunciation</p>
              </div>
            )}

            {/* Quick Quiz Step */}
            {currentStep.type === 'quick-quiz' && (
              <div className="bg-white border-base rounded-lg p-8 shadow-sm">
                <div className="text-8xl font-bold text-primary mb-6">あ</div>
                <p className="text-lg text-gray-600 mb-6">{currentStep.question}</p>
                <div className="grid grid-cols-2 gap-4">
                  {currentStep.options?.map((option, index) => (
                    <motion.button
                      key={option}
                      className="p-4 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-lg font-medium"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Check Step */}
            {currentStep.type === 'progress-check' && (
              <div className="bg-white border-base rounded-lg p-8 shadow-sm">
                <div className="space-y-6">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{userData?.level || 2}</div>
                      <div className="text-sm text-gray-600">Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{userData?.xp || 450}</div>
                      <div className="text-sm text-gray-600">XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{userData?.charactersLearned || 12}</div>
                      <div className="text-sm text-gray-600">Characters</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Hiragana Progress</span>
                      <span className="text-gray-600">{userData?.charactersLearned || 12}/46</span>
                    </div>
                    <div className="w-full bg-gray-200 h-3 rounded-full">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-300"
                        style={{ width: `${((userData?.charactersLearned || 12) / 46) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Actions */}
          <div className="space-y-4">
            <AccessibleButton
              onClick={handleRefresherNext}
              variant="primary"
              size="lg"
              className="w-full md:w-auto mx-auto block px-8 py-4 text-lg font-semibold"
            >
              {currentRefresherStep === refresherSteps.length - 1 ? 'Continue Learning' : 'Next Step'}
            </AccessibleButton>
            
            <div className="text-center">
              <button
                onClick={handleSkipRefresher}
                className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
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
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-8xl"
          >
            👋
          </motion.div>
          
          <motion.h1
            className="heading text-4xl font-bold text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Welcome back!
          </motion.h1>
          
          <motion.p
            className="body text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            You've been away for {recoveryData.daysAway} days. Let's get you back on track with your Japanese learning journey!
          </motion.p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Streak Status */}
          <motion.div
            className={`p-6 border-base rounded-lg shadow-sm ${getStreakColor()}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">
                {recoveryData.streakStatus === 'lost' ? <Heart className="w-8 h-8" /> : <Flame className="w-8 h-8" />}
              </div>
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
            className="p-6 border-base rounded-lg shadow-sm bg-blue-50 border-blue-200"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="flex items-center gap-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="heading text-lg font-semibold">Your Progress</h3>
                <p className="text-sm text-gray-600">{recoveryData.lastProgress}</p>
                <p className="text-sm text-gray-500">
                  {recoveryData.missedLessons} lessons missed
                </p>
              </div>
            </div>
          </motion.div>

          {/* Motivation */}
          <motion.div
            className="p-6 border-base rounded-lg shadow-sm bg-yellow-50 border-yellow-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <div className="flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-yellow-600" />
              <div>
                <h3 className="heading text-lg font-semibold">You've Got This!</h3>
                <p className="text-sm text-gray-600">
                  {getMotivationMessage()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            className="p-6 border-base rounded-lg shadow-sm bg-green-50 border-green-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <div className="space-y-3">
              <h3 className="heading text-lg font-semibold">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{userData?.level || 2}</div>
                  <div className="text-gray-600">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userData?.xp || 450}</div>
                  <div className="text-gray-600">XP</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Suggested Actions */}
        <motion.div
          className="bg-white border-base rounded-lg p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
        >
          <h3 className="heading text-xl font-semibold mb-4 text-center">What would you like to do?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recoveryData.suggestedActions.map((action, index) => (
              <motion.button
                key={action}
                onClick={() => handleActionSelect(action)}
                className={`p-4 border-base rounded-lg text-left hover:border-primary hover:bg-primary/5 transition-all ${
                  selectedAction === action ? 'border-primary bg-primary/10' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.6 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-primary">
                    {index === 0 && <RefreshCw className="w-5 h-5" />}
                    {index === 1 && <Target className="w-5 h-5" />}
                    {index === 2 && <BookOpen className="w-5 h-5" />}
                    {index === 3 && <Zap className="w-5 h-5" />}
                  </div>
                  <span className="font-medium">{action}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="space-y-4">
          <AccessibleButton
            onClick={handleStartRefresher}
            variant="primary"
            size="lg"
            className="w-full md:w-auto mx-auto block px-8 py-4 text-lg font-semibold"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Take Quick Refresher
          </AccessibleButton>
          
          <div className="text-center">
            <button
              onClick={onComplete}
              className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
            >
              Skip and go to dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
