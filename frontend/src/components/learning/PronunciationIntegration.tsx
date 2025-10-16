"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, SkipForward, Mic, MicOff, Settings, Download, Share2, Star, Heart, Bookmark, Target, TrendingUp, Award, Zap, RotateCcw, CheckCircle, X, AlertCircle, Info } from 'lucide-react';
import type { Character } from '@/types/character';

interface PronunciationIntegrationProps {
  userId: string;
  className?: string;
}

interface PronunciationData {
  character: string;
  readings: string[];
  audioUrl: string;
  phoneticTranscription: string;
  syllableBreakdown: string[];
  stressPattern: string;
  mouthPosition: string;
  tonguePosition: string;
  commonMistakes: string[];
  pronunciationTips: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  frequency: number;
}

interface PronunciationSession {
  id: string;
  character: Character;
  startTime: string;
  endTime?: string;
  isActive: boolean;
  attempts: Array<{
    id: string;
    timestamp: string;
    audioBlob?: Blob;
    confidence: number;
    accuracy: number;
    feedback: string[];
    suggestions: string[];
  }>;
  progress: {
    attemptsCount: number;
    bestAccuracy: number;
    averageAccuracy: number;
    improvementRate: number;
    timeSpent: number;
  };
  settings: {
    playbackSpeed: number;
    repeatCount: number;
    autoAdvance: boolean;
    showTranscription: boolean;
    showMouthPosition: boolean;
    showTonguePosition: boolean;
    enableRecording: boolean;
  };
}

interface PronunciationStats {
  totalSessions: number;
  charactersPracticed: number;
  averageAccuracy: number;
  bestAccuracy: number;
  totalTimeSpent: number;
  improvementRate: number;
  favoriteCharacters: string[];
  difficultSounds: string[];
  masteredSounds: string[];
  pronunciationLevel: 'beginner' | 'intermediate' | 'advanced' | 'native';
  streak: number;
  lastPracticeDate: string;
}

interface PronunciationExercise {
  id: string;
  type: 'single' | 'word' | 'sentence' | 'conversation';
  title: string;
  description: string;
  characters: Character[];
  audioUrl: string;
  transcript: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  learningObjectives: string[];
  commonMistakes: string[];
  tips: string[];
}

interface VoiceAnalysis {
  pitch: number;
  volume: number;
  clarity: number;
  speed: number;
  rhythm: number;
  intonation: number;
  overallScore: number;
  feedback: string[];
  suggestions: string[];
}

