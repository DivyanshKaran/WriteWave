"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccessibleButton } from '@/components/accessibility';
import { Play, Users, Clock, Star, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
  className?: string;
}

interface CharacterPreview {
  character: string;
  type: 'hiragana' | 'katakana' | 'kanji';
  meaning: string;
  reading: string;
  strokeCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const characterPreviews: CharacterPreview[] = [
  {
    character: 'あ',
    type: 'hiragana',
    meaning: 'ah',
    reading: 'a',
    strokeCount: 3,
    difficulty: 'beginner'
  },
  {
    character: 'ア',
    type: 'katakana',
    meaning: 'ah',
    reading: 'a',
    strokeCount: 2,
    difficulty: 'beginner'
  },
  {
    character: '大',
    type: 'kanji',
    meaning: 'big, large',
    reading: 'dai, tai, oo',
    strokeCount: 3,
    difficulty: 'intermediate'
  }
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, className = '' }) => {
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [showCharacterDetails, setShowCharacterDetails] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStep(1);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCharacterIndex((prev) => (prev + 1) % characterPreviews.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentCharacter = characterPreviews[currentCharacterIndex];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hiragana': return 'text-blue-600 bg-blue-50';
      case 'katakana': return 'text-purple-600 bg-purple-50';
      case 'kanji': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-2xl w-full space-y-8 text-center">
        {/* Interactive Character Preview */}
        <div className="relative">
          <motion.div
            className="relative"
            onHoverStart={() => setShowCharacterDetails(true)}
            onHoverEnd={() => setShowCharacterDetails(false)}
          >
            {/* Main Character Display */}
            <motion.div
              key={currentCharacterIndex}
              className="text-9xl font-bold text-black mb-4 cursor-pointer"
              initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotateY: 90 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {currentCharacter.character}
            </motion.div>
            
            {/* Character Type Badge */}
            <motion.div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(currentCharacter.type)}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {currentCharacter.type.charAt(0).toUpperCase() + currentCharacter.type.slice(1)}
            </motion.div>
          </motion.div>

          {/* Character Details Overlay */}
          <AnimatePresence>
            {showCharacterDetails && (
              <motion.div
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-white border-base shadow-lg rounded-lg p-4 min-w-[200px]"
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">{currentCharacter.character}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(currentCharacter.difficulty)}`}>
                      {currentCharacter.difficulty}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div><strong>Meaning:</strong> {currentCharacter.meaning}</div>
                    <div><strong>Reading:</strong> {currentCharacter.reading}</div>
                    <div><strong>Strokes:</strong> {currentCharacter.strokeCount}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Character Navigation Dots */}
          <div className="flex justify-center space-x-2 mt-4">
            {characterPreviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentCharacterIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentCharacterIndex ? 'bg-black' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Enhanced Headlines */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h1 className="heading text-4xl lg:text-5xl font-bold text-gray-900">
            Master Japanese Characters
            <span className="block text-primary text-3xl lg:text-4xl mt-2">
              with AI-Powered Feedback
            </span>
          </h1>
          <p className="body text-lg text-gray-600 max-w-xl mx-auto">
            Learn Hiragana, Katakana, and Kanji through interactive practice, 
            real-time OCR feedback, and personalized spaced repetition
          </p>
        </motion.div>

        {/* Enhanced Social Proof */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>10,000+ learners</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>5 min to start</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Star className="w-4 h-4" />
            <span>4.9/5 rating</span>
          </div>
        </motion.div>

        {/* Interactive Preview Features */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <div className="bg-white/80 backdrop-blur-sm border-base rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">✍️</div>
            <h3 className="font-semibold text-sm mb-1">Interactive Writing</h3>
            <p className="text-xs text-gray-600">Practice with real-time feedback</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border-base rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-sm mb-1">Smart Learning</h3>
            <p className="text-xs text-gray-600">AI adapts to your progress</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border-base rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">🏆</div>
            <h3 className="font-semibold text-sm mb-1">Gamified Progress</h3>
            <p className="text-xs text-gray-600">Earn XP and achievements</p>
          </div>
        </motion.div>

        {/* Enhanced CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="space-y-4"
        >
          <AccessibleButton
            onClick={onStart}
            variant="primary"
            size="lg"
            className="w-full md:w-auto px-8 py-4 text-lg font-semibold group"
          >
            Start Learning Free
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </AccessibleButton>
          
          <div className="text-sm text-gray-500">
            No credit card required • Free forever
          </div>
        </motion.div>

        {/* Skip Option */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          <button
            onClick={onStart}
            className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
          >
            Skip introduction
          </button>
        </motion.div>
      </div>
    </div>
  );
};
