"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AccessibleButton } from '@/components/accessibility';

interface LevelOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  curriculum: string[];
}

interface LevelAssessmentProps {
  onNext: (level: LevelOption) => void;
  onSkip: () => void;
  className?: string;
}

export const LevelAssessment: React.FC<LevelAssessmentProps> = ({ onNext, onSkip, className = '' }) => {
  const [selectedLevel, setSelectedLevel] = useState<LevelOption | null>(null);
  const [showAssessment, setShowAssessment] = useState(false);

  const levelOptions: LevelOption[] = [
    {
      id: 'beginner',
      title: 'Complete beginner',
      description: 'I don\'t know any Japanese characters',
      icon: '🌱',
      curriculum: ['Hiragana basics', 'Basic vocabulary', 'Simple phrases'],
    },
    {
      id: 'hiragana',
      title: 'Know Hiragana',
      description: 'I can read and write Hiragana',
      icon: 'あ',
      curriculum: ['Katakana', 'Basic Kanji', 'Vocabulary building'],
    },
    {
      id: 'hiragana-katakana',
      title: 'Know Hiragana + Katakana',
      description: 'I can read both Hiragana and Katakana',
      icon: 'ア',
      curriculum: ['Kanji introduction', 'Grammar basics', 'Reading practice'],
    },
    {
      id: 'some-kanji',
      title: 'Some Kanji',
      description: 'I know some Kanji characters',
      icon: '漢',
      curriculum: ['Advanced Kanji', 'Grammar patterns', 'Reading comprehension'],
    },
    {
      id: 'intermediate',
      title: 'Intermediate+',
      description: 'I have solid Japanese foundation',
      icon: '上',
      curriculum: ['Advanced grammar', 'Complex Kanji', 'Conversation practice'],
    },
  ];

  const handleLevelSelect = (level: LevelOption) => {
    setSelectedLevel(level);
  };

  const handleNext = () => {
    if (selectedLevel) {
      onNext(selectedLevel);
    }
  };

  const handleAssessmentStart = () => {
    setShowAssessment(true);
  };

  if (showAssessment) {
    return (
      <div className={`min-h-screen bg-white flex items-center justify-center p-4 ${className}`}>
        <div className="max-w-2xl w-full space-y-8">
          {/* Progress */}
          <div className="text-center">
            <p className="text-sm text-gray-500">Step 2 of 4 - Assessment</p>
            <div className="w-full bg-gray-200 h-2 mt-2">
              <div className="bg-black h-2 w-2/4"></div>
            </div>
          </div>

          {/* Assessment Content */}
          <div className="text-center space-y-6">
            <h2 className="heading text-2xl font-bold">Quick Assessment</h2>
            <p className="body text-base text-gray-600">
              This 2-minute test will help us place you at the right level
            </p>
            
            <div className="bg-gray-50 border-base p-6 rounded-sm">
              <div className="space-y-4">
                <div className="text-4xl">あ</div>
                <p className="text-sm text-gray-600">What sound does this character make?</p>
                <div className="grid grid-cols-2 gap-2">
                  {['a', 'i', 'u', 'e'].map((option, index) => (
                    <button
                      key={option}
                      className="p-3 border-base hover:border-strong text-sm"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <AccessibleButton
                onClick={() => setShowAssessment(false)}
                variant="secondary"
              >
                Skip Assessment
              </AccessibleButton>
              <AccessibleButton
                onClick={() => onNext(levelOptions[0])}
                variant="primary"
              >
                Complete Assessment
              </AccessibleButton>
            </div>
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
          <p className="text-sm text-gray-500">Step 2 of 4</p>
          <div className="w-full bg-gray-200 h-2 mt-2">
            <div className="bg-black h-2 w-2/4"></div>
          </div>
        </div>

        {/* Question */}
        <div className="text-center space-y-4">
          <h2 className="heading text-2xl font-bold">What&apos;s your current level?</h2>
          <p className="body text-base text-gray-600">
            This helps us customize your learning path
          </p>
        </div>

        {/* Level Options */}
        <div className="space-y-4">
          {levelOptions.map((level, index) => (
            <motion.button
              key={level.id}
              onClick={() => handleLevelSelect(level)}
              className={`w-full p-4 border-base text-left transition-colors ${
                selectedLevel?.id === level.id
                  ? 'border-strong bg-gray-50'
                  : 'hover:border-strong'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{level.icon}</span>
                <div className="flex-1">
                  <h3 className="heading text-lg font-semibold">{level.title}</h3>
                  <p className="text-sm text-gray-600">{level.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Assessment Option */}
        <div className="text-center space-y-4">
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-4">Not sure about your level?</p>
            <AccessibleButton
              onClick={handleAssessmentStart}
              variant="secondary"
              size="sm"
            >
              Take 2-min placement test
            </AccessibleButton>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <AccessibleButton
            onClick={handleNext}
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!selectedLevel}
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
