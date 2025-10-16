"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, MapPin, Users, Heart, Star, Award, TrendingUp, Eye, Play, Pause, Volume2, VolumeX, Share2, Bookmark, Download, Info, AlertCircle, CheckCircle, X, ArrowRight, ArrowLeft } from 'lucide-react';
import type { Character } from '@/types/character';

interface CulturalContextLearningProps {
  userId: string;
  className?: string;
}

interface CulturalContext {
  id: string;
  character: string;
  title: string;
  description: string;
  history: string;
  etymology: string;
  culturalSignificance: string;
  modernUsage: string;
  regionalVariations: string[];
  relatedCharacters: string[];
  idioms: Array<{
    phrase: string;
    meaning: string;
    usage: string;
    example: string;
  }>;
  traditions: Array<{
    name: string;
    description: string;
    significance: string;
    practices: string[];
  }>;
  artForms: Array<{
    name: string;
    description: string;
    examples: string[];
    techniques: string[];
  }>;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeToComplete: number;
  learningObjectives: string[];
  keyTakeaways: string[];
}

interface CulturalJourney {
  id: string;
  title: string;
  description: string;
  theme: 'history' | 'art' | 'literature' | 'traditions' | 'modern' | 'regional';
  characters: Character[];
  contexts: CulturalContext[];
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress: {
    completed: number;
    total: number;
    currentContext: string;
    timeSpent: number;
  };
  rewards: {
    xp: number;
    badges: string[];
    unlocks: string[];
  };
}

interface CulturalStats {
  totalJourneys: number;
  contextsCompleted: number;
  charactersStudied: number;
  timeSpent: number;
  favoriteTheme: string;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  culturalKnowledge: number;
  historicalUnderstanding: number;
  modernUsage: number;
  regionalAwareness: number;
  lastActivity: string;
  streak: number;
}

