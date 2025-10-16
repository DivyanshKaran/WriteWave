"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccessibleButton } from '@/components/accessibility';
import { Clock, Calendar, Target, TrendingUp, Zap, Coffee, Flame } from 'lucide-react';

interface PaceOption {
  id: string;
  title: string;
  description: string;
  dailyTime: string;
  weeklyDays: string;
  dailyGoal: number;
  icon: React.ReactNode;
  recommended?: boolean;
  estimatedCompletion: string;
  weeklyXP: number;
  monthlyXP: number;
  features: string[];
  difficulty: 'easy' | 'moderate' | 'challenging';
  successRate: number;
}

interface PaceSelectionProps {
  onNext: (pace: PaceOption) => void;
  onSkip: () => void;
  className?: string;
}

export const PaceSelection: React.FC<PaceSelectionProps> = ({ onNext, onSkip, className = '' }) => {
  const [selectedPace, setSelectedPace] = useState<PaceOption | null>(null);
  const [hoveredPace, setHoveredPace] = useState<string | null>(null);

  const paceOptions: PaceOption[] = [
    {
      id: 'casual',
      title: 'Casual',
      description: 'Learn at your own pace, no pressure',
      dailyTime: '10 min/day',
      weeklyDays: '3-4 days/week',
      dailyGoal: 50,
      icon: <Coffee className="w-6 h-6" />,
      estimatedCompletion: '12-18 months',
      weeklyXP: 200,
      monthlyXP: 800,
      features: ['Flexible schedule', 'Low pressure', 'Sustainable long-term', 'Perfect for busy schedules'],
      difficulty: 'easy',
      successRate: 85
    },
    {
      id: 'regular',
      title: 'Regular',
      description: 'Consistent daily practice for steady progress',
      dailyTime: '15 min/day',
      weeklyDays: '5-6 days/week',
      dailyGoal: 100,
      icon: <Target className="w-6 h-6" />,
      recommended: true,
      estimatedCompletion: '8-12 months',
      weeklyXP: 500,
      monthlyXP: 2000,
      features: ['Balanced approach', 'Steady progress', 'Good habit building', 'Optimal for most learners'],
      difficulty: 'moderate',
      successRate: 75
    },
    {
      id: 'intensive',
      title: 'Intensive',
      description: 'Fast-track your learning with focused practice',
      dailyTime: '30 min/day',
      weeklyDays: '7 days/week',
      dailyGoal: 200,
      icon: <Flame className="w-6 h-6" />,
      estimatedCompletion: '4-6 months',
      weeklyXP: 1400,
      monthlyXP: 5600,
      features: ['Rapid progress', 'Daily commitment', 'Maximum learning', 'Best for dedicated learners'],
      difficulty: 'challenging',
      successRate: 60
    },
    {
      id: 'custom',
      title: 'Custom',
      description: 'Set your own pace and goals',
      dailyTime: 'Variable',
      weeklyDays: 'Flexible',
      dailyGoal: 0,
      icon: <Zap className="w-6 h-6" />,
      estimatedCompletion: 'Variable',
      weeklyXP: 0,
      monthlyXP: 0,
      features: ['Personalized goals', 'Adaptive schedule', 'Custom milestones', 'Tailored to your needs'],
      difficulty: 'moderate',
      successRate: 70
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'challenging': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handlePaceSelect = (pace: PaceOption) => {
    setSelectedPace(pace);
  };

  const handleNext = () => {
    if (selectedPace) {
      onNext(selectedPace);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-6xl w-full space-y-8">
        {/* Progress */}
        <div className="text-center">
          <p className="text-sm text-gray-500">Step 3 of 4 • Pace Selection</p>
          <div className="w-full bg-gray-200 h-2 mt-2 rounded-full">
            <div className="bg-primary h-2 rounded-full w-3/4 transition-all duration-300"></div>
          </div>
        </div>

        {/* Question */}
        <div className="text-center space-y-4">
          <h2 className="heading text-3xl font-bold text-gray-900">How much time can you dedicate?</h2>
          <p className="body text-lg text-gray-600 max-w-2xl mx-auto">
            Choose a learning pace that fits your lifestyle and goals
          </p>
        </div>

        {/* Pace Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paceOptions.map((pace, index) => (
            <motion.div
              key={pace.id}
              className="relative"
              onHoverStart={() => setHoveredPace(pace.id)}
              onHoverEnd={() => setHoveredPace(null)}
            >
              <motion.button
                onClick={() => handlePaceSelect(pace)}
                className={`p-6 bg-white border-base text-left transition-all duration-200 rounded-lg w-full group ${
                  selectedPace?.id === pace.id
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'hover:border-primary hover:shadow-lg'
                } ${pace.recommended ? 'ring-2 ring-primary ring-opacity-30' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Recommended Badge */}
                {pace.recommended && (
                  <div className="absolute -top-2 -right-2 bg-primary text-white text-xs px-3 py-1 rounded-full font-medium">
                    Recommended
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-primary group-hover:scale-110 transition-transform">
                      {pace.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="heading text-lg font-semibold">{pace.title}</h3>
                      <p className="text-sm text-gray-600">{pace.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-gray-500">Daily time</p>
                        <p className="font-medium">{pace.dailyTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-gray-500">Weekly schedule</p>
                        <p className="font-medium">{pace.weeklyDays}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Daily goal</span>
                      <span className="font-medium">{pace.dailyGoal} XP</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((pace.dailyGoal / 200) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-3 h-3 text-gray-500" />
                      <div>
                        <p className="text-gray-500">Weekly XP</p>
                        <p className="font-medium">{pace.weeklyXP}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-3 h-3 text-gray-500" />
                      <div>
                        <p className="text-gray-500">Success rate</p>
                        <p className="font-medium">{pace.successRate}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(pace.difficulty)}`}>
                      {pace.difficulty}
                    </div>
                    <div className="text-xs text-gray-500">
                      {pace.estimatedCompletion}
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* Hover Details */}
              <AnimatePresence>
                {hoveredPace === pace.id && (
                  <motion.div
                    className="absolute top-full left-0 right-0 mt-2 bg-white border-base shadow-lg rounded-lg p-4 z-10"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h4 className="font-semibold text-sm mb-2">What you get:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {pace.features.map((feature, idx) => (
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

        {/* Selected Pace Summary */}
        {selectedPace && (
          <motion.div
            className="bg-white border-base rounded-lg p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-primary">
                  {selectedPace.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedPace.title}</h3>
                  <p className="text-sm text-gray-600">{selectedPace.description}</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div>{selectedPace.dailyTime}</div>
                <div>{selectedPace.weeklyDays}</div>
                <div>{selectedPace.estimatedCompletion}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Note */}
        <div className="text-center bg-white border-base rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">
            💡 <strong>Tip:</strong> You can change your pace anytime in your settings. Start with what feels comfortable!
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <AccessibleButton
            onClick={handleNext}
            variant="primary"
            size="lg"
            className="w-full md:w-auto mx-auto block px-8 py-4 text-lg font-semibold"
            disabled={!selectedPace}
          >
            Continue to Account Creation
          </AccessibleButton>
          
          <div className="text-center">
            <button
              onClick={onSkip}
              className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
