"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeatureTourProps {
  onComplete: () => void;
  className?: string;
}

export const FeatureTour: React.FC<FeatureTourProps> = ({ onComplete, className = '' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const tourSteps = [
    {
      target: '.xp-display',
      content: 'This shows your XP and current level. Earn XP by completing lessons!',
      placement: 'bottom' as const,
    },
    {
      target: '.daily-goal',
      content: 'Your daily goal helps you stay consistent. Try to reach it every day!',
      placement: 'bottom' as const,
    },
    {
      target: '.streak-counter',
      content: 'Your streak shows how many days in a row you\'ve studied. Don\'t break it!',
      placement: 'bottom' as const,
    },
    {
      target: '.character-grid',
      content: 'Here you can practice characters you\'ve learned or discover new ones.',
      placement: 'top' as const,
    },
    {
      target: '.progress-bar',
      content: 'Track your progress through each lesson and see how far you\'ve come.',
      placement: 'top' as const,
    },
  ];

  useEffect(() => {
    // Start the tour after a short delay
    const timer = setTimeout(() => {
      setIsActive(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsActive(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    setIsActive(false);
    onComplete();
  };

  return (
    <div className={`min-h-screen bg-white p-4 ${className}`}>
      {/* Mock UI Elements for Tour */}
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-base">
          <div className="flex items-center gap-4">
            <div className="xp-display p-3 border-base">
              <div className="text-sm text-gray-500">Level 1</div>
              <div className="text-lg font-bold">150 XP</div>
            </div>
            <div className="daily-goal p-3 border-base">
              <div className="text-sm text-gray-500">Daily Goal</div>
              <div className="text-lg font-bold">75 XP</div>
            </div>
            <div className="streak-counter p-3 border-base">
              <div className="text-sm text-gray-500">Streak</div>
              <div className="text-lg font-bold">🔥 3 days</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Character Grid */}
          <div className="character-grid space-y-4">
            <h3 className="heading text-lg font-semibold">Practice Characters</h3>
            <div className="grid grid-cols-4 gap-4">
              {['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く'].map((char, index) => (
                <div
                  key={char}
                  className="aspect-square border-base flex items-center justify-center text-2xl font-bold hover:border-strong cursor-pointer"
                >
                  {char}
                </div>
              ))}
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-4">
            <h3 className="heading text-lg font-semibold">Your Progress</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Hiragana</span>
                  <span>8/46</span>
                </div>
                <div className="progress-bar w-full bg-gray-200 h-2">
                  <div className="bg-primary h-2" style={{ width: '17%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Katakana</span>
                  <span>0/46</span>
                </div>
                <div className="progress-bar w-full bg-gray-200 h-2">
                  <div className="bg-primary h-2" style={{ width: '0%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Kanji</span>
                  <span>0/100</span>
                </div>
                <div className="progress-bar w-full bg-gray-200 h-2">
                  <div className="bg-primary h-2" style={{ width: '0%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tour Instructions */}
        <div className="text-center space-y-4">
          <h2 className="heading text-2xl font-bold">Welcome to WriteWave!</h2>
          <p className="body text-base text-gray-600">
            Let&apos;s take a quick tour of the key features
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setIsActive(true)}
              className="px-4 py-2 border-base hover:border-strong"
            >
              Start Tour
            </button>
            <button
              onClick={onComplete}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 underline"
            >
              Skip Tour
            </button>
          </div>
        </div>
      </div>

      {/* Custom Tour Overlay */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white border-base p-6 rounded-sm max-w-md mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="heading text-lg font-semibold">
                    Step {currentStep + 1} of {tourSteps.length}
                  </h3>
                  <button
                    onClick={handleSkip}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <p className="text-sm text-gray-600">
                  {tourSteps[currentStep].content}
                </p>
                
                <div className="flex justify-between">
                  <button
                    onClick={handleSkip}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Skip Tour
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-black text-white text-sm hover:bg-gray-800"
                  >
                    {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
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
