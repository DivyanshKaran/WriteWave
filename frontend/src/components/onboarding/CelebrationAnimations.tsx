"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, Flame, Rocket, Sparkles, CheckCircle, ArrowRight, Share2, Target } from 'lucide-react';

interface CelebrationProps {
  type: 'first-character' | 'first-lesson' | 'first-streak' | 'first-week';
  onComplete: () => void;
  className?: string;
  character?: string;
  xpEarned?: number;
  levelUp?: boolean;
  streakDays?: number;
}

export const CelebrationAnimations: React.FC<CelebrationProps> = ({ 
  type, 
  onComplete, 
  className = '',
  character = 'あ',
  xpEarned = 10,
  levelUp = false,
  streakDays = 1
}) => {
  const [showCelebration, setShowCelebration] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [currentXP, setCurrentXP] = useState(0);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    // Trigger animations in sequence
    const confettiTimer = setTimeout(() => {
      setShowConfetti(true);
    }, 300);

    const sparklesTimer = setTimeout(() => {
      setShowSparkles(true);
    }, 600);

    const xpTimer = setTimeout(() => {
      setShowXPAnimation(true);
      // Animate XP counter
      const interval = setInterval(() => {
        setCurrentXP(prev => {
          if (prev >= xpEarned) {
            clearInterval(interval);
            return xpEarned;
          }
          return prev + Math.ceil(xpEarned / 20);
        });
      }, 50);
    }, 1000);

    const shareTimer = setTimeout(() => {
      setShowShare(true);
    }, 2000);

    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(sparklesTimer);
      clearTimeout(xpTimer);
      clearTimeout(shareTimer);
    };
  }, [xpEarned]);

  const getCelebrationContent = () => {
    switch (type) {
      case 'first-character':
        return {
          title: 'Amazing! You learned あ!',
          message: `You've mastered your first Hiragana character. ${character} sounds like "ah"!`,
          xp: `+${xpEarned} XP`,
          progress: '1 / 46 Hiragana characters',
          nextAction: 'Ready to learn more characters?',
          icon: <Star className="w-12 h-12 text-yellow-500" />,
          color: 'from-yellow-400 to-orange-500',
          achievements: ['First Character Mastered', 'Hiragana Beginner']
        };
      case 'first-lesson':
        return {
          title: 'Lesson Complete!',
          message: 'You\'ve finished your first lesson. Great job staying focused!',
          xp: `+${xpEarned} XP`,
          progress: levelUp ? 'Level Up! 🎉' : 'Keep going!',
          nextAction: 'Ready for the next challenge?',
          icon: <Trophy className="w-12 h-12 text-gold-500" />,
          color: 'from-purple-400 to-pink-500',
          achievements: ['First Lesson Complete', 'Dedicated Learner']
        };
      case 'first-streak':
        return {
          title: `${streakDays} Days Strong!`,
          message: 'You\'re building an amazing learning habit. Consistency is key!',
          xp: `+${xpEarned} XP Streak Bonus`,
          progress: `${streakDays}-day streak`,
          nextAction: 'Come back tomorrow to keep it going!',
          icon: <Flame className="w-12 h-12 text-orange-500" />,
          color: 'from-red-400 to-orange-500',
          achievements: ['Streak Master', 'Consistent Learner']
        };
      case 'first-week':
        return {
          title: 'One Week Complete!',
          message: 'Seven days of consistent learning. You\'re on fire!',
          xp: `+${xpEarned} XP Weekly Bonus`,
          progress: '7-day streak',
          nextAction: 'You\'re doing incredible!',
          icon: <Rocket className="w-12 h-12 text-blue-500" />,
          color: 'from-blue-400 to-purple-500',
          achievements: ['Week Warrior', 'Learning Champion']
        };
      default:
        return {
          title: 'Congratulations!',
          message: 'Great job on your progress!',
          xp: `+${xpEarned} XP`,
          progress: 'Progress made',
          nextAction: 'Keep going!',
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          color: 'from-green-400 to-blue-500',
          achievements: ['Achievement Unlocked']
        };
    }
  };

  const content = getCelebrationContent();

  // Confetti particles
  const confettiParticles = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    rotation: Math.random() * 360,
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'][Math.floor(Math.random() * 7)],
    size: Math.random() * 8 + 4,
  }));

  // Sparkle particles
  const sparkleParticles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    rotation: Math.random() * 360,
  }));

  return (
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          className={`fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 ${className}`}
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
                    className="absolute rounded-full"
                    style={{
                      left: `${particle.x}%`,
                      top: `${particle.y}%`,
                      backgroundColor: particle.color,
                      width: particle.size,
                      height: particle.size,
                    }}
                    initial={{ 
                      opacity: 1, 
                      scale: 0,
                      rotate: particle.rotation,
                      y: -50
                    }}
                    animate={{ 
                      opacity: [1, 1, 0], 
                      scale: [0, 1, 1],
                      y: [-50, 0, 100],
                      rotate: particle.rotation + 720,
                      x: [0, Math.random() * 100 - 50, Math.random() * 200 - 100]
                    }}
                    transition={{ 
                      duration: 3,
                      ease: 'easeOut',
                      times: [0, 0.3, 1]
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Sparkles */}
          <AnimatePresence>
            {showSparkles && (
              <div className="absolute inset-0 pointer-events-none">
                {sparkleParticles.map((particle) => (
                  <motion.div
                    key={particle.id}
                    className="absolute"
                    style={{
                      left: `${particle.x}%`,
                      top: `${particle.y}%`,
                    }}
                    initial={{ 
                      opacity: 0, 
                      scale: 0,
                      rotate: particle.rotation 
                    }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      scale: [0, 1, 0],
                      rotate: particle.rotation + 360 
                    }}
                    transition={{ 
                      duration: 2,
                      ease: 'easeOut',
                      delay: Math.random() * 0.5
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Celebration Card */}
          <motion.div
            className="bg-white border-base rounded-2xl max-w-lg w-full mx-4 text-center relative overflow-hidden shadow-2xl"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Background decoration */}
            <div className={`absolute inset-0 bg-gradient-to-br ${content.color} opacity-10`} />
            
            <div className="relative z-10 p-8 space-y-6">
              {/* Character Display (for first character) */}
              {type === 'first-character' && (
                <motion.div
                  className="text-8xl font-bold text-primary mb-4"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                >
                  {character}
                </motion.div>
              )}

              {/* Icon */}
              <motion.div
                className="flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {content.icon}
              </motion.div>

              {/* Title */}
              <motion.h2
                className="heading text-3xl font-bold text-gray-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {content.title}
              </motion.h2>

              {/* Message */}
              <motion.p
                className="body text-lg text-gray-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {content.message}
              </motion.p>

              {/* XP Reward */}
              <motion.div
                className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="flex items-center justify-center gap-3">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <span className="text-2xl font-bold text-green-600">
                    {showXPAnimation ? `+${currentXP} XP` : content.xp}
                  </span>
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="mt-3 w-full bg-gray-200 h-3 rounded-full">
                  <motion.div
                    className="h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: showXPAnimation ? '75%' : '0%' }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                </div>
              </motion.div>

              {/* Achievements */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <h4 className="text-sm font-medium text-gray-700">Achievements Unlocked:</h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {content.achievements.map((achievement, index) => (
                    <motion.span
                      key={achievement}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                    >
                      {achievement}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Progress */}
              <motion.div
                className="text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                {content.progress}
              </motion.div>

              {/* Actions */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <p className="text-sm text-gray-600">{content.nextAction}</p>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setShowCelebration(false);
                      onComplete();
                    }}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium flex items-center space-x-2"
                  >
                    <span>Continue Learning</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <AnimatePresence>
                    {showShare && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="px-4 py-3 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors flex items-center space-x-2"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
