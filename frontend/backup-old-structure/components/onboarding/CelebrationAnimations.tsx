"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CelebrationProps {
  type: 'first-character' | 'first-lesson' | 'first-streak' | 'first-week';
  onComplete: () => void;
  className?: string;
}

export const CelebrationAnimations: React.FC<CelebrationProps> = ({ 
  type, 
  onComplete, 
  className = '' 
}) => {
  const [showCelebration, setShowCelebration] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti after a short delay
    const confettiTimer = setTimeout(() => {
      setShowConfetti(true);
    }, 500);

    // Auto-complete after 3 seconds
    const completeTimer = setTimeout(() => {
      setShowCelebration(false);
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const getCelebrationContent = () => {
    switch (type) {
      case 'first-character':
        return {
          title: 'Great start! 🎉',
          message: 'You\'ve learned your first character!',
          xp: 'Earned 10 XP',
          progress: '1 / 46 Hiragana characters',
          nextAction: 'Ready to learn more?',
        };
      case 'first-lesson':
        return {
          title: 'Lesson Master! 🏆',
          message: 'You\'ve completed your first lesson!',
          xp: 'Earned 50 XP',
          progress: 'Level 1 → Level 2',
          nextAction: 'Keep up the great work!',
        };
      case 'first-streak':
        return {
          title: '2 days in a row! 🔥',
          message: 'You\'re building a great habit!',
          xp: 'Streak bonus: 25 XP',
          progress: '2-day streak',
          nextAction: 'Come back tomorrow!',
        };
      case 'first-week':
        return {
          title: 'You\'re on your way! 🚀',
          message: 'One week of consistent learning!',
          xp: 'Weekly bonus: 100 XP',
          progress: '7-day streak',
          nextAction: 'You\'re doing amazing!',
        };
      default:
        return {
          title: 'Congratulations! 🎉',
          message: 'Great job!',
          xp: 'Earned XP',
          progress: 'Progress made',
          nextAction: 'Keep going!',
        };
    }
  };

  const content = getCelebrationContent();

  // Confetti particles
  const confettiParticles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    rotation: Math.random() * 360,
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 5)],
  }));

  return (
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Confetti */}
          <AnimatePresence>
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none">
                {confettiParticles.map((particle) => (
                  <motion.div
                    key={particle.id}
                    className="absolute w-2 h-2"
                    style={{
                      left: `${particle.x}%`,
                      top: `${particle.y}%`,
                      backgroundColor: particle.color,
                    }}
                    initial={{ 
                      opacity: 1, 
                      scale: 0,
                      rotate: particle.rotation 
                    }}
                    animate={{ 
                      opacity: 0, 
                      scale: 1,
                      y: [0, -100, 0],
                      rotate: particle.rotation + 360 
                    }}
                    transition={{ 
                      duration: 2,
                      ease: 'easeOut'
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Celebration Card */}
          <motion.div
            className="bg-white border-base p-8 rounded-sm max-w-md w-full mx-4 text-center relative overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 opacity-50" />
            
            <div className="relative z-10 space-y-6">
              {/* Icon */}
              <motion.div
                className="text-6xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {type === 'first-character' && '🎉'}
                {type === 'first-lesson' && '🏆'}
                {type === 'first-streak' && '🔥'}
                {type === 'first-week' && '🚀'}
              </motion.div>

              {/* Title */}
              <motion.h2
                className="heading text-2xl font-bold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {content.title}
              </motion.h2>

              {/* Message */}
              <motion.p
                className="body text-base text-gray-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {content.message}
              </motion.p>

              {/* XP Reward */}
              <motion.div
                className="bg-green-50 border-base p-4 rounded-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-green-600 font-bold">+{content.xp}</span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <motion.div
                      className="h-2 bg-green-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '60%' }}
                      transition={{ duration: 1, delay: 0.8 }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Progress */}
              <motion.div
                className="text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                {content.progress}
              </motion.div>

              {/* Next Action */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <p className="text-sm text-gray-600">{content.nextAction}</p>
                <button
                  onClick={() => {
                    setShowCelebration(false);
                    onComplete();
                  }}
                  className="px-6 py-2 bg-black text-white border-base hover:bg-gray-800 transition-colors"
                >
                  Continue
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
