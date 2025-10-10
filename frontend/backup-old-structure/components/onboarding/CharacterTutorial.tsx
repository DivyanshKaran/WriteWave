"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccessibleButton } from '@/components/accessibility';

interface CharacterTutorialProps {
  onComplete: () => void;
  className?: string;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  action: string;
  character: string;
  strokeOrder: number[];
}

export const CharacterTutorial: React.FC<CharacterTutorialProps> = ({ onComplete, className = '' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingComplete, setDrawingComplete] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'introduction',
      title: 'Meet あ (A)',
      description: 'This is the first Hiragana character. It sounds like "ah" as in "father".',
      action: 'Click to hear pronunciation',
      character: 'あ',
      strokeOrder: [1, 2, 3],
    },
    {
      id: 'trace',
      title: 'Trace the character',
      description: 'Follow the stroke order shown. Take your time and be precise.',
      action: 'Trace following the guide',
      character: 'あ',
      strokeOrder: [1, 2, 3],
    },
    {
      id: 'memory',
      title: 'Write from memory',
      description: 'Now try writing あ without the guide. Use the stroke order numbers as hints.',
      action: 'Write from memory',
      character: 'あ',
      strokeOrder: [1, 2, 3],
    },
    {
      id: 'recognize',
      title: 'Recognize the character',
      description: 'Can you identify あ among these options?',
      action: 'Select the correct character',
      character: 'あ',
      strokeOrder: [1, 2, 3],
    },
  ];

  const currentStepData = tutorialSteps[currentStep];

  useEffect(() => {
    if (currentStep === 1 || currentStep === 2) {
      // Initialize canvas for drawing steps
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      }
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setDrawingComplete(false);
      setShowFeedback(false);
    } else {
      onComplete();
    }
  };

  const handleDrawingStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const handleDrawingMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const handleDrawingEnd = () => {
    setIsDrawing(false);
    setDrawingComplete(true);
    setShowFeedback(true);
    setFeedback('Great job! You\'ve traced あ correctly.');
  };

  const handleCharacterSelect = (selectedChar: string) => {
    if (selectedChar === 'あ') {
      setShowFeedback(true);
      setFeedback('Excellent! You\'ve learned あ');
      setTimeout(() => {
        handleNext();
      }, 1500);
    } else {
      setShowFeedback(true);
      setFeedback('Not quite. Try again!');
      setTimeout(() => {
        setShowFeedback(false);
      }, 1500);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Introduction
        return (
          <div className="space-y-6">
            <motion.div
              className="text-8xl font-bold text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {currentStepData.character}
            </motion.div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Click to hear pronunciation</p>
              <button
                onClick={() => {
                  // In a real app, this would play audio
                  console.log('Playing pronunciation for あ');
                }}
                className="text-2xl hover:scale-110 transition-transform"
              >
                🔊
              </button>
            </div>
          </div>
        );

      case 1: // Trace
        return (
          <div className="space-y-6">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={320}
                height={320}
                className="border-base mx-auto cursor-crosshair"
                onMouseDown={handleDrawingStart}
                onMouseMove={handleDrawingMove}
                onMouseUp={handleDrawingEnd}
                onMouseLeave={handleDrawingEnd}
              />
              
              {/* Guide overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-6xl text-gray-200 select-none">
                  {currentStepData.character}
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Follow the stroke order: 1 → 2 → 3</p>
            </div>
          </div>
        );

      case 2: // Memory
        return (
          <div className="space-y-6">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={320}
                height={320}
                className="border-base mx-auto cursor-crosshair"
                onMouseDown={handleDrawingStart}
                onMouseMove={handleDrawingMove}
                onMouseUp={handleDrawingEnd}
                onMouseLeave={handleDrawingEnd}
              />
              
              {/* Stroke order hints */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-6xl text-gray-300 select-none">
                  {currentStepData.strokeOrder.map((num, index) => (
                    <span key={index} className="text-xs text-gray-500">
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Write from memory</p>
              <button className="text-sm text-gray-500 hover:text-gray-700 underline">
                Show hint
              </button>
            </div>
          </div>
        );

      case 3: // Recognize
        return (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">Which character is あ?</p>
              <div className="grid grid-cols-2 gap-4">
                {['あ', 'い', 'う', 'え'].map((char, index) => (
                  <motion.button
                    key={char}
                    onClick={() => handleCharacterSelect(char)}
                    className="p-6 border-base hover:border-strong text-4xl font-bold"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {char}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-white flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-2xl w-full space-y-8">
        {/* Progress */}
        <div className="text-center">
          <p className="text-sm text-gray-500">Interactive Tutorial</p>
          <div className="w-full bg-gray-200 h-2 mt-2">
            <div 
              className="bg-black h-2 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="text-center space-y-6">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="heading text-2xl font-bold">{currentStepData.title}</h2>
            <p className="body text-base text-gray-600 mt-2">
              {currentStepData.description}
            </p>
          </motion.div>

          {renderStepContent()}

          {/* Feedback */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-50 border-base p-4 rounded-sm"
              >
                <p className="text-sm text-green-800">{feedback}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {(currentStep === 0 || drawingComplete || currentStep === 3) && (
            <AccessibleButton
              onClick={handleNext}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Complete Tutorial' : 'Next Step'}
            </AccessibleButton>
          )}
          
          <div className="text-center">
            <button
              onClick={onComplete}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
