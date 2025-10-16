"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccessibleButton } from '@/components/accessibility';
import { Play, Volume2, VolumeX, RotateCcw, CheckCircle, Star, Target, Clock, Zap } from 'lucide-react';

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
  audioUrl?: string;
  hints: string[];
  tips: string[];
}

export const CharacterTutorial: React.FC<CharacterTutorialProps> = ({ onComplete, className = '' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingComplete, setDrawingComplete] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'introduction',
      title: 'Meet あ (A)',
      description: 'This is the first Hiragana character. It sounds like "ah" as in "father".',
      action: 'Click to hear pronunciation',
      character: 'あ',
      strokeOrder: [1, 2, 3],
      audioUrl: '/audio/hiragana-a.mp3',
      hints: ['This character has 3 strokes', 'Start from the top', 'It looks like a house with a roof'],
      tips: ['あ is used in many common words', 'Practice the stroke order slowly', 'Focus on the shape and proportions']
    },
    {
      id: 'trace',
      title: 'Trace the character',
      description: 'Follow the stroke order shown. Take your time and be precise.',
      action: 'Trace following the guide',
      character: 'あ',
      strokeOrder: [1, 2, 3],
      hints: ['Follow the numbered strokes', 'Start with stroke 1', 'Keep your lines smooth'],
      tips: ['Use your finger or mouse to trace', 'Go slowly and carefully', 'Try to match the guide exactly']
    },
    {
      id: 'memory',
      title: 'Write from memory',
      description: 'Now try writing あ without the guide. Use the stroke order numbers as hints.',
      action: 'Write from memory',
      character: 'あ',
      strokeOrder: [1, 2, 3],
      hints: ['Remember the 3 strokes', 'Think about the shape', 'Start from the top'],
      tips: ['Take your time', 'Don\'t worry if it\'s not perfect', 'Practice makes perfect']
    },
    {
      id: 'recognize',
      title: 'Recognize the character',
      description: 'Can you identify あ among these options?',
      action: 'Select the correct character',
      character: 'あ',
      strokeOrder: [1, 2, 3],
      hints: ['Look for the character we just learned', 'It has 3 strokes', 'It sounds like "ah"'],
      tips: ['Take your time to look carefully', 'Remember what we practiced', 'Trust your instincts']
    },
  ];

  const currentStepData = tutorialSteps[currentStep];

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentStep === 1 || currentStep === 2) {
      // Initialize canvas for drawing steps
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = '#0066ff';
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  }, [currentStep]);

  const playAudio = () => {
    if (audioRef.current && currentStepData.audioUrl) {
      setIsAudioPlaying(true);
      audioRef.current.play();
      audioRef.current.onended = () => setIsAudioPlaying(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setDrawingComplete(false);
      }
    }
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setDrawingComplete(false);
      setShowFeedback(false);
      setShowHints(false);
      setAttempts(0);
    } else {
      // Calculate final score
      const finalScore = Math.max(0, 100 - (attempts * 10) - Math.floor(timeSpent / 10));
      setScore(finalScore);
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
    setFeedbackType('success');
    setFeedback('Great job! You\'ve traced あ correctly.');
    setScore(prev => prev + 25);
  };

  const handleCharacterSelect = (selectedChar: string) => {
    setAttempts(prev => prev + 1);
    
    if (selectedChar === 'あ') {
      setShowFeedback(true);
      setFeedbackType('success');
      setFeedback('Excellent! You\'ve learned あ');
      setScore(prev => prev + 50);
      setTimeout(() => {
        handleNext();
      }, 1500);
    } else {
      setShowFeedback(true);
      setFeedbackType('error');
      setFeedback('Not quite. Try again!');
      setTimeout(() => {
        setShowFeedback(false);
      }, 1500);
    }
  };

  const getFeedbackColor = () => {
    switch (feedbackType) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
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
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-4xl w-full space-y-8">
        {/* Progress */}
        <div className="text-center">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{score} points</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6"
            >
              <div>
                <h2 className="heading text-3xl font-bold text-gray-900">{currentStepData.title}</h2>
                <p className="body text-lg text-gray-600 mt-2">
                  {currentStepData.description}
                </p>
              </div>

              {renderStepContent()}

              {/* Feedback */}
              <AnimatePresence>
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`border rounded-lg p-4 ${getFeedbackColor()}`}
                  >
                    <div className="flex items-center space-x-2">
                      {feedbackType === 'success' && <CheckCircle className="w-5 h-5" />}
                      <p className="text-sm font-medium">{feedback}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Actions */}
            <div className="space-y-4">
              {(currentStep === 0 || drawingComplete || currentStep === 3) && (
                <AccessibleButton
                  onClick={handleNext}
                  variant="primary"
                  size="lg"
                  className="w-full px-8 py-4 text-lg font-semibold"
                >
                  {currentStep === tutorialSteps.length - 1 ? 'Complete Tutorial' : 'Next Step'}
                </AccessibleButton>
              )}
              
              <div className="text-center">
                <button
                  onClick={onComplete}
                  className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                >
                  Skip tutorial
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Character Info */}
            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-primary">{currentStepData.character}</div>
                <div>
                  <h3 className="font-semibold text-lg">Hiragana あ</h3>
                  <p className="text-sm text-gray-600">Pronunciation: "ah"</p>
                </div>
                
                {currentStepData.audioUrl && (
                  <button
                    onClick={playAudio}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    {isAudioPlaying ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">Listen</span>
                  </button>
                )}
              </div>
            </div>

            {/* Hints & Tips */}
            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Hints & Tips</h3>
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="text-sm text-primary hover:text-primary-dark transition-colors"
                  >
                    {showHints ? 'Hide' : 'Show'}
                  </button>
                </div>
                
                <AnimatePresence>
                  {showHints && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Hints:</h4>
                        <ul className="space-y-1">
                          {currentStepData.hints.map((hint, index) => (
                            <li key={index} className="text-xs text-gray-600 flex items-start space-x-2">
                              <Target className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                              <span>{hint}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Tips:</h4>
                        <ul className="space-y-1">
                          {currentStepData.tips.map((tip, index) => (
                            <li key={index} className="text-xs text-gray-600 flex items-start space-x-2">
                              <Zap className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Progress Stats */}
            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Your Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Score</span>
                  <span className="font-medium">{score} points</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Attempts</span>
                  <span className="font-medium">{attempts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Element */}
        <audio ref={audioRef} src={currentStepData.audioUrl} />
      </div>
    </div>
  );
};
