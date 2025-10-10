"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AccessibleButton } from '@/components/accessibility';

interface GoalOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  jlptLevel?: string;
}

interface GoalSelectionProps {
  onNext: (goal: GoalOption) => void;
  onSkip: () => void;
  className?: string;
}

export const GoalSelection: React.FC<GoalSelectionProps> = ({ onNext, onSkip, className = '' }) => {
  const [selectedGoal, setSelectedGoal] = useState<GoalOption | null>(null);
  const [showJLPTLevels, setShowJLPTLevels] = useState(false);

  const goalOptions: GoalOption[] = [
    {
      id: 'jlpt',
      title: 'Pass JLPT',
      description: 'Prepare for the Japanese Language Proficiency Test',
      icon: '📚',
    },
    {
      id: 'manga',
      title: 'Read manga/anime',
      description: 'Understand Japanese comics and animation',
      icon: '📖',
    },
    {
      id: 'travel',
      title: 'Travel to Japan',
      description: 'Navigate Japan with basic Japanese skills',
      icon: '✈️',
    },
    {
      id: 'business',
      title: 'Business/work',
      description: 'Use Japanese in professional settings',
      icon: '💼',
    },
    {
      id: 'personal',
      title: 'Personal interest',
      description: 'Learn Japanese for fun and cultural appreciation',
      icon: '🎌',
    },
  ];

  const jlptLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];

  const handleGoalSelect = (goal: GoalOption) => {
    if (goal.id === 'jlpt') {
      setShowJLPTLevels(true);
    } else {
      setSelectedGoal(goal);
    }
  };

  const handleJLPTLevelSelect = (level: string) => {
    const goalWithLevel = { ...goalOptions[0], jlptLevel: level };
    setSelectedGoal(goalWithLevel);
    setShowJLPTLevels(false);
  };

  const handleNext = () => {
    if (selectedGoal) {
      onNext(selectedGoal);
    }
  };

  if (showJLPTLevels) {
    return (
      <div className={`min-h-screen bg-white flex items-center justify-center p-4 ${className}`}>
        <div className="max-w-2xl w-full space-y-8">
          {/* Progress */}
          <div className="text-center">
            <p className="text-sm text-gray-500">Step 1 of 4</p>
            <div className="w-full bg-gray-200 h-2 mt-2">
              <div className="bg-black h-2 w-1/4"></div>
            </div>
          </div>

          {/* Question */}
          <div className="text-center space-y-4">
            <h2 className="heading text-2xl font-bold">What JLPT level?</h2>
            <p className="body text-base text-gray-600">
              Choose your target proficiency level
            </p>
          </div>

          {/* JLPT Levels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jlptLevels.map((level, index) => (
              <motion.button
                key={level}
                onClick={() => handleJLPTLevelSelect(level)}
                className="p-6 border-base hover:border-strong text-left transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary">N{level.slice(1)}</div>
                  <div className="text-sm text-gray-600">
                    {level === 'N5' && 'Basic level - 100 kanji, 800 vocabulary'}
                    {level === 'N4' && 'Elementary level - 300 kanji, 1,500 vocabulary'}
                    {level === 'N3' && 'Intermediate level - 650 kanji, 3,750 vocabulary'}
                    {level === 'N2' && 'Upper intermediate - 1,000 kanji, 6,000 vocabulary'}
                    {level === 'N1' && 'Advanced level - 2,000 kanji, 10,000 vocabulary'}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={() => setShowJLPTLevels(false)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              ← Back to goals
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-2xl w-full space-y-8">
        {/* Progress */}
        <div className="text-center">
          <p className="text-sm text-gray-500">Step 1 of 4</p>
          <div className="w-full bg-gray-200 h-2 mt-2">
            <div className="bg-black h-2 w-1/4"></div>
          </div>
        </div>

        {/* Question */}
        <div className="text-center space-y-4">
          <h2 className="heading text-2xl font-bold">What&apos;s your goal?</h2>
          <p className="body text-base text-gray-600">
            Help us personalize your learning experience
          </p>
        </div>

        {/* Goal Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goalOptions.map((goal, index) => (
            <motion.button
              key={goal.id}
              onClick={() => handleGoalSelect(goal)}
              className={`p-6 border-base text-left transition-colors ${
                selectedGoal?.id === goal.id
                  ? 'border-strong bg-gray-50'
                  : 'hover:border-strong'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{goal.icon}</span>
                  <h3 className="heading text-lg font-semibold">{goal.title}</h3>
                </div>
                <p className="text-sm text-gray-600">{goal.description}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <AccessibleButton
            onClick={handleNext}
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!selectedGoal}
          >
            Continue
          </AccessibleButton>
          
          <div className="text-center">
            <button
              onClick={onSkip}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              I&apos;ll decide later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
