"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Target, Award, Clock, Zap, Eye, Heart, Star, Calendar, Filter, Download, Share2, Settings, RefreshCw, AlertCircle, CheckCircle, Info, ArrowUp, ArrowDown, Minus, Plus, Activity, Users, BookOpen, Target as TargetIcon, Flame, Trophy, BarChart, PieChart, LineChart, Gauge, Timer, Rocket, Speed, Wrench, Hammer, Shield, Award as AwardIcon, Sun, Moon, Coffee, Bed, MemoryStick, Repeat, RotateCcw, Calendar as CalendarIcon } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, Heatmap } from 'recharts';

interface RetentionAnalysisSystemProps {
  userId: string;
  className?: string;
}

interface RetentionMetrics {
  overall: {
    averageRetention: number;
    retentionRate: number;
    forgettingRate: number;
    recoveryRate: number;
    longTermRetention: number;
    shortTermRetention: number;
    consolidation: number;
  };
  patterns: {
    optimalReviewInterval: number;
    decayRate: number;
    recoveryTime: number;
    consolidationTime: number;
    interference: number;
    transfer: number;
  };
  performance: {
    initialLearning: number;
    firstReview: number;
    secondReview: number;
    thirdReview: number;
    longTerm: number;
    mastery: number;
  };
}

interface ForgettingCurve {
  character: string;
  learningDate: string;
  reviews: Array<{
    date: string;
    retention: number;
    difficulty: number;
    timeSinceLastReview: number;
    performance: number;
  }>;
  predictedRetention: number;
  nextReviewDate: string;
  mastery: number;
  totalReviews: number;
  averageRetention: number;
  decayRate: number;
}

interface RetentionDataPoint {
  date: string;
  retention: number;
  forgetting: number;
  recovery: number;
  consolidation: number;
  reviews: number;
  newLearning: number;
  mastery: number;
}

interface SpacedRepetitionData {
  character: string;
  interval: number;
  ease: number;
  repetitions: number;
  lastReview: string;
  nextReview: string;
  retention: number;
  difficulty: number;
  performance: number;
  history: Array<{
    date: string;
    performance: number;
    interval: number;
    ease: number;
  }>;
}

interface RetentionInsight {
  id: string;
  type: 'improvement' | 'decline' | 'plateau' | 'breakthrough' | 'warning';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  actionText?: string;
  actionUrl?: string;
  createdAt: string;
  data?: any;
}

interface RetentionStrategy {
  id: string;
  name: string;
  description: string;
  type: 'spaced-repetition' | 'active-recall' | 'elaboration' | 'interleaving' | 'retrieval-practice';
  effectiveness: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeRequired: number;
  steps: string[];
  tips: string[];
  commonMistakes: string[];
  successCriteria: string[];
}

interface MemoryConsolidation {
  character: string;
  learningPhase: 'encoding' | 'consolidation' | 'retrieval' | 'reconsolidation';
  strength: number;
  stability: number;
  retrievability: number;
  lastAccess: string;
  accessCount: number;
  interference: number;
  context: string[];
  associations: string[];
}