export const CulturalContextLearning: React.FC<CulturalContextLearningProps> = ({
  userId,
  className = ''
}) => {
  const [currentJourney, setCurrentJourney] = useState<CulturalJourney | null>(null);
  const [currentContext, setCurrentContext] = useState<CulturalContext | null>(null);
  const [stats, setStats] = useState<CulturalStats | null>(null);
  const [journeys, setJourneys] = useState<CulturalJourney[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Mock data - in real app, this would come from cultural context service
  useEffect(() => {
    const loadCulturalData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock cultural contexts
      const mockContexts: CulturalContext[] = [
        {
          id: 'context-1',
          character: '桜',
          title: 'The Cherry Blossom (桜)',
          description: 'Explore the deep cultural significance of cherry blossoms in Japanese society',
          history: 'Cherry blossoms have been celebrated in Japan for over 1000 years, first mentioned in the Manyoshu poetry collection from the 8th century.',
          etymology: 'The character 桜 combines 木 (tree) with 嬰 (infant), suggesting the delicate, fleeting nature of the blossoms.',
          culturalSignificance: 'Cherry blossoms represent the ephemeral nature of life, beauty, and the arrival of spring. They are deeply embedded in Japanese philosophy and aesthetics.',
          modernUsage: 'Today, cherry blossoms are used in everything from corporate logos to seasonal products, maintaining their cultural importance.',
          regionalVariations: ['Somei Yoshino (Tokyo)', 'Yamazakura (Mountain areas)', 'Shidarezakura (Weeping variety)'],
          relatedCharacters: ['花', '春', '美', '自然'],
          idioms: [
            {
              phrase: '桜の花見',
              meaning: 'Cherry blossom viewing',
              usage: 'A traditional spring activity',
              example: '家族で桜の花見に行きました。'
            }
          ],
          traditions: [
            {
              name: 'Hanami',
              description: 'The tradition of viewing and appreciating cherry blossoms',
              significance: 'Celebrates the beauty of nature and the transient nature of life',
              practices: ['Picnicking under trees', 'Writing poetry', 'Photography', 'Evening illuminations']
            }
          ],
          artForms: [
            {
              name: 'Ukiyo-e',
              description: 'Woodblock prints featuring cherry blossoms',
              examples: ['Hiroshige\'s "Cherry Blossoms at Ueno"', 'Hokusai\'s spring scenes'],
              techniques: ['Woodblock printing', 'Color gradation', 'Seasonal themes']
            }
          ],
          difficulty: 'intermediate',
          timeToComplete: 15,
          learningObjectives: ['Understand cultural significance', 'Learn related vocabulary', 'Explore historical context'],
          keyTakeaways: ['Cherry blossoms symbolize transience', 'Hanami is a major cultural event', 'Art and literature celebrate sakura']
        }
      ];

      // Mock journeys
      const mockJourneys: CulturalJourney[] = [
        {
          id: 'journey-1',
          title: 'Seasons of Japan',
          description: 'Explore how Japanese characters reflect the four seasons and their cultural importance',
          theme: 'traditions',
          characters: [],
          contexts: mockContexts,
          duration: 60,
          difficulty: 'beginner',
          progress: {
            completed: 0,
            total: 4,
            currentContext: 'context-1',
            timeSpent: 0
          },
          rewards: {
            xp: 500,
            badges: ['Season Master', 'Cultural Explorer'],
            unlocks: ['Advanced seasonal content', 'Traditional recipes']
          }
        }
      ];

      // Mock stats
      const mockStats: CulturalStats = {
        totalJourneys: 3,
        contextsCompleted: 8,
        charactersStudied: 24,
        timeSpent: 1800,
        favoriteTheme: 'traditions',
        masteryLevel: 'intermediate',
        culturalKnowledge: 75,
        historicalUnderstanding: 68,
        modernUsage: 82,
        regionalAwareness: 45,
        lastActivity: '2024-01-15T10:30:00Z',
        streak: 5
      };

      setJourneys(mockJourneys);
      setStats(mockStats);
      setCurrentContext(mockContexts[0]);
      setIsLoading(false);
    };

    loadCulturalData();
  }, [userId]);

  const handleStartJourney = (journey: CulturalJourney) => {
    setCurrentJourney(journey);
    setCurrentStep(0);
  };

  const handleEndJourney = () => {
    setCurrentJourney(null);
    setCurrentStep(0);
  };

  const handleNextStep = () => {
    if (currentJourney && currentStep < currentJourney.contexts.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'history': return 'text-blue-600 bg-blue-50';
      case 'art': return 'text-purple-600 bg-purple-50';
      case 'literature': return 'text-green-600 bg-green-50';
      case 'traditions': return 'text-red-600 bg-red-50';
      case 'modern': return 'text-yellow-600 bg-yellow-50';
      case 'regional': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      case 'expert': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getMasteryIcon = (level: string) => {
    switch (level) {
      case 'beginner': return <BookOpen className="w-5 h-5 text-green-500" />;
      case 'intermediate': return <TrendingUp className="w-5 h-5 text-yellow-500" />;
      case 'advanced': return <Award className="w-5 h-5 text-red-500" />;
      case 'expert': return <Star className="w-5 h-5 text-purple-500" />;
      default: return <BookOpen className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading cultural context...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Cultural Context Learning</h2>
          <p className="body text-gray-600">
            Discover the rich cultural heritage behind Japanese characters
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
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
              <h3 className="heading text-lg font-semibold">Mastery Level</h3>
              {getMasteryIcon(stats.masteryLevel)}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.masteryLevel}
            </div>
            <div className="text-sm text-gray-600">
              Cultural understanding
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Journeys</h3>
              <MapPin className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.totalJourneys}
            </div>
            <div className="text-sm text-gray-600">
              Cultural journeys completed
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Knowledge</h3>
              <BookOpen className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.culturalKnowledge}%
            </div>
            <div className="text-sm text-gray-600">
              Cultural knowledge score
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
              Days of cultural learning
            </div>
          </div>
        </div>
      )}

      {/* Journey Selection */}
      {!currentJourney && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Cultural Journeys</h3>
          <div className="space-y-4">
            {journeys.map((journey, index) => (
              <motion.div
                key={journey.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 border-base rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{journey.title}</h4>
                    <p className="text-sm text-gray-600">{journey.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getThemeColor(journey.theme)}`}>
                      {journey.theme}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(journey.difficulty)}`}>
                      {journey.difficulty}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{journey.duration} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span>{journey.contexts.length} contexts</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Star className="w-4 h-4" />
                    <span>{journey.rewards.xp} XP</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Progress: {journey.progress.completed}/{journey.progress.total} completed
                  </div>
                  <button
                    onClick={() => handleStartJourney(journey)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Start Journey
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Active Journey */}
      {currentJourney && currentContext && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="heading text-lg font-semibold">{currentJourney.title}</h3>
              <p className="text-sm text-gray-600">
                Step {currentStep + 1} of {currentJourney.contexts.length}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousStep}
                disabled={currentStep === 0}
                className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextStep}
                disabled={currentStep === currentJourney.contexts.length - 1}
                className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleEndJourney}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / currentJourney.contexts.length) * 100}%` }}
            />
          </div>

          {/* Cultural Context Content */}
          <div className="space-y-6">
            {/* Character Display */}
            <div className="text-center">
              <div className="text-8xl font-bold text-primary mb-4">
                {currentContext.character}
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                {currentContext.title}
              </h4>
              <p className="text-lg text-gray-600">
                {currentContext.description}
              </p>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* History & Etymology */}
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">History</h5>
                  <p className="text-sm text-blue-800">{currentContext.history}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h5 className="font-semibold text-green-900 mb-2">Etymology</h5>
                  <p className="text-sm text-green-800">{currentContext.etymology}</p>
                </div>
              </div>

              {/* Cultural Significance & Modern Usage */}
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h5 className="font-semibold text-purple-900 mb-2">Cultural Significance</h5>
                  <p className="text-sm text-purple-800">{currentContext.culturalSignificance}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h5 className="font-semibold text-yellow-900 mb-2">Modern Usage</h5>
                  <p className="text-sm text-yellow-800">{currentContext.modernUsage}</p>
                </div>
              </div>
            </div>

            {/* Idioms */}
            {currentContext.idioms.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3">Related Idioms</h5>
                <div className="space-y-3">
                  {currentContext.idioms.map((idiom, index) => (
                    <div key={index} className="bg-white rounded-lg p-3">
                      <div className="font-medium text-gray-900">{idiom.phrase}</div>
                      <div className="text-sm text-gray-600">{idiom.meaning}</div>
                      <div className="text-sm text-gray-500 italic">{idiom.example}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Traditions */}
            {currentContext.traditions.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4">
                <h5 className="font-semibold text-red-900 mb-3">Traditions</h5>
                <div className="space-y-3">
                  {currentContext.traditions.map((tradition, index) => (
                    <div key={index} className="bg-white rounded-lg p-3">
                      <div className="font-medium text-gray-900">{tradition.name}</div>
                      <div className="text-sm text-gray-600">{tradition.description}</div>
                      <div className="text-sm text-gray-500">{tradition.significance}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Art Forms */}
            {currentContext.artForms.length > 0 && (
              <div className="bg-indigo-50 rounded-lg p-4">
                <h5 className="font-semibold text-indigo-900 mb-3">Art Forms</h5>
                <div className="space-y-3">
                  {currentContext.artForms.map((art, index) => (
                    <div key={index} className="bg-white rounded-lg p-3">
                      <div className="font-medium text-gray-900">{art.name}</div>
                      <div className="text-sm text-gray-600">{art.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed Stats */}
      {showStats && stats && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Cultural Learning Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Progress</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Journeys</span>
                  <span className="text-sm font-medium">{stats.totalJourneys}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Contexts Completed</span>
                  <span className="text-sm font-medium">{stats.contextsCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Characters Studied</span>
                  <span className="text-sm font-medium">{stats.charactersStudied}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Time Spent</span>
                  <span className="text-sm font-medium">{Math.round(stats.timeSpent / 60)} minutes</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Knowledge Areas</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cultural Knowledge</span>
                  <span className="text-sm font-medium">{stats.culturalKnowledge}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Historical Understanding</span>
                  <span className="text-sm font-medium">{stats.historicalUnderstanding}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Modern Usage</span>
                  <span className="text-sm font-medium">{stats.modernUsage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Regional Awareness</span>
                  <span className="text-sm font-medium">{stats.regionalAwareness}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
