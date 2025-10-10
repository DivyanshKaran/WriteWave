"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AccessibleButton } from '@/components/accessibility';

interface WelcomeScreenProps {
  onStart: () => void;
  className?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, className = '' }) => {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStep(1);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`min-h-screen bg-white flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Character Animation */}
        <div className="relative">
          <motion.div
            className="text-9xl font-bold text-black"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            大
          </motion.div>
          
          {/* Stroke animation overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: animationStep === 1 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 200 200"
              className="absolute inset-0"
            >
              {/* Stroke paths for 大 character */}
              <motion.path
                d="M50 50 L150 50"
                stroke="black"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
              <motion.path
                d="M100 50 L100 150"
                stroke="black"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 1.3 }}
              />
              <motion.path
                d="M50 100 L150 100"
                stroke="black"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 2.1 }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Headlines */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h1 className="heading text-3xl font-bold text-black">
            Master Japanese Characters
          </h1>
          <p className="body text-base text-gray-600">
            Learn Hiragana, Katakana, and Kanji through interactive practice and spaced repetition
          </p>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-sm text-gray-500">Join 10,000+ learners</p>
          <p className="text-sm text-gray-500">5 minutes to get started</p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <AccessibleButton
            onClick={onStart}
            variant="primary"
            size="lg"
            className="w-full"
          >
            Start learning free
          </AccessibleButton>
        </motion.div>

        {/* Skip Option */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <button
            onClick={onStart}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Skip introduction
          </button>
        </motion.div>
      </div>
    </div>
  );
};