export const RetentionAnalysisSystem: React.FC<RetentionAnalysisSystemProps> = ({
  userId,
  className = ''
}) => {
  const [metrics, setMetrics] = useState<RetentionMetrics | null>(null);
  const [forgettingCurves, setForgettingCurves] = useState<ForgettingCurve[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionDataPoint[]>([]);
  const [spacedRepetitionData, setSpacedRepetitionData] = useState<SpacedRepetitionData[]>([]);
  const [insights, setInsights] = useState<RetentionInsight[]>([]);
  const [strategies, setStrategies] = useState<RetentionStrategy[]>([]);
  const [consolidation, setConsolidation] = useState<MemoryConsolidation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'curves' | 'spaced-repetition' | 'insights' | 'strategies' | 'consolidation'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Mock data - in real app, this would come from analytics service
  useEffect(() => {
    const loadRetentionData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock retention metrics
      const mockMetrics: RetentionMetrics = {
        overall: {
          averageRetention: 78,
          retentionRate: 85,
          forgettingRate: 15,
          recoveryRate: 92,
          longTermRetention: 82,
          shortTermRetention: 75,
          consolidation: 88
        },
        patterns: {
          optimalReviewInterval: 2,
          decayRate: 0.15,
          recoveryTime: 24,
          consolidationTime: 72,
          interference: 0.12,
          transfer: 0.85
        },
        performance: {
          initialLearning: 95,
          firstReview: 88,
          secondReview: 82,
          thirdReview: 78,
          longTerm: 75,
          mastery: 90
        }
      };

      // Mock forgetting curves
      const mockForgettingCurves: ForgettingCurve[] = [
        {
          character: 'あ',
          learningDate: '2024-01-01',
          reviews: [
            { date: '2024-01-02', retention: 85, difficulty: 1, timeSinceLastReview: 1, performance: 90 },
            { date: '2024-01-05', retention: 78, difficulty: 1, timeSinceLastReview: 3, performance: 85 },
            { date: '2024-01-12', retention: 72, difficulty: 1, timeSinceLastReview: 7, performance: 80 },
            { date: '2024-01-26', retention: 68, difficulty: 1, timeSinceLastReview: 14, performance: 75 }
          ],
          predictedRetention: 65,
          nextReviewDate: '2024-02-09',
          mastery: 95,
          totalReviews: 4,
          averageRetention: 76,
          decayRate: 0.12
        },
        {
          character: 'か',
          learningDate: '2024-01-03',
          reviews: [
            { date: '2024-01-05', retention: 82, difficulty: 2, timeSinceLastReview: 2, performance: 85 },
            { date: '2024-01-10', retention: 75, difficulty: 2, timeSinceLastReview: 5, performance: 78 },
            { date: '2024-01-20', retention: 70, difficulty: 2, timeSinceLastReview: 10, performance: 72 }
          ],
          predictedRetention: 65,
          nextReviewDate: '2024-02-03',
          mastery: 85,
          totalReviews: 3,
          averageRetention: 76,
          decayRate: 0.18
        }
      ];

      // Mock retention data
      const mockRetentionData: RetentionDataPoint[] = [
        { date: '2024-01-08', retention: 75, forgetting: 25, recovery: 90, consolidation: 80, reviews: 12, newLearning: 8, mastery: 70 },
        { date: '2024-01-09', retention: 78, forgetting: 22, recovery: 92, consolidation: 82, reviews: 15, newLearning: 10, mastery: 72 },
        { date: '2024-01-10', retention: 80, forgetting: 20, recovery: 94, consolidation: 84, reviews: 18, newLearning: 12, mastery: 75 },
        { date: '2024-01-11', retention: 82, forgetting: 18, recovery: 95, consolidation: 86, reviews: 20, newLearning: 15, mastery: 78 },
        { date: '2024-01-12', retention: 85, forgetting: 15, recovery: 96, consolidation: 88, reviews: 22, newLearning: 18, mastery: 80 },
        { date: '2024-01-13', retention: 87, forgetting: 13, recovery: 97, consolidation: 90, reviews: 25, newLearning: 20, mastery: 82 },
        { date: '2024-01-14', retention: 88, forgetting: 12, recovery: 98, consolidation: 92, reviews: 28, newLearning: 22, mastery: 85 }
      ];

      // Mock spaced repetition data
      const mockSpacedRepetitionData: SpacedRepetitionData[] = [
        {
          character: 'あ',
          interval: 14,
          ease: 2.5,
          repetitions: 4,
          lastReview: '2024-01-14',
          nextReview: '2024-01-28',
          retention: 85,
          difficulty: 1,
          performance: 90,
          history: [
            { date: '2024-01-01', performance: 95, interval: 1, ease: 2.5 },
            { date: '2024-01-02', performance: 90, interval: 3, ease: 2.5 },
            { date: '2024-01-05', performance: 85, interval: 7, ease: 2.5 },
            { date: '2024-01-12', performance: 80, interval: 14, ease: 2.5 }
          ]
        },
        {
          character: 'か',
          interval: 7,
          ease: 2.3,
          repetitions: 3,
          lastReview: '2024-01-13',
          nextReview: '2024-01-20',
          retention: 75,
          difficulty: 2,
          performance: 78,
          history: [
            { date: '2024-01-03', performance: 85, interval: 1, ease: 2.3 },
            { date: '2024-01-05', performance: 80, interval: 2, ease: 2.3 },
            { date: '2024-01-10', performance: 75, interval: 5, ease: 2.3 }
          ]
        }
      ];

      // Mock insights
      const mockInsights: RetentionInsight[] = [
        {
          id: 'insight-1',
          type: 'improvement',
          title: 'Retention Rate Improvement',
          description: 'Your retention rate has improved by 15% over the past month',
          impact: 'high',
          actionable: true,
          actionText: 'Continue current review schedule',
          createdAt: '2024-01-14T10:00:00Z'
        },
        {
          id: 'insight-2',
          type: 'warning',
          title: 'Forgetting Curve Steepening',
          description: 'Some characters are showing steeper forgetting curves',
          impact: 'medium',
          actionable: true,
          actionText: 'Increase review frequency for difficult characters',
          createdAt: '2024-01-14T09:30:00Z'
        }
      ];

      // Mock strategies
      const mockStrategies: RetentionStrategy[] = [
        {
          id: 'strategy-1',
          name: 'Spaced Repetition',
          description: 'Review material at increasing intervals to strengthen memory',
          type: 'spaced-repetition',
          effectiveness: 95,
          difficulty: 'easy',
          timeRequired: 15,
          steps: [
            'Learn new material',
            'Review after 1 day',
            'Review after 3 days',
            'Review after 1 week',
            'Review after 2 weeks',
            'Review after 1 month'
          ],
          tips: [
            'Use consistent review schedule',
            'Adjust intervals based on performance',
            'Focus on difficult items',
            'Don\'t skip reviews'
          ],
          commonMistakes: [
            'Reviewing too frequently',
            'Not adjusting intervals',
            'Skipping difficult items',
            'Inconsistent schedule'
          ],
          successCriteria: [
            '90% retention rate',
            'Consistent review schedule',
            'Improved long-term memory',
            'Reduced study time'
          ]
        },
        {
          id: 'strategy-2',
          name: 'Active Recall',
          description: 'Actively retrieve information from memory without cues',
          type: 'active-recall',
          effectiveness: 85,
          difficulty: 'medium',
          timeRequired: 20,
          steps: [
            'Study material thoroughly',
            'Put away all notes and sources',
            'Try to recall information',
            'Check accuracy against sources',
            'Repeat for missed items',
            'Review correct answers'
          ],
          tips: [
            'Test yourself regularly',
            'Use different question types',
            'Focus on understanding, not memorization',
            'Review mistakes carefully'
          ],
          commonMistakes: [
            'Peeking at answers',
            'Not testing regularly',
            'Focusing only on easy items',
            'Not reviewing mistakes'
          ],
          successCriteria: [
            'Improved recall accuracy',
            'Better understanding',
            'Faster retrieval',
            'Longer retention'
          ]
        }
      ];

      // Mock consolidation data
      const mockConsolidation: MemoryConsolidation[] = [
        {
          character: 'あ',
          learningPhase: 'consolidation',
          strength: 85,
          stability: 80,
          retrievability: 90,
          lastAccess: '2024-01-14T10:30:00Z',
          accessCount: 15,
          interference: 0.1,
          context: ['hiragana', 'vowels', 'basic'],
          associations: ['い', 'う', 'え', 'お']
        },
        {
          character: 'か',
          learningPhase: 'retrieval',
          strength: 75,
          stability: 70,
          retrievability: 80,
          lastAccess: '2024-01-13T15:20:00Z',
          accessCount: 12,
          interference: 0.15,
          context: ['hiragana', 'consonants', 'ka-line'],
          associations: ['き', 'く', 'け', 'こ']
        }
      ];

      setMetrics(mockMetrics);
      setForgettingCurves(mockForgettingCurves);
      setRetentionData(mockRetentionData);
      setSpacedRepetitionData(mockSpacedRepetitionData);
      setInsights(mockInsights);
      setStrategies(mockStrategies);
      setConsolidation(mockConsolidation);
      setIsLoading(false);
    };

    loadRetentionData();
  }, [userId, selectedPeriod]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'decline': return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'plateau': return <Minus className="w-5 h-5 text-yellow-500" />;
      case 'breakthrough': return <Trophy className="w-5 h-5 text-blue-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'improvement': return 'border-green-200 bg-green-50';
      case 'decline': return 'border-red-200 bg-red-50';
      case 'plateau': return 'border-yellow-200 bg-yellow-50';
      case 'breakthrough': return 'border-blue-200 bg-blue-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'encoding': return 'text-blue-600 bg-blue-50';
      case 'consolidation': return 'text-green-600 bg-green-50';
      case 'retrieval': return 'text-purple-600 bg-purple-50';
      case 'reconsolidation': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStrategyIcon = (type: string) => {
    switch (type) {
      case 'spaced-repetition': return <Repeat className="w-5 h-5 text-blue-500" />;
      case 'active-recall': return <Brain className="w-5 h-5 text-green-500" />;
      case 'elaboration': return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'interleaving': return <RotateCcw className="w-5 h-5 text-purple-500" />;
      case 'retrieval-practice': return <Target className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Analyzing retention patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Retention Analysis System</h2>
          <p className="body text-gray-600">
            Analyze memory retention patterns and optimize learning with forgetting curves
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart },
          { id: 'curves', label: 'Forgetting Curves', icon: TrendingDown },
          { id: 'spaced-repetition', label: 'Spaced Repetition', icon: Repeat },
          { id: 'insights', label: 'Insights', icon: Brain },
          { id: 'strategies', label: 'Strategies', icon: Lightbulb },
          { id: 'consolidation', label: 'Consolidation', icon: MemoryStick }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedView(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              selectedView === tab.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && metrics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Brain className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-500">Avg Retention</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.averageRetention}%</div>
              <div className="text-xs text-gray-600">Overall</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-500">Retention Rate</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.retentionRate}%</div>
              <div className="text-xs text-gray-600">Rate</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <TrendingDown className="w-5 h-5 text-red-500" />
                <span className="text-xs text-gray-500">Forgetting Rate</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.forgettingRate}%</div>
              <div className="text-xs text-gray-600">Rate</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <RotateCcw className="w-5 h-5 text-purple-500" />
                <span className="text-xs text-gray-500">Recovery Rate</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.recoveryRate}%</div>
              <div className="text-xs text-gray-600">Rate</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-xs text-gray-500">Long-term</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.longTermRetention}%</div>
              <div className="text-xs text-gray-600">Retention</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-xs text-gray-500">Short-term</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.shortTermRetention}%</div>
              <div className="text-xs text-gray-600">Retention</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <MemoryStick className="w-5 h-5 text-indigo-500" />
                <span className="text-xs text-gray-500">Consolidation</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.consolidation}%</div>
              <div className="text-xs text-gray-600">Score</div>
            </div>
          </div>

          {/* Performance Over Time */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Retention Performance Over Time</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="retention" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="forgetting" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="recovery" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="consolidation" stroke="#8b5cf6" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Learning Phases */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Learning Phase Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.performance.initialLearning}%</div>
                <div className="text-sm text-gray-600">Initial Learning</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.performance.firstReview}%</div>
                <div className="text-sm text-gray-600">First Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.performance.secondReview}%</div>
                <div className="text-sm text-gray-600">Second Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.performance.thirdReview}%</div>
                <div className="text-sm text-gray-600">Third Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.performance.longTerm}%</div>
                <div className="text-sm text-gray-600">Long-term</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.performance.mastery}%</div>
                <div className="text-sm text-gray-600">Mastery</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forgetting Curves Tab */}
      {selectedView === 'curves' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Forgetting Curves</h3>
            <div className="space-y-6">
              {forgettingCurves.map((curve, index) => (
                <motion.div
                  key={curve.character}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-6 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl font-bold text-primary">{curve.character}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Forgetting Curve Analysis</h4>
                        <p className="text-sm text-gray-600">
                          Learned: {new Date(curve.learningDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{curve.averageRetention}%</div>
                      <div className="text-sm text-gray-600">Avg Retention</div>
                    </div>
                  </div>
                  
                  {/* Forgetting Curve Chart */}
                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={curve.reviews}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timeSinceLastReview" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="retention" stroke="#ef4444" strokeWidth={2} />
                        <Line type="monotone" dataKey="performance" stroke="#10b981" strokeWidth={2} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{curve.totalReviews}</div>
                      <div className="text-sm text-gray-600">Total Reviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{curve.mastery}%</div>
                      <div className="text-sm text-gray-600">Mastery</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{curve.decayRate.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Decay Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">
                        {new Date(curve.nextReviewDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">Next Review</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Spaced Repetition Tab */}
      {selectedView === 'spaced-repetition' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Spaced Repetition Data</h3>
            <div className="space-y-4">
              {spacedRepetitionData.map((item, index) => (
                <motion.div
                  key={item.character}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl font-bold text-primary">{item.character}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Spaced Repetition Status</h4>
                        <p className="text-sm text-gray-600">
                          Last review: {new Date(item.lastReview).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{item.retention}%</div>
                      <div className="text-sm text-gray-600">Retention</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{item.interval}</div>
                      <div className="text-sm text-gray-600">Interval (days)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{item.ease.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Ease Factor</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{item.repetitions}</div>
                      <div className="text-sm text-gray-600">Repetitions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{item.difficulty}</div>
                      <div className="text-sm text-gray-600">Difficulty</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{item.performance}%</div>
                      <div className="text-sm text-gray-600">Performance</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Next review: {new Date(item.nextReview).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {selectedView === 'insights' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Retention Insights</h3>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`p-4 border rounded-lg ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                          {insight.impact} impact
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                      {insight.actionable && insight.actionText && (
                        <button className="text-sm text-primary hover:text-primary-dark font-medium">
                          {insight.actionText} →
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Strategies Tab */}
      {selectedView === 'strategies' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Retention Strategies</h3>
            <div className="space-y-6">
              {strategies.map((strategy, index) => (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-6 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStrategyIcon(strategy.type)}
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{strategy.name}</h4>
                        <p className="text-gray-600">{strategy.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{strategy.effectiveness}% effective</span>
                      <span className={`px-2 py-1 rounded text-sm ${getDifficultyColor(strategy.difficulty)}`}>
                        {strategy.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Implementation Steps</h5>
                      <ol className="space-y-1">
                        {strategy.steps.map((step, i) => (
                          <li key={i} className="flex items-start space-x-2 text-sm text-gray-600">
                            <span className="w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center flex-shrink-0">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Success Criteria</h5>
                      <ul className="space-y-1">
                        {strategy.successCriteria.map((criteria, i) => (
                          <li key={i} className="text-sm text-gray-600">• {criteria}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Time required: {strategy.timeRequired} minutes
                    </div>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                      Start Strategy
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Consolidation Tab */}
      {selectedView === 'consolidation' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Memory Consolidation</h3>
            <div className="space-y-4">
              {consolidation.map((item, index) => (
                <motion.div
                  key={item.character}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl font-bold text-primary">{item.character}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Memory Consolidation Status</h4>
                        <p className="text-sm text-gray-600">
                          Last access: {new Date(item.lastAccess).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPhaseColor(item.learningPhase)}`}>
                      {item.learningPhase}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{item.strength}%</div>
                      <div className="text-sm text-gray-600">Strength</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{item.stability}%</div>
                      <div className="text-sm text-gray-600">Stability</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{item.retrievability}%</div>
                      <div className="text-sm text-gray-600">Retrievability</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{item.accessCount}</div>
                      <div className="text-sm text-gray-600">Access Count</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Context</h5>
                      <div className="flex flex-wrap gap-1">
                        {item.context.map((ctx) => (
                          <span key={ctx} className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm">
                            {ctx}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Associations</h5>
                      <div className="flex flex-wrap gap-1">
                        {item.associations.map((assoc) => (
                          <span key={assoc} className="px-2 py-1 bg-green-100 text-green-600 rounded text-sm">
                            {assoc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
