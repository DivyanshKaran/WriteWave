"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AccessibleButton } from '@/components/accessibility';

interface PaceOption {
  id: string;
  title: string;
  description: string;
  dailyTime: string;
  weeklyDays: string;
  dailyGoal: number;
  icon: string;
  recommended?: boolean;
}

interface PaceSelectionProps {
  onNext: (pace: PaceOption) => void;
  onSkip: () => void;
  className?: string;
}

export const PaceSelection: React.FC<PaceSelectionProps> = ({ onNext, onSkip, className = '' }) => {
  const [selectedPace, setSelectedPace] = useState<PaceOption | null>(null);

  const paceOptions: PaceOption[] = [
    {
      id: 'casual',
      title: 'Casual',
      description: 'Learn at your own pace',
      dailyTime: '10 min/day',
      weeklyDays: '3 days/week',
      dailyGoal: 50,
      icon: '🐌',
    },
    {
      id: 'regular',
      title: 'Regular',
      description: 'Consistent daily practice',
      dailyTime: '15 min/day',
      weeklyDays: '5 days/week',
      dailyGoal: 75,
      icon: '🚶',
      recommended: true,
    },
    {
      id: 'intensive',
      title: 'Intensive',
      description: 'Fast-track your learning',
      dailyTime: '30 min/day',
      weeklyDays: '7 days/week',
      dailyGoal: 150,
      icon: '🏃',
    },
  ];

  const handlePaceSelect = (pace: PaceOption) => {
    setSelectedPace(pace);
  };

  const handleNext = () => {
    if (selectedPace) {
      onNext(selectedPace);
    }
  };

  return (
    <div className={`min-h-screen bg-white flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-2xl w-full space-y-8">
        {/* Progress */}
        <div className="text-center">
          <p className="text-sm text-gray-500">Step 3 of 4</p>
          <div className="w-full bg-gray-200 h-2 mt-2">
            <div className="bg-black h-2 w-3/4"></div>
          </div>
        </div>

        {/* Question */}
        <div className="text-center space-y-4">
          <h2 className="heading text-2xl font-bold">How much time can you dedicate?</h2>
          <p className="body text-base text-gray-600">
            This sets your daily learning goal
          </p>
        </div>

        {/* Pace Options */}
        <div className="space-y-4">
          {paceOptions.map((pace, index) => (
            <motion.button
              key={pace.id}
              onClick={() => handlePaceSelect(pace)}
              className={`w-full p-6 border-base text-left transition-colors ${
                selectedPace?.id === pace.id
                  ? 'border-strong bg-gray-50'
                  : 'hover:border-strong'
              } ${pace.recommended ? 'ring-2 ring-primary ring-opacity-20' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{pace.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="heading text-lg font-semibold">{pace.title}</h3>
                      {pace.recommended && (
                        <span className="text-xs px-2 py-1 bg-primary text-white rounded-sm">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{pace.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-gray-500">Daily time</p>
                    <p className="font-medium">{pace.dailyTime}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-500">Weekly schedule</p>
                    <p className="font-medium">{pace.weeklyDays}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Daily goal</span>
                    <span className="font-medium">{pace.dailyGoal} XP</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2">
                    <div 
                      className="bg-primary h-2"
                      style={{ width: `${(pace.dailyGoal / 150) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Note */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            You can change this anytime in your settings
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <AccessibleButton
            onClick={handleNext}
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!selectedPace}
          >
            Continue
          </AccessibleButton>
          
          <div className="text-center">
            <button
              onClick={onSkip}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
