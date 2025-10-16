"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CleanAppShell, CleanPageLayout, CleanCard, CleanButton } from '@/components/layout';
import { ArrowLeft, BookOpen, Volume2, CheckCircle, XCircle, Info, RotateCcw, Star } from 'lucide-react';

interface VocabularyItem {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

export default function VocabularyPracticePage() {
  const router = useRouter();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Practice', href: '/practice' },
    { label: 'Vocabulary Practice', href: '/practice/vocabulary' }
  ];

  const vocabulary: VocabularyItem[] = [
    {
      id: '1',
      word: '勉強',
      reading: 'べんきょう',
      meaning: 'study, learning',
      example: '毎日勉強しています。',
      exampleTranslation: 'I study every day.',
      difficulty: 'beginner',
      category: 'Education'
    },
    {
      id: '2',
      word: '友達',
      reading: 'ともだち',
      meaning: 'friend',
      example: '友達と映画を見ました。',
      exampleTranslation: 'I watched a movie with my friend.',
      difficulty: 'beginner',
      category: 'Social'
    },
    {
      id: '3',
      word: '図書館',
      reading: 'としょかん',
      meaning: 'library',
      example: '図書館で本を読みます。',
      exampleTranslation: 'I read books at the library.',
      difficulty: 'beginner',
      category: 'Places'
    },
    {
      id: '4',
      word: '料理',
      reading: 'りょうり',
      meaning: 'cooking, cuisine',
      example: '日本料理が好きです。',
      exampleTranslation: 'I like Japanese cuisine.',
      difficulty: 'intermediate',
      category: 'Food'
    },
    {
      id: '5',
      word: '旅行',
      reading: 'りょこう',
      meaning: 'travel, trip',
      example: '来月旅行に行きます。',
      exampleTranslation: 'I will go on a trip next month.',
      difficulty: 'intermediate',
      category: 'Travel'
    }
  ];

  const currentWord = vocabulary[currentWordIndex];
  const isLastWord = currentWordIndex === vocabulary.length - 1;

  const handlePlayAudio = () => {
    // In real app, this would play the word pronunciation
    console.log(`Playing audio for ${currentWord.word}`);
  };

  const handleCheckAnswer = () => {
    const correct = userAnswer.toLowerCase().trim() === currentWord.meaning.toLowerCase();
    setIsCorrect(correct);
    setAttempts(attempts + 1);
    
    if (correct) {
      setSessionScore(sessionScore + 10);
    }
  };

  const handleNextWord = () => {
    if (!isLastWord) {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowAnswer(false);
      setUserAnswer('');
      setIsCorrect(null);
    }
  };

  const handlePreviousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setShowAnswer(false);
      setUserAnswer('');
      setIsCorrect(null);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleReset = () => {
    setShowAnswer(false);
    setUserAnswer('');
    setIsCorrect(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <CleanAppShell currentPage="practice" user={{ streak: 12, notifications: 3 }}>
      <CleanPageLayout
        title="Vocabulary Practice"
        description="Learn Japanese vocabulary with context and examples"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <CleanButton variant="outline" onClick={() => router.push('/practice')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Practice
            </CleanButton>
            <CleanButton variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </CleanButton>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Practice Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Word Display */}
            <CleanCard>
              <div className="text-center mb-6">
                <div className="mb-4">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {currentWord.word}
                  </div>
                  <div className="text-xl text-gray-600 mb-4">
                    {currentWord.reading}
                  </div>
                  <div className="flex items-center justify-center space-x-4">
                    <CleanButton
                      variant="outline"
                      size="sm"
                      onClick={handlePlayAudio}
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Listen
                    </CleanButton>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentWord.difficulty)}`}>
                      {currentWord.difficulty}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                      {currentWord.category}
                    </span>
                  </div>
                </div>

                {/* Example Sentence */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Example Sentence</h4>
                  <div className="text-lg text-gray-900 mb-2">
                    {currentWord.example}
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentWord.exampleTranslation}
                  </div>
                </div>

                {/* Answer Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What does this word mean?
                  </label>
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter the meaning in English..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    disabled={showAnswer || isCorrect !== null}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center space-x-3">
                  {!showAnswer && isCorrect === null ? (
                    <>
                      <CleanButton onClick={handleCheckAnswer} disabled={!userAnswer.trim()}>
                        Check Answer
                      </CleanButton>
                      <CleanButton variant="outline" onClick={handleShowAnswer}>
                        Show Answer
                      </CleanButton>
                    </>
                  ) : (
                    <div className="text-center">
                      {isCorrect !== null && (
                        <div className="mb-4">
                          {isCorrect ? (
                            <div className="flex items-center justify-center text-green-600 mb-2">
                              <CheckCircle className="w-8 h-8 mr-2" />
                              <span className="text-lg font-semibold">Correct!</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center text-red-600 mb-2">
                              <XCircle className="w-8 h-8 mr-2" />
                              <span className="text-lg font-semibold">Incorrect</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-lg font-semibold text-gray-900">
                          {currentWord.meaning}
                        </div>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <CleanButton variant="outline" onClick={handleReset}>
                          Try Again
                        </CleanButton>
                        <CleanButton onClick={handleNextWord} disabled={isLastWord}>
                          Next Word
                        </CleanButton>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6">
                  <CleanButton
                    variant="outline"
                    onClick={handlePreviousWord}
                    disabled={currentWordIndex === 0}
                  >
                    Previous
                  </CleanButton>
                  <div className="text-sm text-gray-600">
                    {currentWordIndex + 1} of {vocabulary.length}
                  </div>
                  <CleanButton
                    variant="outline"
                    onClick={handleNextWord}
                    disabled={isLastWord}
                  >
                    Next
                  </CleanButton>
                </div>
              </div>
            </CleanCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Stats */}
            <CleanCard title="Session Stats" description="Your progress this session">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Words Practiced</span>
                  <span className="font-semibold text-gray-900">{currentWordIndex + 1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Attempts</span>
                  <span className="font-semibold text-gray-900">{attempts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Session Score</span>
                  <span className="font-semibold text-gray-900">{sessionScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Accuracy</span>
                  <span className="font-semibold text-gray-900">
                    {attempts > 0 ? `${Math.round((sessionScore / attempts) * 10)}%` : '--'}
                  </span>
                </div>
              </div>
            </CleanCard>

            {/* Word List */}
            <CleanCard title="Word List" description="Select a word to practice">
              <div className="space-y-2">
                {vocabulary.map((word, index) => (
                  <button
                    key={word.id}
                    onClick={() => {
                      setCurrentWordIndex(index);
                      setShowAnswer(false);
                      setUserAnswer('');
                      setIsCorrect(null);
                    }}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                      index === currentWordIndex
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">{word.word}</div>
                    <div className="text-sm opacity-75">{word.reading}</div>
                  </button>
                ))}
              </div>
            </CleanCard>

            {/* Practice Tips */}
            <CleanCard title="Practice Tips" description="Learn vocabulary effectively">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                  <span>Listen to the pronunciation for each word</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                  <span>Study the example sentences for context</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                  <span>Practice regularly for better retention</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                  <span>Focus on words that match your level</span>
                </div>
              </div>
            </CleanCard>
          </div>
        </div>
      </CleanPageLayout>
    </CleanAppShell>
  );
}
