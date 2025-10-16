"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Target, Award, Clock, Zap, Eye, Heart, Star, Calendar, Filter, Download, Share2, Settings, RefreshCw, AlertCircle, CheckCircle, Info, ArrowUp, ArrowDown, Minus, Plus, Activity, BookOpen, Target as TargetIcon, Flame, Trophy, BarChart, PieChart, LineChart, Gauge, Timer, Rocket, Speed, Wrench, Hammer, Shield, Award as AwardIcon, Sun, Moon, Coffee, Bed, MemoryStick, Repeat, RotateCcw, Calendar as CalendarIcon, Crown, Medal, Flag, Globe, UserCheck, UserX, UserPlus, Map, Navigation, Compass, ArrowRight, ArrowLeft, Play, Pause, SkipForward, RotateCcw as RotateCcwIcon, Focus, Layers, GitBranch, GitCommit, GitMerge, GitPullRequest, CrystalBall, Predictions, Future, Timeline, Forecast } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, Heatmap } from 'recharts';

interface PredictiveLearningInsightsProps {
  userId: string;
  className?: string;
}

interface PredictionMetrics {
  overall: {
    accuracy: number;
    confidence: number;
    reliability: number;
    improvement: number;
    trend: 'improving' | 'declining' | 'stable';
    nextMilestone: string;
    estimatedCompletion: string;
  };
  performance: {
    predictedAccuracy: number;
    predictedSpeed: number;
    predictedRetention: number;
    predictedEngagement: number;
    predictedEfficiency: number;
    predictedMastery: number;
  };
  timeline: {
    shortTerm: {
      timeframe: '1week' | '2weeks' | '1month';
      predictions: Prediction[];
    };
    mediumTerm: {
      timeframe: '3months' | '6months';
      predictions: Prediction[];
    };
    longTerm: {
      timeframe: '1year' | '2years';
      predictions: Prediction[];
    };
  };
}

interface Prediction {
  id: string;
  type: 'performance' | 'milestone' | 'achievement' | 'challenge' | 'opportunity' | 'risk';
  title: string;
  description: string;
  timeframe: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  probability: number;
  factors: string[];
  recommendations: string[];
  risks: string[];
  opportunities: string[];
  data: any;
}

interface LearningForecast {
  date: string;
  predictedAccuracy: number;
  predictedSpeed: number;
  predictedRetention: number;
  predictedEngagement: number;
  confidence: number;
  factors: string[];
}

interface PredictiveInsight {
  id: string;
  type: 'breakthrough' | 'plateau' | 'decline' | 'acceleration' | 'risk' | 'opportunity';
  title: string;
  description: string;
  timeframe: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  actionText?: string;
  actionUrl?: string;
  createdAt: string;
  data?: any;
}

interface PredictiveModel {
  id: string;
  name: string;
  description: string;
  type: 'performance' | 'retention' | 'engagement' | 'mastery' | 'efficiency';
  accuracy: number;
  confidence: number;
  lastUpdated: string;
  factors: string[];
  predictions: Prediction[];
  insights: PredictiveInsight[];
}

interface PredictiveGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  predicted: number;
  current: number;
  unit: string;
  deadline: string;
  confidence: number;
  status: 'on-track' | 'at-risk' | 'ahead' | 'completed';
  category: 'performance' | 'milestone' | 'achievement';
  factors: string[];
  recommendations: string[];
}

