"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brush, Palette, Layers, RotateCcw, Play, Pause, SkipForward, Settings, Volume2, VolumeX, Eye, EyeOff, Download, Share2, Star, Heart, Bookmark, Target, TrendingUp, Award, Zap } from 'lucide-react';
import type { Character } from '@/types/character';

interface CalligraphyModeProps {
  userId: string;
  className?: string;
}

interface BrushTool {
  id: string;
  name: string;
  type: 'fude' | 'hude' | 'maru' | 'hosomi' | 'futoi';
  size: number;
  pressure: number;
  opacity: number;
  color: string;
  texture: 'smooth' | 'rough' | 'textured';
  description: string;
  useCase: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface CalligraphyStyle {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  examples: string[];
  history: string;
  techniques: string[];
  tools: string[];
  paper: string;
  ink: string;
}

interface CalligraphySession {
  id: string;
  character: Character;
  style: CalligraphyStyle;
  brush: BrushTool;
  startTime: string;
  endTime?: string;
  isActive: boolean;
  strokes: Array<{
    id: string;
    order: number;
    path: string;
    pressure: number;
    speed: number;
    accuracy: number;
    timestamp: string;
  }>;
  progress: {
    strokesCompleted: number;
    totalStrokes: number;
    accuracy: number;
    styleScore: number;
    techniqueScore: number;
    overallScore: number;
  };
  feedback: {
    strokeOrder: number;
    pressure: number;
    speed: number;
    style: number;
    technique: number;
    suggestions: string[];
  };
}

interface CalligraphyStats {
  totalSessions: number;
  charactersPracticed: number;
  stylesMastered: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  favoriteStyle: string;
  favoriteBrush: string;
  improvementRate: number;
  techniqueLevel: 'beginner' | 'intermediate' | 'advanced' | 'master';
}

interface CalligraphyTechnique {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: string[];
  tips: string[];
  commonMistakes: string[];
  practiceCharacters: string[];
  videoUrl?: string;
  imageUrl?: string;
}

export const CalligraphyMode: React.FC<CalligraphyModeProps> = ({
  userId,
  className = ''
}) => {
  const [currentSession, setCurrentSession] = useState<CalligraphySession | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<CalligraphyStyle | null>(null);
  const [selectedBrush, setSelectedBrush] = useState<BrushTool | null>(null);
  const [stats, setStats] = useState<CalligraphyStats | null>(null);
  const [techniques, setTechniques] = useState<CalligraphyTechnique[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTechniques, setShowTechniques] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [brushSettings, setBrushSettings] = useState({
    size: 10,
    pressure: 0.5,
    opacity: 1.0,
    color: '#000000',
    texture: 'smooth' as const
  });
  const [canvasSettings, setCanvasSettings] = useState({
    paper: 'white' as 'white' | 'rice' | 'washi' | 'parchment',
    grid: true,
    guidelines: true,
    strokeOrder: true,
    audio: true
  });

  // Mock data - in real app, this would come from calligraphy service
  useEffect(() => {
    const loadCalligraphyData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock brush tools
      const mockBrushes: BrushTool[] = [
        {
          id: 'brush-1',
          name: 'Fude Brush',
          type: 'fude',
          size: 12,
          pressure: 0.8,
          opacity: 1.0,
          color: '#000000',
          texture: 'smooth',
          description: 'Traditional Japanese calligraphy brush with fine tip',
          useCase: 'Detailed characters and fine strokes',
          difficulty: 'intermediate'
        },
        {
          id: 'brush-2',
          name: 'Maru Brush',
          type: 'maru',
          size: 8,
          pressure: 0.6,
          opacity: 0.9,
          color: '#000000',
          texture: 'smooth',
          description: 'Round brush for balanced strokes',
          useCase: 'General purpose writing',
          difficulty: 'beginner'
        }
      ];

      // Mock calligraphy styles
      const mockStyles: CalligraphyStyle[] = [
        {
          id: 'style-1',
          name: 'Kaisho (楷書)',
          description: 'Block style - the most basic and readable form of Japanese calligraphy',
          characteristics: ['Clear strokes', 'Uniform thickness', 'Easy to read', 'Standard form'],
          difficulty: 'beginner',
          examples: ['新', '年', '明', 'け', 'ま', 'し', 'て'],
          history: 'Developed in China and adopted in Japan, used for official documents and education',
          techniques: ['Even pressure', 'Straight lines', 'Clear angles', 'Consistent spacing'],
          tools: ['Fude brush', 'Sumi ink', 'Rice paper'],
          paper: 'Rice paper',
          ink: 'Sumi ink'
        },
        {
          id: 'style-2',
          name: 'Gyosho (行書)',
          description: 'Semi-cursive style - faster and more fluid than Kaisho',
          characteristics: ['Flowing strokes', 'Connected characters', 'Faster writing', 'Artistic'],
          difficulty: 'intermediate',
          examples: ['書', '道', '美', '術', '文', '化'],
          history: 'Evolved from Kaisho for faster writing while maintaining readability',
          techniques: ['Flowing motion', 'Connected strokes', 'Varied pressure', 'Rhythmic writing'],
          tools: ['Fude brush', 'Sumi ink', 'Washi paper'],
          paper: 'Washi paper',
          ink: 'Sumi ink'
        },
        {
          id: 'style-3',
          name: 'Sosho (草書)',
          description: 'Cursive style - the most artistic and abstract form',
          characteristics: ['Highly stylized', 'Abstract forms', 'Artistic expression', 'Difficult to read'],
          difficulty: 'advanced',
          examples: ['風', '花', '雪', '月', '山', '川'],
          history: 'The most artistic form, used for poetry and artistic expression',
          techniques: ['Expressive strokes', 'Varied pressure', 'Abstract forms', 'Artistic license'],
          tools: ['Specialized brushes', 'High-quality ink', 'Artistic paper'],
          paper: 'Artistic paper',
          ink: 'High-quality sumi'
        }
      ];

      // Mock techniques
      const mockTechniques: CalligraphyTechnique[] = [
        {
          id: 'tech-1',
          name: 'Basic Stroke Technique',
          description: 'Master the fundamental strokes used in Japanese calligraphy',
          difficulty: 'beginner',
          steps: [
            'Hold the brush at a 45-degree angle',
            'Apply even pressure throughout the stroke',
            'Maintain consistent speed',
            'Lift the brush cleanly at the end'
          ],
          tips: [
            'Practice on grid paper first',
            'Focus on consistency over speed',
            'Use your whole arm, not just your wrist',
            'Breathe steadily while writing'
          ],
          commonMistakes: [
            'Inconsistent pressure',
            'Rushing the strokes',
            'Holding the brush too tightly',
            'Not lifting the brush cleanly'
          ],
          practiceCharacters: ['一', '丨', '丶', '丿', '乙'],
          videoUrl: '/videos/basic-strokes.mp4'
        },
        {
          id: 'tech-2',
          name: 'Pressure Variation',
          description: 'Learn to vary brush pressure for expressive strokes',
          difficulty: 'intermediate',
          steps: [
            'Start with light pressure',
            'Increase pressure in the middle',
            'Decrease pressure at the end',
            'Practice with different characters'
          ],
          tips: [
            'Use your body weight, not just your fingers',
            'Practice on different paper types',
            'Experiment with brush angles',
            'Study master calligraphers\' work'
          ],
          commonMistakes: [
            'Too much pressure variation',
            'Inconsistent pressure patterns',
            'Not controlling the brush properly',
            'Rushing the technique'
          ],
          practiceCharacters: ['永', '水', '火', '土', '金'],
          videoUrl: '/videos/pressure-variation.mp4'
        }
      ];

      // Mock stats
      const mockStats: CalligraphyStats = {
        totalSessions: 45,
        charactersPracticed: 89,
        stylesMastered: 2,
        averageScore: 78,
        bestScore: 95,
        totalTimeSpent: 1200,
        favoriteStyle: 'Kaisho',
        favoriteBrush: 'Fude Brush',
        improvementRate: 12,
        techniqueLevel: 'intermediate'
      };

      setSelectedBrush(mockBrushes[0]);
      setSelectedStyle(mockStyles[0]);
      setTechniques(mockTechniques);
      setStats(mockStats);
      setIsLoading(false);
    };

    loadCalligraphyData();
  }, [userId]);