export const PronunciationIntegration: React.FC<PronunciationIntegrationProps> = ({
  userId,
  className = ''
}) => {
  const [currentSession, setCurrentSession] = useState<PronunciationSession | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [pronunciationData, setPronunciationData] = useState<PronunciationData | null>(null);
  const [stats, setStats] = useState<PronunciationStats | null>(null);
  const [exercises, setExercises] = useState<PronunciationExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<PronunciationExercise | null>(null);
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Mock data - in real app, this would come from pronunciation service
  useEffect(() => {
    const loadPronunciationData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock pronunciation data
      const mockPronunciationData: PronunciationData = {
        character: 'あ',
        readings: ['a'],
        audioUrl: '/audio/hiragana-a.mp3',
        phoneticTranscription: '/a/',
        syllableBreakdown: ['a'],
        stressPattern: 'flat',
        mouthPosition: 'Open, relaxed jaw',
        tonguePosition: 'Low, relaxed',
        commonMistakes: ['Making it too long', 'Adding stress'],
        pronunciationTips: ['Keep it short and crisp', 'Relax your jaw'],
        difficulty: 'easy',
        frequency: 10
      };

      // Mock exercises
      const mockExercises: PronunciationExercise[] = [
        {
          id: 'ex-1',
          type: 'single',
          title: 'Basic Vowels',
          description: 'Practice the five basic Japanese vowels',
          characters: [
            {
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
              learningTips: ['Think of it as a person with arms up'],
              commonWords: ['あめ (rain)', 'あさ (morning)'],
              culturalNotes: ['First character many learn'],
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z'
            }
          ],
          audioUrl: '/audio/basic-vowels.mp3',
          transcript: 'あ い う え お',
          difficulty: 'easy',
          duration: 30,
          learningObjectives: ['Master basic vowel sounds', 'Develop proper mouth position'],
          commonMistakes: ['Adding English stress patterns', 'Making vowels too long'],
          tips: ['Keep vowels short and crisp', 'Practice with a mirror']
        },
        {
          id: 'ex-2',
          type: 'word',
          title: 'Common Words',
          description: 'Practice pronunciation with common Japanese words',
          characters: [],
          audioUrl: '/audio/common-words.mp3',
          transcript: 'こんにちは ありがとう さようなら',
          difficulty: 'medium',
          duration: 60,
          learningObjectives: ['Practice word-level pronunciation', 'Learn natural rhythm'],
          commonMistakes: ['Stressing wrong syllables', 'Rushing through words'],
          tips: ['Focus on rhythm', 'Practice slowly first']
        }
      ];

      // Mock stats
      const mockStats: PronunciationStats = {
        totalSessions: 32,
        charactersPracticed: 67,
        averageAccuracy: 78,
        bestAccuracy: 95,
        totalTimeSpent: 1800,
        improvementRate: 15,
        favoriteCharacters: ['あ', 'い', 'う', 'え', 'お'],
        difficultSounds: ['り', 'つ', 'ふ'],
        masteredSounds: ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ'],
        pronunciationLevel: 'intermediate',
        streak: 7,
        lastPracticeDate: '2024-01-15T10:30:00Z'
      };

      setPronunciationData(mockPronunciationData);
      setExercises(mockExercises);
      setStats(mockStats);
      setIsLoading(false);
    };

    loadPronunciationData();
  }, [userId]);

  const handleStartSession = (character: Character) => {
    const newSession: PronunciationSession = {
      id: `session-${Date.now()}`,
      character,
      startTime: new Date().toISOString(),
      isActive: true,
      attempts: [],
      progress: {
        attemptsCount: 0,
        bestAccuracy: 0,
        averageAccuracy: 0,
        improvementRate: 0,
        timeSpent: 0
      },
      settings: {
        playbackSpeed: 1.0,
        repeatCount: 3,
        autoAdvance: false,
        showTranscription: true,
        showMouthPosition: true,
        showTonguePosition: false,
        enableRecording: true
      }
    };

    setCurrentSession(newSession);
    setSelectedCharacter(character);
  };

  const handleEndSession = () => {
    if (!currentSession) return;

    const finalSession: PronunciationSession = {
      ...currentSession,
      endTime: new Date().toISOString(),
      isActive: false
    };

    setCurrentSession(null);
    setSelectedCharacter(null);
  };

  const handlePlayAudio = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // In a real app, this would start recording audio
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // In a real app, this would stop recording and analyze the audio
    const mockAnalysis: VoiceAnalysis = {
      pitch: 85,
      volume: 78,
      clarity: 82,
      speed: 75,
      rhythm: 80,
      intonation: 77,
      overallScore: 80,
      feedback: [
        'Good clarity overall',
        'Slight hesitation in the middle',
        'Good rhythm and pace'
      ],
      suggestions: [
        'Practice the middle sound more',
        'Try to maintain consistent volume',
        'Work on smoother transitions'
      ]
    };
    setVoiceAnalysis(mockAnalysis);
  };

  const handleAnalyzePronunciation = () => {
    // Simulate pronunciation analysis
    const mockAnalysis: VoiceAnalysis = {
      pitch: 88,
      volume: 82,
      clarity: 85,
      speed: 78,
      rhythm: 83,
      intonation: 80,
      overallScore: 83,
      feedback: [
        'Excellent clarity',
        'Good rhythm and pace',
        'Natural intonation'
      ],
      suggestions: [
        'Slightly increase volume',
        'Work on smoother transitions',
        'Practice with longer phrases'
      ]
    };
    setVoiceAnalysis(mockAnalysis);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      case 'native': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading pronunciation system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Pronunciation Integration</h2>
          <p className="body text-gray-600">
            Master Japanese pronunciation with AI-powered feedback and analysis
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showSettings
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            <Settings className="w-4 h-4" />
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
              <h3 className="heading text-lg font-semibold">Accuracy</h3>
              <Target className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.averageAccuracy}%
            </div>
            <div className="text-sm text-gray-600">
              Average pronunciation accuracy
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Level</h3>
              <Award className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.pronunciationLevel}
            </div>
            <div className="text-sm text-gray-600">
              Current pronunciation level
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Streak</h3>
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.streak}
            </div>
            <div className="text-sm text-gray-600">
              Days of practice
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Improvement</h3>
              <TrendingUp className="w-6 h-6 text-blue-500" />
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

      {/* Character Selection */}
      {!currentSession && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Practice Pronunciation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し'].map((char) => (
              <button
                key={char}
                onClick={() => handleStartSession({
                  id: `hiragana-${char}`,
                  character: char,
                  type: 'hiragana',
                  readings: [char],
                  meanings: ['sound'],
                  difficulty: 1,
                  frequency: 10,
                  strokeCount: 3,
                  radicals: [],
                  similarCharacters: [],
                  learningTips: ['Practice pronunciation'],
                  commonWords: [`${char} (sound)`],
                  culturalNotes: ['Basic character'],
                  createdAt: '2024-01-01T00:00:00Z',
                  updatedAt: '2024-01-01T00:00:00Z'
                })}
                className="p-4 border-base rounded-lg text-center text-2xl font-bold hover:bg-primary hover:text-white transition-colors"
              >
                {char}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Session */}
      {currentSession && selectedCharacter && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="heading text-lg font-semibold">Pronunciation Session</h3>
              <p className="text-sm text-gray-600">
                {selectedCharacter.character} - {selectedCharacter.readings.join(', ')}
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

          {/* Character Display */}
          <div className="text-center space-y-6">
            <div className="text-8xl font-bold text-primary mb-4">
              {selectedCharacter.character}
            </div>
            
            <div className="text-lg text-gray-600 mb-6">
              {selectedCharacter.readings.join(', ')} - {selectedCharacter.meanings.join(', ')}
            </div>

            {/* Audio Controls */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handlePlayAudio}
                className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                  isRecording
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                <span>{isRecording ? 'Stop' : 'Record'}</span>
              </button>
              <button
                onClick={handleAnalyzePronunciation}
                className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Analyze</span>
              </button>
            </div>

            {/* Pronunciation Guide */}
            {pronunciationData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Mouth Position</h4>
                  <p className="text-sm text-gray-700">{pronunciationData.mouthPosition}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Tongue Position</h4>
                  <p className="text-sm text-gray-700">{pronunciationData.tonguePosition}</p>
                </div>
              </div>
            )}

            {/* Voice Analysis Results */}
            {voiceAnalysis && (
              <div className="bg-white border-base rounded-lg p-6 mt-8">
                <h4 className="font-semibold text-gray-900 mb-4">Voice Analysis</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-1 ${getScoreColor(voiceAnalysis.pitch)}`}>
                      {voiceAnalysis.pitch}%
                    </div>
                    <div className="text-sm text-gray-600">Pitch</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-1 ${getScoreColor(voiceAnalysis.clarity)}`}>
                      {voiceAnalysis.clarity}%
                    </div>
                    <div className="text-sm text-gray-600">Clarity</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-1 ${getScoreColor(voiceAnalysis.overallScore)}`}>
                      {voiceAnalysis.overallScore}%
                    </div>
                    <div className="text-sm text-gray-600">Overall</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Feedback</h5>
                  {voiceAnalysis.feedback.map((feedback, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feedback}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2 mt-4">
                  <h5 className="font-medium text-gray-900">Suggestions</h5>
                  {voiceAnalysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exercises */}
      <div className="bg-white border-base rounded-lg p-6 shadow-sm">
        <h3 className="heading text-lg font-semibold mb-4">Pronunciation Exercises</h3>
        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 border-base rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{exercise.title}</h4>
                  <p className="text-sm text-gray-600">{exercise.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                    {exercise.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">{exercise.duration}s</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Learning Objectives</h5>
                  <ul className="space-y-1">
                    {exercise.learningObjectives.map((objective, i) => (
                      <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                        <Target className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Tips</h5>
                  <ul className="space-y-1">
                    {exercise.tips.map((tip, i) => (
                      <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Transcript: {exercise.transcript}
                </div>
                <button
                  onClick={() => setCurrentExercise(exercise)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Start Exercise
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detailed Stats */}
      {showStats && stats && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Pronunciation Statistics</h3>
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
                  <span className="text-sm text-gray-600">Average Accuracy</span>
                  <span className="text-sm font-medium">{stats.averageAccuracy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Best Accuracy</span>
                  <span className="text-sm font-medium">{stats.bestAccuracy}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Progress</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mastered Sounds</span>
                  <span className="text-sm font-medium">{stats.masteredSounds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Difficult Sounds</span>
                  <span className="text-sm font-medium">{stats.difficultSounds.length}</span>
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
