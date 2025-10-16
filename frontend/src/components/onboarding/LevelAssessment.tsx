"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccessibleButton } from '@/components/accessibility';
import { CheckCircle, XCircle, Clock, Target, BookOpen, Zap } from 'lucide-react';

interface LevelOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  curriculum: string[];
  estimatedTime: string;
  characters: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface AssessmentQuestion {
  id: string;
  type: 'recognition' | 'writing' | 'meaning' | 'reading';
  question: string;
  character: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: number;
}

interface LevelAssessmentProps {
  onNext: (level: LevelOption) => void;
  onSkip: () => void;
  className?: string;
}

export const LevelAssessment: React.FC<LevelAssessmentProps> = ({ onNext, onSkip, className = '' }) => {
  const [selectedLevel, setSelectedLevel] = useState<LevelOption | null>(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [assessmentResult, setAssessmentResult] = useState<LevelOption | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes

  const levelOptions: LevelOption[] = [
    {
      id: 'beginner',
      title: 'Complete beginner',
      description: 'I don\'t know any Japanese characters',
      icon: <BookOpen className="w-6 h-6" />,
      curriculum: ['Hiragana basics', 'Basic vocabulary', 'Simple phrases'],
      estimatedTime: '3-6 months',
      characters: 46,
      difficulty: 'beginner'
    },
    {
      id: 'hiragana',
      title: 'Know Hiragana',
      description: 'I can read and write Hiragana',
      icon: <span className="text-2xl">あ</span>,
      curriculum: ['Katakana', 'Basic Kanji', 'Vocabulary building'],
      estimatedTime: '6-12 months',
      characters: 92,
      difficulty: 'beginner'
    },
    {
      id: 'hiragana-katakana',
      title: 'Know Hiragana + Katakana',
      description: 'I can read both Hiragana and Katakana',
      icon: <span className="text-2xl">ア</span>,
      curriculum: ['Kanji introduction', 'Grammar basics', 'Reading practice'],
      estimatedTime: '12-18 months',
      characters: 200,
      difficulty: 'intermediate'
    },
    {
      id: 'some-kanji',
      title: 'Some Kanji',
      description: 'I know some Kanji characters',
      icon: <span className="text-2xl">漢</span>,
      curriculum: ['Advanced Kanji', 'Grammar patterns', 'Reading comprehension'],
      estimatedTime: '18-24 months',
      characters: 500,
      difficulty: 'intermediate'
    },
    {
      id: 'intermediate',
      title: 'Intermediate+',
      description: 'I have solid Japanese foundation',
      icon: <span className="text-2xl">上</span>,
      curriculum: ['Advanced grammar', 'Complex Kanji', 'Conversation practice'],
      estimatedTime: '24+ months',
      characters: 1000,
      difficulty: 'advanced'
    },
  ];

  const assessmentQuestions: AssessmentQuestion[] = [
    {
      id: '1',
      type: 'recognition',
      question: 'What sound does this character make?',
      character: 'あ',
      options: ['a', 'i', 'u', 'e'],
      correctAnswer: 'a',
      explanation: 'あ is pronounced "a" as in "father"',
      difficulty: 1
    },
    {
      id: '2',
      type: 'recognition',
      question: 'What sound does this character make?',
      character: 'ア',
      options: ['a', 'i', 'u', 'e'],
      correctAnswer: 'a',
      explanation: 'ア is the Katakana version of あ, also pronounced "a"',
      difficulty: 2
    },
    {
      id: '3',
      type: 'meaning',
      question: 'What does this character mean?',
      character: '大',
      options: ['small', 'big', 'water', 'fire'],
      correctAnswer: 'big',
      explanation: '大 means "big" or "large"',
      difficulty: 3
    },
    {
      id: '4',
      type: 'reading',
      question: 'How do you read this character?',
      character: '水',
      options: ['mizu', 'kawa', 'umi', 'ame'],
      correctAnswer: 'mizu',
      explanation: '水 is read as "mizu" and means "water"',
      difficulty: 4
    },
    {
      id: '5',
      type: 'recognition',
      question: 'What sound does this character make?',
      character: 'い',
      options: ['a', 'i', 'u', 'e'],
      correctAnswer: 'i',
      explanation: 'い is pronounced "i" as in "machine"',
      difficulty: 1
    }
  ];

  // Timer effect
  useEffect(() => {
    if (showAssessment && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      completeAssessment();
    }
  }, [showAssessment, timeRemaining]);

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
    setTimeRemaining(120);
    setCurrentQuestion(0);
    setAnswers({});
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: answer }));
    
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestion < assessmentQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        completeAssessment();
      }
    }, 1000);
  };

  const completeAssessment = () => {
    // Calculate score and determine level
    let score = 0;
    assessmentQuestions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score += question.difficulty;
      }
    });

    // Determine level based on score
    let recommendedLevel: LevelOption;
    if (score <= 3) {
      recommendedLevel = levelOptions[0]; // Beginner
    } else if (score <= 6) {
      recommendedLevel = levelOptions[1]; // Know Hiragana
    } else if (score <= 9) {
      recommendedLevel = levelOptions[2]; // Know Hiragana + Katakana
    } else if (score <= 12) {
      recommendedLevel = levelOptions[3]; // Some Kanji
    } else {
      recommendedLevel = levelOptions[4]; // Intermediate+
    }

    setAssessmentResult(recommendedLevel);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Assessment Results Screen
  if (assessmentResult) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4 ${className}`}>
        <div className="max-w-2xl w-full space-y-8">
          {/* Progress */}
          <div className="text-center">
            <p className="text-sm text-gray-500">Step 2 of 4 • Assessment Complete</p>
            <div className="w-full bg-gray-200 h-2 mt-2 rounded-full">
              <div className="bg-primary h-2 rounded-full w-2/4 transition-all duration-300"></div>
            </div>
          </div>

          {/* Results */}
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl">🎯</div>
            <h2 className="heading text-3xl font-bold text-gray-900">Assessment Complete!</h2>
            <p className="body text-lg text-gray-600">
              Based on your answers, we recommend starting at:
            </p>
            
            <div className="bg-white border-base rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="text-primary">
                  {assessmentResult.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-xl">{assessmentResult.title}</h3>
                  <p className="text-sm text-gray-600">{assessmentResult.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{assessmentResult.estimatedTime}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span>{assessmentResult.characters} characters</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(assessmentResult.difficulty)}`}>
                  {assessmentResult.difficulty}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <AccessibleButton
                onClick={() => onNext(assessmentResult)}
                variant="primary"
                size="lg"
                className="w-full px-8 py-4 text-lg font-semibold"
              >
                Continue with Recommended Level
              </AccessibleButton>
              
              <button
                onClick={() => {
                  setAssessmentResult(null);
                  setShowAssessment(false);
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
              >
                Choose a different level
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Assessment Questions Screen
  if (showAssessment) {
    const currentQ = assessmentQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / assessmentQuestions.length) * 100;
    
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 ${className}`}>
        <div className="max-w-2xl w-full space-y-8">
          {/* Progress */}
          <div className="text-center">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Question {currentQuestion + 1} of {assessmentQuestions.length}</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <motion.div
            key={currentQuestion}
            className="text-center space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white border-base rounded-lg p-8 shadow-sm">
              <div className="text-8xl mb-6">{currentQ.character}</div>
              <h3 className="heading text-xl font-semibold mb-4">{currentQ.question}</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {currentQ.options?.map((option, index) => (
                  <motion.button
                    key={option}
                    onClick={() => handleAnswerSelect(option)}
                    className={`p-4 border-base hover:border-primary hover:bg-primary/5 text-lg font-medium transition-all duration-200 ${
                      answers[currentQuestion] === option 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : ''
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Skip Button */}
          <div className="text-center">
            <button
              onClick={() => setShowAssessment(false)}
              className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
            >
              Skip Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-4xl w-full space-y-8">
        {/* Progress */}
        <div className="text-center">
          <p className="text-sm text-gray-500">Step 2 of 4 • Level Assessment</p>
          <div className="w-full bg-gray-200 h-2 mt-2 rounded-full">
            <div className="bg-primary h-2 rounded-full w-2/4 transition-all duration-300"></div>
          </div>
        </div>

        {/* Question */}
        <div className="text-center space-y-4">
          <h2 className="heading text-3xl font-bold text-gray-900">What&apos;s your current level?</h2>
          <p className="body text-lg text-gray-600 max-w-2xl mx-auto">
            This helps us customize your learning path and start you at the right place
          </p>
        </div>

        {/* Level Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {levelOptions.map((level, index) => (
            <motion.button
              key={level.id}
              onClick={() => handleLevelSelect(level)}
              className={`p-6 bg-white border-base text-left transition-all duration-200 rounded-lg group ${
                selectedLevel?.id === level.id
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'hover:border-primary hover:shadow-lg'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-primary group-hover:scale-110 transition-transform">
                    {level.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="heading text-lg font-semibold">{level.title}</h3>
                    <p className="text-sm text-gray-600">{level.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{level.estimatedTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="w-3 h-3" />
                      <span>{level.characters} characters</span>
                    </div>
                  </div>
                  
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(level.difficulty)}`}>
                    {level.difficulty}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Assessment Option */}
        <div className="text-center space-y-4">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div className="text-4xl">🎯</div>
              <h3 className="font-semibold text-lg">Not sure about your level?</h3>
              <p className="text-sm text-gray-600">
                Take our 2-minute placement test to get a personalized recommendation
              </p>
              <AccessibleButton
                onClick={handleAssessmentStart}
                variant="secondary"
                size="lg"
                className="px-6 py-3"
              >
                <Zap className="w-4 h-4 mr-2" />
                Take Placement Test
              </AccessibleButton>
            </div>
          </div>
        </div>

        {/* Selected Level Summary */}
        {selectedLevel && (
          <motion.div
            className="bg-white border-base rounded-lg p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-primary">
                  {selectedLevel.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedLevel.title}</h3>
                  <p className="text-sm text-gray-600">{selectedLevel.description}</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div>{selectedLevel.estimatedTime}</div>
                <div>{selectedLevel.characters} characters</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <AccessibleButton
            onClick={handleNext}
            variant="primary"
            size="lg"
            className="w-full md:w-auto mx-auto block px-8 py-4 text-lg font-semibold"
            disabled={!selectedLevel}
          >
            Continue to Pace Selection
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