export const PredictiveLearningInsights: React.FC<PredictiveLearningInsightsProps> = ({
  userId,
  className = ''
}) => {
  const [metrics, setMetrics] = useState<PredictionMetrics | null>(null);
  const [forecast, setForecast] = useState<LearningForecast[]>([]);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [models, setModels] = useState<PredictiveModel[]>([]);
  const [goals, setGoals] = useState<PredictiveGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'forecast' | 'insights' | 'models' | 'goals' | 'predictions'>('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'short' | 'medium' | 'long'>('short');

  // Mock data - in real app, this would come from analytics service
  useEffect(() => {
    const loadPredictiveData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock prediction metrics
      const mockMetrics: PredictionMetrics = {
        overall: {
          accuracy: 87,
          confidence: 85,
          reliability: 90,
          improvement: 18,
          trend: 'improving',
          nextMilestone: 'JLPT N5 Completion',
          estimatedCompletion: '2024-03-15'
        },
        performance: {
          predictedAccuracy: 92,
          predictedSpeed: 85,
          predictedRetention: 95,
          predictedEngagement: 90,
          predictedEfficiency: 88,
          predictedMastery: 85
        },
        timeline: {
          shortTerm: {
            timeframe: '1month',
            predictions: [
              {
                id: 'pred-1',
                type: 'performance',
                title: 'Accuracy Improvement',
                description: 'Your accuracy is predicted to reach 92% within the next month',
                timeframe: '1 month',
                confidence: 85,
                impact: 'high',
                probability: 0.85,
                factors: ['Current improvement rate', 'Consistent practice', 'Good retention'],
                recommendations: ['Maintain current practice schedule', 'Focus on weak areas'],
                risks: ['Potential burnout', 'Plateau risk'],
                opportunities: ['Advanced characters', 'Speed improvement'],
                data: { current: 89, predicted: 92 }
              }
            ]
          },
          mediumTerm: {
            timeframe: '6months',
            predictions: [
              {
                id: 'pred-2',
                type: 'milestone',
                title: 'JLPT N5 Completion',
                description: 'You are predicted to complete JLPT N5 level within 6 months',
                timeframe: '6 months',
                confidence: 78,
                impact: 'high',
                probability: 0.78,
                factors: ['Current progress rate', 'Consistent study habits', 'Good retention'],
                recommendations: ['Increase study time', 'Focus on JLPT-specific content'],
                risks: ['Time constraints', 'Motivation decline'],
                opportunities: ['Advanced learning', 'Cultural immersion'],
                data: { current: 65, predicted: 100 }
              }
            ]
          },
          longTerm: {
            timeframe: '2years',
            predictions: [
              {
                id: 'pred-3',
                type: 'achievement',
                title: 'Conversational Fluency',
                description: 'You are predicted to achieve conversational fluency within 2 years',
                timeframe: '2 years',
                confidence: 65,
                impact: 'high',
                probability: 0.65,
                factors: ['Long-term commitment', 'Consistent practice', 'Cultural immersion'],
                recommendations: ['Join conversation groups', 'Practice with native speakers'],
                risks: ['Motivation decline', 'Time constraints'],
                opportunities: ['Career opportunities', 'Cultural experiences'],
                data: { current: 25, predicted: 80 }
              }
            ]
          }
        }
      };

      // Mock forecast
      const mockForecast: LearningForecast[] = [
        { date: '2024-01-15', predictedAccuracy: 90, predictedSpeed: 80, predictedRetention: 90, predictedEngagement: 88, confidence: 85, factors: ['Current trends', 'Consistent practice'] },
        { date: '2024-01-22', predictedAccuracy: 91, predictedSpeed: 82, predictedRetention: 91, predictedEngagement: 89, confidence: 83, factors: ['Improvement rate', 'Practice consistency'] },
        { date: '2024-01-29', predictedAccuracy: 92, predictedSpeed: 84, predictedRetention: 92, predictedEngagement: 90, confidence: 81, factors: ['Trend continuation', 'Motivation level'] },
        { date: '2024-02-05', predictedAccuracy: 93, predictedSpeed: 85, predictedRetention: 93, predictedEngagement: 91, confidence: 79, factors: ['Long-term trends', 'Goal alignment'] },
        { date: '2024-02-12', predictedAccuracy: 94, predictedSpeed: 86, predictedRetention: 94, predictedEngagement: 92, confidence: 77, factors: ['Sustained effort', 'Skill development'] }
      ];

      // Mock insights
      const mockInsights: PredictiveInsight[] = [
        {
          id: 'insight-1',
          type: 'breakthrough',
          title: 'Predicted Performance Breakthrough',
          description: 'You are predicted to achieve a significant performance breakthrough in the next 2 weeks',
          timeframe: '2 weeks',
          confidence: 80,
          impact: 'high',
          actionable: true,
          actionText: 'Prepare for advanced challenges',
          createdAt: '2024-01-14T10:00:00Z'
        },
        {
          id: 'insight-2',
          type: 'opportunity',
          title: 'Optimal Learning Window',
          description: 'The next month presents an optimal window for accelerated learning',
          timeframe: '1 month',
          confidence: 75,
          impact: 'medium',
          actionable: true,
          actionText: 'Increase study intensity',
          createdAt: '2024-01-14T09:30:00Z'
        }
      ];

      // Mock models
      const mockModels: PredictiveModel[] = [
        {
          id: 'model-1',
          name: 'Performance Prediction Model',
          description: 'Predicts future performance based on current trends and patterns',
          type: 'performance',
          accuracy: 87,
          confidence: 85,
          lastUpdated: '2024-01-14T10:00:00Z',
          factors: ['Current performance', 'Improvement rate', 'Practice consistency'],
          predictions: [],
          insights: []
        },
        {
          id: 'model-2',
          name: 'Retention Prediction Model',
          description: 'Predicts long-term retention based on learning patterns',
          type: 'retention',
          accuracy: 92,
          confidence: 88,
          lastUpdated: '2024-01-14T09:30:00Z',
          factors: ['Review frequency', 'Spaced repetition', 'Engagement level'],
          predictions: [],
          insights: []
        }
      ];

      // Mock goals
      const mockGoals: PredictiveGoal[] = [
        {
          id: 'goal-1',
          title: 'Achieve 95% Accuracy',
          description: 'Reach 95% accuracy in character recognition',
          target: 95,
          predicted: 94,
          current: 89,
          unit: '%',
          deadline: '2024-02-01',
          confidence: 85,
          status: 'on-track',
          category: 'performance',
          factors: ['Current improvement rate', 'Consistent practice'],
          recommendations: ['Focus on difficult characters', 'Increase practice time']
        },
        {
          id: 'goal-2',
          title: 'Complete JLPT N5',
          description: 'Achieve JLPT N5 level proficiency',
          target: 100,
          predicted: 95,
          current: 65,
          unit: '%',
          deadline: '2024-03-15',
          confidence: 78,
          status: 'on-track',
          category: 'milestone',
          factors: ['Study consistency', 'Retention rate', 'Practice quality'],
          recommendations: ['Increase study time', 'Focus on JLPT content']
        }
      ];

      setMetrics(mockMetrics);
      setForecast(mockForecast);
      setInsights(mockInsights);
      setModels(mockModels);
      setGoals(mockGoals);
      setIsLoading(false);
    };

    loadPredictiveData();
  }, [userId, selectedTimeframe]);

  const getPredictionIcon = (type: string) => {
    switch (type) {
      case 'performance': return <Target className="w-5 h-5 text-blue-500" />;
      case 'milestone': return <Flag className="w-5 h-5 text-green-500" />;
      case 'achievement': return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'challenge': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'opportunity': return <Lightbulb className="w-5 h-5 text-purple-500" />;
      case 'risk': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPredictionColor = (type: string) => {
    switch (type) {
      case 'performance': return 'border-blue-200 bg-blue-50';
      case 'milestone': return 'border-green-200 bg-green-50';
      case 'achievement': return 'border-yellow-200 bg-yellow-50';
      case 'challenge': return 'border-orange-200 bg-orange-50';
      case 'opportunity': return 'border-purple-200 bg-purple-50';
      case 'risk': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'breakthrough': return <Rocket className="w-5 h-5 text-green-500" />;
      case 'plateau': return <Minus className="w-5 h-5 text-yellow-500" />;
      case 'decline': return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'acceleration': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'risk': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'opportunity': return <Target className="w-5 h-5 text-purple-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'breakthrough': return 'border-green-200 bg-green-50';
      case 'plateau': return 'border-yellow-200 bg-yellow-50';
      case 'decline': return 'border-red-200 bg-red-50';
      case 'acceleration': return 'border-blue-200 bg-blue-50';
      case 'risk': return 'border-orange-200 bg-orange-50';
      case 'opportunity': return 'border-purple-200 bg-purple-50';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-50';
      case 'at-risk': return 'text-red-600 bg-red-50';
      case 'ahead': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'performance': return <Target className="w-5 h-5 text-blue-500" />;
      case 'retention': return <Brain className="w-5 h-5 text-purple-500" />;
      case 'engagement': return <Heart className="w-5 h-5 text-red-500" />;
      case 'mastery': return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'efficiency': return <Zap className="w-5 h-5 text-orange-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Generating predictive insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Predictive Learning Insights</h2>
          <p className="body text-gray-600">
            AI-powered predictions and insights to optimize your learning journey
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-4 py-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="short">Short-term (1 month)</option>
            <option value="medium">Medium-term (6 months)</option>
            <option value="long">Long-term (2 years)</option>
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
          { id: 'forecast', label: 'Forecast', icon: Timeline },
          { id: 'insights', label: 'Insights', icon: Brain },
          { id: 'models', label: 'Models', icon: CrystalBall },
          { id: 'goals', label: 'Goals', icon: Target },
          { id: 'predictions', label: 'Predictions', icon: Predictions }
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <CrystalBall className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-500">Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.accuracy}%</div>
              <div className="text-xs text-gray-600">Prediction accuracy</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-500">Confidence</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.confidence}%</div>
              <div className="text-xs text-gray-600">Model confidence</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-purple-500" />
                <span className="text-xs text-gray-500">Reliability</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.reliability}%</div>
              <div className="text-xs text-gray-600">Prediction reliability</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <span className="text-xs text-gray-500">Improvement</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">+{metrics.overall.improvement}%</div>
              <div className="text-xs text-gray-600">Predicted improvement</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Flag className="w-5 h-5 text-red-500" />
                <span className="text-xs text-gray-500">Next Milestone</span>
              </div>
              <div className="text-sm font-bold text-gray-900">{metrics.overall.nextMilestone}</div>
              <div className="text-xs text-gray-600">Predicted completion</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <span className="text-xs text-gray-500">Completion</span>
              </div>
              <div className="text-sm font-bold text-gray-900">
                {new Date(metrics.overall.estimatedCompletion).toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-600">Estimated date</div>
            </div>
          </div>

          {/* Performance Predictions */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Predicted Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.performance.predictedAccuracy}%</div>
                <div className="text-sm text-gray-600">Predicted Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.performance.predictedSpeed}%</div>
                <div className="text-sm text-gray-600">Predicted Speed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.performance.predictedRetention}%</div>
                <div className="text-sm text-gray-600">Predicted Retention</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.performance.predictedEngagement}%</div>
                <div className="text-sm text-gray-600">Predicted Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.performance.predictedEfficiency}%</div>
                <div className="text-sm text-gray-600">Predicted Efficiency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.performance.predictedMastery}%</div>
                <div className="text-sm text-gray-600">Predicted Mastery</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forecast Tab */}
      {selectedView === 'forecast' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Learning Forecast</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={forecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="predictedAccuracy" stroke="#3b82f6" strokeWidth={3} />
                  <Line type="monotone" dataKey="predictedSpeed" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="predictedRetention" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="predictedEngagement" stroke="#ef4444" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Predictions Tab */}
      {selectedView === 'predictions' && metrics && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Predictions by Timeframe</h3>
            <div className="space-y-6">
              {Object.entries(metrics.timeline).map(([timeframe, data]) => (
                <div key={timeframe} className="p-4 border-base rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4 capitalize">
                    {timeframe.replace(/([A-Z])/g, ' $1').trim()} Term ({data.timeframe})
                  </h4>
                  <div className="space-y-4">
                    {data.predictions.map((prediction, index) => (
                      <motion.div
                        key={prediction.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`p-4 border rounded-lg ${getPredictionColor(prediction.type)}`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {getPredictionIcon(prediction.type)}
                            <div>
                              <h5 className="font-semibold text-gray-900">{prediction.title}</h5>
                              <p className="text-sm text-gray-600">{prediction.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getConfidenceColor(prediction.confidence)}`}>
                              {prediction.confidence}%
                            </div>
                            <div className="text-sm text-gray-600">Confidence</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h6 className="font-medium text-gray-900 mb-2">Key Factors</h6>
                            <ul className="space-y-1">
                              {prediction.factors.map((factor, i) => (
                                <li key={i} className="text-sm text-gray-600">• {factor}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-medium text-gray-900 mb-2">Recommendations</h6>
                            <ul className="space-y-1">
                              {prediction.recommendations.map((rec, i) => (
                                <li key={i} className="text-sm text-gray-600">• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Timeframe: {prediction.timeframe}
                          </span>
                          <span className={`px-2 py-1 rounded text-sm ${getImpactColor(prediction.impact)}`}>
                            {prediction.impact} impact
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {selectedView === 'insights' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Predictive Insights</h3>
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
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                            {insight.impact} impact
                          </span>
                          <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                            {insight.confidence}% confidence
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Timeframe: {insight.timeframe}
                        </span>
                        {insight.actionable && insight.actionText && (
                          <button className="text-sm text-primary hover:text-primary-dark font-medium">
                            {insight.actionText} →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Models Tab */}
      {selectedView === 'models' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Predictive Models</h3>
            <div className="space-y-4">
              {models.map((model, index) => (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getModelIcon(model.type)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{model.name}</h4>
                        <p className="text-sm text-gray-600">{model.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getConfidenceColor(model.accuracy)}`}>
                        {model.accuracy}%
                      </div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Key Factors</h5>
                      <ul className="space-y-1">
                        {model.factors.map((factor, i) => (
                          <li key={i} className="text-sm text-gray-600">• {factor}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Model Stats</h5>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Confidence</span>
                          <span className={getConfidenceColor(model.confidence)}>{model.confidence}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Last Updated</span>
                          <span>{new Date(model.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {selectedView === 'goals' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Predictive Goals</h3>
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-6 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{goal.title}</h4>
                      <p className="text-gray-600">{goal.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(goal.status)}`}>
                        {goal.status}
                      </span>
                      <span className={`text-sm font-medium ${getConfidenceColor(goal.confidence)}`}>
                        {goal.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">{goal.current}</div>
                      <div className="text-sm text-gray-600">Current</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{goal.predicted}</div>
                      <div className="text-sm text-gray-600">Predicted</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">{goal.target}</div>
                      <div className="text-sm text-gray-600">Target</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(goal.current / goal.target) * 100}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Key Factors</h5>
                      <ul className="space-y-1">
                        {goal.factors.map((factor, i) => (
                          <li key={i} className="text-sm text-gray-600">• {factor}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Recommendations</h5>
                      <ul className="space-y-1">
                        {goal.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-gray-600">• {rec}</li>
                        ))}
                      </ul>
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