  const handleStartSession = () => {
    if (!selectedCharacter || !selectedStyle || !selectedBrush) return;

    const newSession: CalligraphySession = {
      id: `session-${Date.now()}`,
      character: selectedCharacter,
      style: selectedStyle,
      brush: selectedBrush,
      startTime: new Date().toISOString(),
      isActive: true,
      strokes: [],
      progress: {
        strokesCompleted: 0,
        totalStrokes: selectedCharacter.strokeCount,
        accuracy: 0,
        styleScore: 0,
        techniqueScore: 0,
        overallScore: 0
      },
      feedback: {
        strokeOrder: 0,
        pressure: 0,
        speed: 0,
        style: 0,
        technique: 0,
        suggestions: []
      }
    };

    setCurrentSession(newSession);
  };

  const handleEndSession = () => {
    if (!currentSession) return;

    const finalSession: CalligraphySession = {
      ...currentSession,
      endTime: new Date().toISOString(),
      isActive: false
    };

    setCurrentSession(null);
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case 'Kaisho': return 'text-blue-600 bg-blue-50';
      case 'Gyosho': return 'text-green-600 bg-green-50';
      case 'Sosho': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      case 'master': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTechniqueIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return <Target className="w-5 h-5 text-green-500" />;
      case 'intermediate': return <TrendingUp className="w-5 h-5 text-yellow-500" />;
      case 'advanced': return <Award className="w-5 h-5 text-red-500" />;
      default: return <Star className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading calligraphy mode...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Calligraphy Mode</h2>
          <p className="body text-gray-600">
            Master the art of Japanese calligraphy with traditional brush techniques
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTechniques(!showTechniques)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showTechniques
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showStats
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Sessions</h3>
              <Brush className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.totalSessions}
            </div>
            <div className="text-sm text-gray-600">
              Calligraphy sessions
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Best Score</h3>
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.bestScore}%
            </div>
            <div className="text-sm text-gray-600">
              Highest score achieved
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Technique Level</h3>
              <Award className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.techniqueLevel}
            </div>
            <div className="text-sm text-gray-600">
              Current skill level
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Improvement</h3>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              +{stats.improvementRate}%
            </div>
            <div className="text-sm text-gray-600">
              This month
            </div>
          </div>
        </div>
      )}

      {/* Session Setup */}
      {!currentSession && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Start Calligraphy Session</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Character Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Character
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCharacter({
                    id: 'hiragana-あ',
                    character: 'あ',
                    type: 'hiragana',
                    readings: ['a'],
                    meanings: ['ah', 'oh'],
                    difficulty: 1,
                    frequency: 10,
                    strokeCount: 3,
                    radicals: [],
                    similarCharacters: ['hiragana-お'],
                    learningTips: ['Think of it as a person with arms up', 'Practice the curve'],
                    commonWords: ['あめ (rain)', 'あさ (morning)'],
                    culturalNotes: ['First character many learn'],
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z'
                  })}
                  className={`w-full p-3 border-base rounded-lg text-center text-2xl font-bold ${
                    selectedCharacter?.character === 'あ' ? 'bg-primary text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  あ
                </button>
                <button
                  onClick={() => setSelectedCharacter({
                    id: 'kanji-永',
                    character: '永',
                    type: 'kanji',
                    readings: ['ei', 'naga'],
                    meanings: ['eternity', 'long'],
                    difficulty: 4,
                    frequency: 6,
                    strokeCount: 5,
                    radicals: [],
                    similarCharacters: ['kanji-水'],
                    learningTips: ['Practice each stroke carefully', 'Focus on balance'],
                    commonWords: ['永遠 (eternity)', '永久 (permanent)'],
                    culturalNotes: ['Important character in calligraphy'],
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z'
                  })}
                  className={`w-full p-3 border-base rounded-lg text-center text-2xl font-bold ${
                    selectedCharacter?.character === '永' ? 'bg-primary text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  永
                </button>
              </div>
            </div>

            {/* Style Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calligraphy Style
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedStyle({
                    id: 'style-1',
                    name: 'Kaisho (楷書)',
                    description: 'Block style - the most basic and readable form',
                    characteristics: ['Clear strokes', 'Uniform thickness', 'Easy to read'],
                    difficulty: 'beginner',
                    examples: ['新', '年', '明', 'け', 'ま', 'し', 'て'],
                    history: 'Developed in China and adopted in Japan',
                    techniques: ['Even pressure', 'Straight lines', 'Clear angles'],
                    tools: ['Fude brush', 'Sumi ink', 'Rice paper'],
                    paper: 'Rice paper',
                    ink: 'Sumi ink'
                  })}
                  className={`w-full p-3 border-base rounded-lg text-left ${
                    selectedStyle?.name === 'Kaisho (楷書)' ? 'bg-primary text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">Kaisho (楷書)</div>
                  <div className="text-sm opacity-75">Block style</div>
                </button>
                <button
                  onClick={() => setSelectedStyle({
                    id: 'style-2',
                    name: 'Gyosho (行書)',
                    description: 'Semi-cursive style - faster and more fluid',
                    characteristics: ['Flowing strokes', 'Connected characters', 'Faster writing'],
                    difficulty: 'intermediate',
                    examples: ['書', '道', '美', '術', '文', '化'],
                    history: 'Evolved from Kaisho for faster writing',
                    techniques: ['Flowing motion', 'Connected strokes', 'Varied pressure'],
                    tools: ['Fude brush', 'Sumi ink', 'Washi paper'],
                    paper: 'Washi paper',
                    ink: 'Sumi ink'
                  })}
                  className={`w-full p-3 border-base rounded-lg text-left ${
                    selectedStyle?.name === 'Gyosho (行書)' ? 'bg-primary text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">Gyosho (行書)</div>
                  <div className="text-sm opacity-75">Semi-cursive</div>
                </button>
              </div>
            </div>

            {/* Brush Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brush Tool
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedBrush({
                    id: 'brush-1',
                    name: 'Fude Brush',
                    type: 'fude',
                    size: 12,
                    pressure: 0.8,
                    opacity: 1.0,
                    color: '#000000',
                    texture: 'smooth',
                    description: 'Traditional Japanese calligraphy brush',
                    useCase: 'Detailed characters and fine strokes',
                    difficulty: 'intermediate'
                  })}
                  className={`w-full p-3 border-base rounded-lg text-left ${
                    selectedBrush?.name === 'Fude Brush' ? 'bg-primary text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">Fude Brush</div>
                  <div className="text-sm opacity-75">Traditional</div>
                </button>
                <button
                  onClick={() => setSelectedBrush({
                    id: 'brush-2',
                    name: 'Maru Brush',
                    type: 'maru',
                    size: 8,
                    pressure: 0.6,
                    opacity: 0.9,
                    color: '#000000',
                    texture: 'smooth',
                    description: 'Round brush for balanced strokes',
                    useCase: 'General purpose writing',
                    difficulty: 'beginner'
                  })}
                  className={`w-full p-3 border-base rounded-lg text-left ${
                    selectedBrush?.name === 'Maru Brush' ? 'bg-primary text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">Maru Brush</div>
                  <div className="text-sm opacity-75">Round</div>
                </button>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="mt-6 flex items-center justify-center">
            <button
              onClick={handleStartSession}
              disabled={!selectedCharacter || !selectedStyle || !selectedBrush}
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Calligraphy Session
            </button>
          </div>
        </div>
      )}

      {/* Active Session */}
      {currentSession && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="heading text-lg font-semibold">Calligraphy Session</h3>
              <p className="text-sm text-gray-600">
                {currentSession.character.character} - {currentSession.style.name}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                <Pause className="w-4 h-4" />
              </button>
              <button
                onClick={handleEndSession}
                className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {currentSession.progress.strokesCompleted}/{currentSession.progress.totalStrokes}
              </div>
              <div className="text-sm text-gray-600">Strokes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {Math.round(currentSession.progress.accuracy)}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {Math.round(currentSession.progress.styleScore)}%
              </div>
              <div className="text-sm text-gray-600">Style</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {Math.round(currentSession.progress.overallScore)}%
              </div>
              <div className="text-sm text-gray-600">Overall</div>
            </div>
          </div>

          {/* Character Display */}
          <div className="text-center space-y-6">
            <div className="text-8xl font-bold text-primary mb-4">
              {currentSession.character.character}
            </div>
            
            <div className="text-lg text-gray-600 mb-6">
              {currentSession.character.readings.join(', ')} - {currentSession.character.meanings.join(', ')}
            </div>

            {/* Calligraphy Canvas */}
            <div className="bg-gray-50 rounded-lg p-8 mb-6">
              <div className="text-center text-gray-500">
                Calligraphy Canvas
              </div>
            </div>

            {/* Brush Controls */}
            <div className="flex items-center justify-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                <RotateCcw className="w-4 h-4" />
                <span>Undo</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Brush className="w-4 h-4" />
                <span>Clear</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <CheckCircle className="w-4 h-4" />
                <span>Complete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Techniques */}
      {showTechniques && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Calligraphy Techniques</h3>
          <div className="space-y-6">
            {techniques.map((technique, index) => (
              <motion.div
                key={technique.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 border-base rounded-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getTechniqueIcon(technique.difficulty)}
                    <div>
                      <h4 className="font-semibold text-gray-900">{technique.name}</h4>
                      <p className="text-sm text-gray-600">{technique.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(technique.difficulty)}`}>
                    {technique.difficulty}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Steps</h5>
                    <ol className="space-y-1">
                      {technique.steps.map((step, i) => (
                        <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                          <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Tips</h5>
                    <ul className="space-y-1">
                      {technique.tips.map((tip, i) => (
                        <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                          <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Practice Characters</h5>
                  <div className="flex flex-wrap gap-2">
                    {technique.practiceCharacters.map((char) => (
                      <span
                        key={char}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Stats */}
      {showStats && stats && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Calligraphy Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Sessions</span>
                  <span className="text-sm font-medium">{stats.totalSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Characters Practiced</span>
                  <span className="text-sm font-medium">{stats.charactersPracticed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Styles Mastered</span>
                  <span className="text-sm font-medium">{stats.stylesMastered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Score</span>
                  <span className="text-sm font-medium">{stats.averageScore}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Preferences</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Favorite Style</span>
                  <span className="text-sm font-medium">{stats.favoriteStyle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Favorite Brush</span>
                  <span className="text-sm font-medium">{stats.favoriteBrush}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Time</span>
                  <span className="text-sm font-medium">{Math.round(stats.totalTimeSpent / 60)} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Improvement Rate</span>
                  <span className="text-sm font-medium text-green-600">+{stats.improvementRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
