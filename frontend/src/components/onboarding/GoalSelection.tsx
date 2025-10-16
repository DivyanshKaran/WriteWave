"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccessibleButton } from '@/components/accessibility';
import { BookOpen, Plane, Briefcase, Heart, Target, Clock, Users, TrendingUp } from 'lucide-react';

interface GoalOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  jlptLevel?: string;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  characters: number;
  features: string[];
  popular?: boolean;
}

interface GoalSelectionProps {
  onNext: (goal: GoalOption) => void;
  onSkip: () => void;
  className?: string;
}

export const GoalSelection: React.FC<GoalSelectionProps> = ({ onNext, onSkip, className = '' }) => {
  const [selectedGoal, setSelectedGoal] = useState<GoalOption | null>(null);
  const [showJLPTLevels, setShowJLPTLevels] = useState(false);
  const [hoveredGoal, setHoveredGoal] = useState<string | null>(null);

  const goalOptions: GoalOption[] = [
    {
      id: 'jlpt',
      title: 'Pass JLPT',
      description: 'Prepare for the Japanese Language Proficiency Test',
      icon: <BookOpen className="w-6 h-6" />,
      estimatedTime: '6-18 months',
      difficulty: 'intermediate',
      characters: 2000,
      features: ['Structured curriculum', 'Practice tests', 'Progress tracking', 'JLPT-specific content'],
      popular: true
    },
    {
      id: 'manga',
      title: 'Read manga/anime',
      description: 'Understand Japanese comics and animation',
      icon: <BookOpen className="w-6 h-6" />,
      estimatedTime: '3-12 months',
      difficulty: 'beginner',
      characters: 500,
      features: ['Pop culture vocabulary', 'Visual learning', 'Context clues', 'Entertainment focus']
    },
    {
      id: 'travel',
      title: 'Travel to Japan',
      description: 'Navigate Japan with basic Japanese skills',
      icon: <Plane className="w-6 h-6" />,
      estimatedTime: '2-6 months',
      difficulty: 'beginner',
      characters: 200,
      features: ['Essential phrases', 'Travel vocabulary', 'Cultural tips', 'Practical scenarios']
    },
    {
      id: 'business',
      title: 'Business/work',
      description: 'Use Japanese in professional settings',
      icon: <Briefcase className="w-6 h-6" />,
      estimatedTime: '12-24 months',
      difficulty: 'advanced',
      characters: 1500,
      features: ['Business vocabulary', 'Formal language', 'Email writing', 'Meeting phrases']
    },
    {
      id: 'personal',
      title: 'Personal interest',
      description: 'Learn Japanese for fun and cultural appreciation',
      icon: <Heart className="w-6 h-6" />,
      estimatedTime: 'Flexible',
      difficulty: 'beginner',
      characters: 300,
      features: ['Self-paced learning', 'Cultural exploration', 'Creative writing', 'Personal goals']
    },
  ];

  const jlptLevels = [
    { level: 'N5', title: 'Basic Level', description: '100 kanji, 800 vocabulary', time: '6-12 months', characters: 100 },
    { level: 'N4', title: 'Elementary Level', description: '300 kanji, 1,500 vocabulary', time: '12-18 months', characters: 300 },
    { level: 'N3', title: 'Intermediate Level', description: '650 kanji, 3,750 vocabulary', time: '18-24 months', characters: 650 },
    { level: 'N2', title: 'Upper Intermediate', description: '1,000 kanji, 6,000 vocabulary', time: '24-36 months', characters: 1000 },
    { level: 'N1', title: 'Advanced Level', description: '2,000 kanji, 10,000 vocabulary', time: '36+ months', characters: 2000 }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleGoalSelect = (goal: GoalOption) => {
    if (goal.id === 'jlpt') {
      setShowJLPTLevels(true);
    } else {
      setSelectedGoal(goal);
    }
  };

  const handleJLPTLevelSelect = (levelData: typeof jlptLevels[0]) => {
    const goalWithLevel = { 
      ...goalOptions[0], 
      jlptLevel: levelData.level,
      estimatedTime: levelData.time,
      characters: levelData.characters,
      title: `Pass JLPT ${levelData.level}`,
      description: `${levelData.title} - ${levelData.description}`
    };
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
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 ${className}`}>
        <div className="max-w-4xl w-full space-y-8">
          {/* Progress */}
          <div className="text-center">
            <p className="text-sm text-gray-500">Step 1 of 4 • Goal Selection</p>
            <div className="w-full bg-gray-200 h-2 mt-2 rounded-full">
              <div className="bg-primary h-2 rounded-full w-1/4 transition-all duration-300"></div>
            </div>
          </div>

          {/* Question */}
          <div className="text-center space-y-4">
            <h2 className="heading text-3xl font-bold text-gray-900">What JLPT level?</h2>
            <p className="body text-lg text-gray-600">
              Choose your target proficiency level to personalize your learning path
            </p>
          </div>

          {/* JLPT Levels */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jlptLevels.map((levelData, index) => (
              <motion.button
                key={levelData.level}
                onClick={() => handleJLPTLevelSelect(levelData)}
                className="p-6 bg-white border-base hover:border-primary hover:shadow-lg text-left transition-all duration-200 rounded-lg group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-primary group-hover:text-primary-dark">
                      {levelData.level}
                    </div>
                    <div className="text-sm text-gray-500">{levelData.time}</div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{levelData.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{levelData.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Target className="w-3 h-3" />
                        <span>{levelData.characters} kanji</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={() => setShowJLPTLevels(false)}
              className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
            >
              ← Back to goals
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-6xl w-full space-y-8">
        {/* Progress */}
        <div className="text-center">
          <p className="text-sm text-gray-500">Step 1 of 4 • Goal Selection</p>
          <div className="w-full bg-gray-200 h-2 mt-2 rounded-full">
            <div className="bg-primary h-2 rounded-full w-1/4 transition-all duration-300"></div>
          </div>
        </div>

        {/* Question */}
        <div className="text-center space-y-4">
          <h2 className="heading text-3xl font-bold text-gray-900">What&apos;s your goal?</h2>
          <p className="body text-lg text-gray-600 max-w-2xl mx-auto">
            Help us personalize your learning experience and create the perfect path for you
          </p>
        </div>

        {/* Goal Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goalOptions.map((goal, index) => (
            <motion.div
              key={goal.id}
              className="relative"
              onHoverStart={() => setHoveredGoal(goal.id)}
              onHoverEnd={() => setHoveredGoal(null)}
            >
              <motion.button
                onClick={() => handleGoalSelect(goal)}
                className={`p-6 bg-white border-base text-left transition-all duration-200 rounded-lg w-full group ${
                  selectedGoal?.id === goal.id
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'hover:border-primary hover:shadow-lg'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Popular Badge */}
                {goal.popular && (
                  <div className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full font-medium">
                    Popular
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="text-primary group-hover:scale-110 transition-transform">
                      {goal.icon}
                    </div>
                    <h3 className="heading text-lg font-semibold">{goal.title}</h3>
                  </div>
                  
                  <p className="text-sm text-gray-600">{goal.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{goal.estimatedTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="w-3 h-3" />
                        <span>{goal.characters} characters</span>
                      </div>
                    </div>
                    
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(goal.difficulty)}`}>
                      {goal.difficulty}
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* Hover Details */}
              <AnimatePresence>
                {hoveredGoal === goal.id && (
                  <motion.div
                    className="absolute top-full left-0 right-0 mt-2 bg-white border-base shadow-lg rounded-lg p-4 z-10"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h4 className="font-semibold text-sm mb-2">What you'll learn:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {goal.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-primary rounded-full"></div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Selected Goal Summary */}
        {selectedGoal && (
          <motion.div
            className="bg-white border-base rounded-lg p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-primary">
                  {selectedGoal.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedGoal.title}</h3>
                  <p className="text-sm text-gray-600">{selectedGoal.description}</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div>{selectedGoal.estimatedTime}</div>
                <div>{selectedGoal.characters} characters</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <AccessibleButton
            onClick={handleNext}
            variant="primary"
            size="lg"
            className="w-full md:w-auto mx-auto block px-8 py-4 text-lg font-semibold"
            disabled={!selectedGoal}
          >
            Continue to Level Assessment
          </AccessibleButton>
          
          <div className="text-center">
            <button
              onClick={onSkip}
              className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
            >
              I&apos;ll decide later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
