"use client";

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CleanAppShell, CleanPageLayout, CleanCard, CleanButton } from '@/components/layout';
import { ArrowLeft, Pen, RotateCcw, CheckCircle, XCircle, Info, Volume2, Target, Star, Clock } from 'lucide-react';

interface Character {
  id: string;
  character: string;
  reading: string;
  meaning: string;
  strokes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'hiragana' | 'katakana' | 'kanji';
}

export default function WritingPracticePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [showStrokeOrder, setShowStrokeOrder] = useState(false);
  const [drawingComplete, setDrawingComplete] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Practice', href: '/practice' },
    { label: 'Writing Practice', href: '/practice/writing' }
  ];

  const characters: Character[] = [
    { id: '1', character: 'あ', reading: 'a', meaning: 'a (hiragana)', strokes: 3, difficulty: 'beginner', type: 'hiragana' },
    { id: '2', character: 'い', reading: 'i', meaning: 'i (hiragana)', strokes: 2, difficulty: 'beginner', type: 'hiragana' },
    { id: '3', character: 'う', reading: 'u', meaning: 'u (hiragana)', strokes: 2, difficulty: 'beginner', type: 'hiragana' },
    { id: '4', character: 'え', reading: 'e', meaning: 'e (hiragana)', strokes: 2, difficulty: 'beginner', type: 'hiragana' },
    { id: '5', character: 'お', reading: 'o', meaning: 'o (hiragana)', strokes: 3, difficulty: 'beginner', type: 'hiragana' },
    { id: '6', character: 'か', reading: 'ka', meaning: 'ka (hiragana)', strokes: 3, difficulty: 'beginner', type: 'hiragana' },
    { id: '7', character: 'き', reading: 'ki', meaning: 'ki (hiragana)', strokes: 4, difficulty: 'beginner', type: 'hiragana' },
    { id: '8', character: 'く', reading: 'ku', meaning: 'ku (hiragana)', strokes: 1, difficulty: 'beginner', type: 'hiragana' },
    { id: '9', character: 'け', reading: 'ke', meaning: 'ke (hiragana)', strokes: 3, difficulty: 'beginner', type: 'hiragana' },
    { id: '10', character: 'こ', reading: 'ko', meaning: 'ko (hiragana)', strokes: 2, difficulty: 'beginner', type: 'hiragana' }
  ];

  const currentCharacter = characters[currentCharacterIndex];

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setDrawingComplete(false);
    setAccuracy(null);
  };

  const handleCompleteDrawing = () => {
    setIsDrawing(false);
    setDrawingComplete(true);
    setAttempts(attempts + 1);
    
    // Simulate OCR accuracy
    const simulatedAccuracy = Math.floor(Math.random() * 30) + 70;
    setAccuracy(simulatedAccuracy);
    
    if (simulatedAccuracy >= 80) {
      setSessionScore(sessionScore + 10);
    }
  };

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setDrawingComplete(false);
    setAccuracy(null);
  };

  const handleNextCharacter = () => {
    if (currentCharacterIndex < characters.length - 1) {
      setCurrentCharacterIndex(currentCharacterIndex + 1);
      setDrawingComplete(false);
      setAccuracy(null);
      handleClearCanvas();
    }
  };

  const handlePreviousCharacter = () => {
    if (currentCharacterIndex > 0) {
      setCurrentCharacterIndex(currentCharacterIndex - 1);
      setDrawingComplete(false);
      setAccuracy(null);
      handleClearCanvas();
    }
  };

  const handleCharacterSelect = (index: number) => {
    setCurrentCharacterIndex(index);
    setDrawingComplete(false);
    setAccuracy(null);
    handleClearCanvas();
  };

  const handlePlayAudio = () => {
    // In real app, this would play the character pronunciation
    console.log(`Playing audio for ${currentCharacter.character}`);
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
        title="Writing Practice"
        description="Practice writing Japanese characters with interactive guidance"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <CleanButton variant="outline" onClick={() => router.push('/practice')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Practice
            </CleanButton>
            <CleanButton variant="outline" onClick={() => setShowStrokeOrder(!showStrokeOrder)}>
              {showStrokeOrder ? 'Hide' : 'Show'} Stroke Order
            </CleanButton>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Practice Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Character Display */}
            <CleanCard>
              <div className="text-center">
                <div className="mb-6">
                  <div className="text-8xl font-bold text-gray-900 mb-4">
                    {currentCharacter.character}
                  </div>
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <span className="text-lg text-gray-600">{currentCharacter.reading}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{currentCharacter.meaning}</span>
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
                    <CleanButton
                      variant="outline"
                      size="sm"
                      onClick={() => setShowStrokeOrder(!showStrokeOrder)}
                    >
                      <Info className="w-4 h-4 mr-2" />
                      {showStrokeOrder ? 'Hide' : 'Show'} Guide
                    </CleanButton>
                  </div>
                </div>

                {/* Stroke Order Guide */}
                {showStrokeOrder && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Stroke Order Guide</h4>
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      {Array.from({ length: currentCharacter.strokes }, (_, i) => (
                        <div key={i} className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-gray-300 text-sm font-medium text-gray-700">
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      Follow the numbered strokes to write this character correctly
                    </p>
                  </div>
                )}

                {/* Drawing Canvas */}
                <div className="mb-6">
                  <div className="w-full h-64 bg-white border-2 border-gray-300 rounded-lg relative">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={200}
                      className="w-full h-full cursor-crosshair"
                      onMouseDown={handleStartDrawing}
                      onMouseUp={handleCompleteDrawing}
                    />
                    {!isDrawing && !drawingComplete && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Pen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">Click and drag to draw the character</p>
                          <CleanButton onClick={handleStartDrawing}>
                            Start Drawing
                          </CleanButton>
                        </div>
                      </div>
                    )}
                    {isDrawing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10">
                        <div className="text-center">
                          <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-gray-600">Drawing in progress...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Results */}
                {drawingComplete && accuracy !== null && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {accuracy >= 80 ? (
                      <div className="flex items-center justify-center text-green-600 mb-2">
                        <CheckCircle className="w-8 h-8 mr-2" />
                        <span className="text-lg font-semibold">Great job!</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-red-600 mb-2">
                        <XCircle className="w-8 h-8 mr-2" />
                        <span className="text-lg font-semibold">Keep practicing!</span>
                      </div>
                    )}
                    <div className="text-2xl font-bold text-gray-900 text-center mb-4">
                      {accuracy}% accuracy
                    </div>
                    <div className="flex items-center justify-center space-x-3">
                      <CleanButton variant="outline" onClick={handleClearCanvas}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Try Again
                      </CleanButton>
                      <CleanButton onClick={handleNextCharacter} disabled={currentCharacterIndex === characters.length - 1}>
                        Next Character
                      </CleanButton>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <CleanButton
                    variant="outline"
                    onClick={handlePreviousCharacter}
                    disabled={currentCharacterIndex === 0}
                  >
                    Previous
                  </CleanButton>
                  <div className="text-sm text-gray-600">
                    {currentCharacterIndex + 1} of {characters.length}
                  </div>
                  <CleanButton
                    variant="outline"
                    onClick={handleNextCharacter}
                    disabled={currentCharacterIndex === characters.length - 1}
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
                  <span className="text-gray-600">Characters Practiced</span>
                  <span className="font-semibold text-gray-900">{currentCharacterIndex + 1}</span>
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
                  <span className="text-gray-600">Average Accuracy</span>
                  <span className="font-semibold text-gray-900">
                    {accuracy !== null ? `${accuracy}%` : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time Spent</span>
                  <span className="font-semibold text-gray-900">{timeSpent}m</span>
                </div>
              </div>
            </CleanCard>

            {/* Character List */}
            <CleanCard title="Character List" description="Select a character to practice">
              <div className="grid grid-cols-5 gap-2">
                {characters.map((char, index) => (
                  <button
                    key={char.id}
                    onClick={() => handleCharacterSelect(index)}
                    className={`w-12 h-12 flex items-center justify-center text-xl font-bold rounded-lg border-2 transition-colors ${
                      index === currentCharacterIndex
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                    }`}
                  >
                    {char.character}
                  </button>
                ))}
              </div>
            </CleanCard>

            {/* Character Details */}
            <CleanCard title="Character Details" description="Information about the current character">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reading</span>
                  <span className="font-semibold text-gray-900">{currentCharacter.reading}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Meaning</span>
                  <span className="font-semibold text-gray-900">{currentCharacter.meaning}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Strokes</span>
                  <span className="font-semibold text-gray-900">{currentCharacter.strokes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Type</span>
                  <span className="font-semibold text-gray-900 capitalize">{currentCharacter.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Difficulty</span>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentCharacter.difficulty)}`}>
                    {currentCharacter.difficulty}
                  </span>
                </div>
              </div>
            </CleanCard>

            {/* Practice Tips */}
            <CleanCard title="Practice Tips" description="Get better results">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                  <span>Follow the stroke order guide for best results</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                  <span>Draw slowly and deliberately</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                  <span>Focus on proper proportions</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                  <span>Practice regularly for improvement</span>
                </div>
              </div>
            </CleanCard>
          </div>
        </div>
      </CleanPageLayout>
    </CleanAppShell>
  );
}