"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Award, Clock, Zap, Eye, Brain, Heart, Star, Calendar, Filter, Download, Share2, Settings, RefreshCw, AlertCircle, CheckCircle, Info, ArrowUp, ArrowDown, Minus, Plus, Activity, Users, BookOpen, Target as TargetIcon, Flame, Trophy, BarChart, PieChart, LineChart, Gauge, Timer, Rocket, Speed } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter } from 'recharts';

interface LearningVelocityTrackingProps {
  userId: string;
  className?: string;
}

interface VelocityMetrics {
  overall: {
    learningVelocity: number;
    improvementRate: number;
    acceleration: number;
    momentum: number;
    efficiency: number;
    consistency: number;
  };
  trends: {
    velocityTrend: 'accelerating' | 'decelerating' | 'stable';
    improvementTrend: 'increasing' | 'decreasing' | 'stable';
    efficiencyTrend: 'improving' | 'declining' | 'stable';
    consistencyTrend: 'improving' | 'declining' | 'stable';
  };
  benchmarks: {
    personalBest: number;
    weeklyAverage: number;
    monthlyAverage: number;
    peerAverage: number;
    percentile: number;
  };
}

interface VelocityDataPoint {
  date: string;
  velocity: number;
  improvement: number;
  efficiency: number;
  consistency: number;
  charactersLearned: number;
  timeSpent: number;
  accuracy: number;
  speed: number;
  xpEarned: number;
  sessionsCompleted: number;
}

interface LearningPhase {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  velocity: number;
  improvement: number;
  characteristics: string[];
  milestones: string[];
  challenges: string[];
  achievements: string[];
}

interface VelocityInsight {
  id: string;
  type: 'acceleration' | 'plateau' | 'breakthrough' | 'decline' | 'recovery';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  actionText?: string;
  actionUrl?: string;
  createdAt: string;
  data?: any;
}

interface LearningPattern {
  bestTimeOfDay: string;
  bestDayOfWeek: string;
  optimalSessionLength: number;
  optimalBreakLength: number;
  peakPerformanceHours: string[];
  lowPerformanceHours: string[];
  recoveryTime: number;
  burnoutIndicators: string[];
}

interface VelocityPrediction {
  timeframe: '1week' | '1month' | '3months' | '6months';
  predictedVelocity: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
  risks: string[];
  opportunities: string[];
}

export const LearningVelocityTracking: React.FC<LearningVelocityTrackingProps> = ({
  userId,
  className = ''
}) => {
  const [metrics, setMetrics] = useState<VelocityMetrics | null>(null);
  const [velocityData, setVelocityData] = useState<VelocityDataPoint[]>([]);
  const [learningPhases, setLearningPhases] = useState<LearningPhase[]>([]);
  const [insights, setInsights] = useState<VelocityInsight[]>([]);
  const [patterns, setPatterns] = useState<LearningPattern | null>(null);
  const [predictions, setPredictions] = useState<VelocityPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedView, setSelectedView] = useState<'overview' | 'trends' | 'phases' | 'insights' | 'patterns' | 'predictions'>('overview');
  const [showInsights, setShowInsights] = useState(true);
  const [showPredictions, setShowPredictions] = useState(true);

  // Mock data - in real app, this would come from analytics service
  useEffect(() => {
    const loadVelocityData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock velocity metrics
      const mockMetrics: VelocityMetrics = {
        overall: {
          learningVelocity: 8.5,
          improvementRate: 18,
          acceleration: 2.3,
          momentum: 7.8,
          efficiency: 85,
          consistency: 82
        },
        trends: {
          velocityTrend: 'accelerating',
          improvementTrend: 'increasing',
          efficiencyTrend: 'improving',
          consistencyTrend: 'stable'
        },
        benchmarks: {
          personalBest: 12.3,
          weeklyAverage: 8.5,
          monthlyAverage: 7.2,
          peerAverage: 6.8,
          percentile: 85
        }
      };

      // Mock velocity data
      const mockVelocityData: VelocityDataPoint[] = [
        { date: '2024-01-08', velocity: 6.2, improvement: 12, efficiency: 78, consistency: 75, charactersLearned: 8, timeSpent: 25, accuracy: 82, speed: 65, xpEarned: 120, sessionsCompleted: 2 },
        { date: '2024-01-09', velocity: 7.1, improvement: 15, efficiency: 82, consistency: 78, charactersLearned: 10, timeSpent: 30, accuracy: 85, speed: 68, xpEarned: 150, sessionsCompleted: 3 },
        { date: '2024-01-10', velocity: 7.8, improvement: 16, efficiency: 85, consistency: 80, charactersLearned: 12, timeSpent: 35, accuracy: 87, speed: 72, xpEarned: 180, sessionsCompleted: 3 },
        { date: '2024-01-11', velocity: 8.2, improvement: 17, efficiency: 87, consistency: 82, charactersLearned: 15, timeSpent: 40, accuracy: 89, speed: 75, xpEarned: 200, sessionsCompleted: 4 },
        { date: '2024-01-12', velocity: 8.7, improvement: 18, efficiency: 88, consistency: 84, charactersLearned: 18, timeSpent: 45, accuracy: 91, speed: 78, xpEarned: 220, sessionsCompleted: 4 },
        { date: '2024-01-13', velocity: 9.1, improvement: 19, efficiency: 89, consistency: 85, charactersLearned: 20, timeSpent: 50, accuracy: 93, speed: 80, xpEarned: 240, sessionsCompleted: 5 },
        { date: '2024-01-14', velocity: 9.5, improvement: 20, efficiency: 90, consistency: 87, charactersLearned: 22, timeSpent: 55, accuracy: 95, speed: 82, xpEarned: 260, sessionsCompleted: 5 }
      ];

      // Mock learning phases
      const mockLearningPhases: LearningPhase[] = [
        {
          id: 'phase-1',
          name: 'Foundation Building',
          description: 'Initial learning phase focusing on basic characters and fundamentals',
          startDate: '2024-01-01',
          endDate: '2024-01-07',
          velocity: 5.2,
          improvement: 15,
          characteristics: ['Steady progress', 'Focus on basics', 'Building habits'],
          milestones: ['First 50 characters', 'Basic stroke mastery', 'Consistent practice'],
          challenges: ['Learning curve', 'Time management', 'Motivation'],
          achievements: ['First streak', 'Accuracy milestone', 'Speed improvement']
        },
        {
          id: 'phase-2',
          name: 'Acceleration Phase',
          description: 'Rapid improvement phase with increased learning velocity',
          startDate: '2024-01-08',
          velocity: 8.5,
          improvement: 20,
          characteristics: ['Rapid progress', 'Increased efficiency', 'Higher confidence'],
          milestones: ['100 characters', 'Advanced techniques', 'Consistent performance'],
          challenges: ['Maintaining momentum', 'Avoiding burnout', 'Complex characters'],
          achievements: ['Speed records', 'Accuracy peaks', 'Streak milestones']
        }
      ];

      // Mock insights
      const mockInsights: VelocityInsight[] = [
        {
          id: 'insight-1',
          type: 'acceleration',
          title: 'Learning Velocity Acceleration',
          description: 'Your learning velocity has increased by 35% over the past week',
          impact: 'high',
          actionable: true,
          actionText: 'Maintain current practice intensity',
          createdAt: '2024-01-14T10:00:00Z'
        },
        {
          id: 'insight-2',
          type: 'breakthrough',
          title: 'Performance Breakthrough',
          description: 'You\'ve achieved a new personal best in learning efficiency',
          impact: 'high',
          actionable: true,
          actionText: 'Analyze what contributed to this breakthrough',
          createdAt: '2024-01-14T09:30:00Z'
        },
        {
          id: 'insight-3',
          type: 'plateau',
          title: 'Potential Plateau Warning',
          description: 'Your improvement rate is showing signs of leveling off',
          impact: 'medium',
          actionable: true,
          actionText: 'Consider changing practice methods',
          createdAt: '2024-01-14T08:00:00Z'
        }
      ];

      // Mock learning patterns
      const mockPatterns: LearningPattern = {
        bestTimeOfDay: '09:00-11:00',
        bestDayOfWeek: 'Tuesday',
        optimalSessionLength: 45,
        optimalBreakLength: 15,
        peakPerformanceHours: ['09:00-11:00', '14:00-16:00', '19:00-21:00'],
        lowPerformanceHours: ['12:00-13:00', '17:00-18:00'],
        recoveryTime: 24,
        burnoutIndicators: ['Decreased accuracy', 'Longer session times', 'Reduced motivation']
      };

      // Mock predictions
      const mockPredictions: VelocityPrediction[] = [
        {
          timeframe: '1week',
          predictedVelocity: 9.8,
          confidence: 85,
          factors: ['Current momentum', 'Consistent practice', 'Good health'],
          recommendations: ['Maintain current schedule', 'Focus on weak areas', 'Take adequate breaks'],
          risks: ['Potential burnout', 'Plateau risk', 'Time constraints'],
          opportunities: ['New learning methods', 'Advanced characters', 'Community engagement']
        },
        {
          timeframe: '1month',
          predictedVelocity: 11.2,
          confidence: 75,
          factors: ['Long-term trends', 'Seasonal patterns', 'Goal alignment'],
          recommendations: ['Set new challenges', 'Explore advanced features', 'Join study groups'],
          risks: ['Motivation decline', 'Complexity increase', 'Time management'],
          opportunities: ['Mastery goals', 'Teaching others', 'Cultural immersion']
        }
      ];

      setMetrics(mockMetrics);
      setVelocityData(mockVelocityData);
      setLearningPhases(mockLearningPhases);
      setInsights(mockInsights);
      setPatterns(mockPatterns);
      setPredictions(mockPredictions);
      setIsLoading(false);
    };

    loadVelocityData();
  }, [userId, selectedPeriod]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'accelerating':
      case 'increasing':
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'decelerating':
      case 'decreasing':
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'stable':
        return <Minus className="w-5 h-5 text-gray-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'accelerating':
      case 'increasing':
      case 'improving':
        return 'text-green-600 bg-green-50';
      case 'decelerating':
      case 'decreasing':
      case 'declining':
        return 'text-red-600 bg-red-50';
      case 'stable':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'acceleration': return <Rocket className="w-5 h-5 text-green-500" />;
      case 'breakthrough': return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'plateau': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'decline': return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'recovery': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'acceleration': return 'border-green-200 bg-green-50';
      case 'breakthrough': return 'border-yellow-200 bg-yellow-50';
      case 'plateau': return 'border-orange-200 bg-orange-50';
      case 'decline': return 'border-red-200 bg-red-50';
      case 'recovery': return 'border-blue-200 bg-blue-50';
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

  const getVelocityColor = (velocity: number) => {
    if (velocity >= 10) return 'text-green-600';
    if (velocity >= 7) return 'text-yellow-600';
    if (velocity >= 5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading velocity tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Learning Velocity Tracking</h2>
          <p className="body text-gray-600">
            Track your learning speed, improvement rate, and momentum over time
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
          { id: 'overview', label: 'Overview', icon: Gauge },
          { id: 'trends', label: 'Trends', icon: TrendingUp },
          { id: 'phases', label: 'Phases', icon: Calendar },
          { id: 'insights', label: 'Insights', icon: Brain },
          { id: 'patterns', label: 'Patterns', icon: Clock },
          { id: 'predictions', label: 'Predictions', icon: Rocket }
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
          {/* Key Velocity Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Speed className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-500">Velocity</span>
              </div>
              <div className={`text-2xl font-bold ${getVelocityColor(metrics.overall.learningVelocity)}`}>
                {metrics.overall.learningVelocity}
              </div>
              <div className="text-xs text-gray-600">chars/day</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-500">Improvement</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                +{metrics.overall.improvementRate}%
              </div>
              <div className="text-xs text-gray-600">this month</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Rocket className="w-5 h-5 text-purple-500" />
                <span className="text-xs text-gray-500">Acceleration</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.overall.acceleration}
              </div>
              <div className="text-xs text-gray-600">rate</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-xs text-gray-500">Momentum</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.overall.momentum}
              </div>
              <div className="text-xs text-gray-600">score</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-xs text-gray-500">Efficiency</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.overall.efficiency}%
              </div>
              <div className="text-xs text-gray-600">score</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-indigo-500" />
                <span className="text-xs text-gray-500">Consistency</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.overall.consistency}%
              </div>
              <div className="text-xs text-gray-600">score</div>
            </div>
          </div>

          {/* Trend Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(metrics.trends).map(([key, trend]) => (
              <div key={key} className="bg-white border-base rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  {getTrendIcon(trend)}
                  <span className="text-xs text-gray-500 capitalize">
                    {key.replace('Trend', '')}
                  </span>
                </div>
                <div className={`text-sm font-medium px-2 py-1 rounded-full ${getTrendColor(trend)}`}>
                  {trend}
                </div>
              </div>
            ))}
          </div>

          {/* Velocity Chart */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Learning Velocity Over Time</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={velocityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="velocity" stroke="#3b82f6" strokeWidth={3} />
                  <Line type="monotone" dataKey="improvement" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="efficiency" stroke="#8b5cf6" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Benchmarks */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Performance Benchmarks</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {metrics.benchmarks.personalBest}
                </div>
                <div className="text-sm text-gray-600">Personal Best</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {metrics.benchmarks.weeklyAverage}
                </div>
                <div className="text-sm text-gray-600">Weekly Avg</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {metrics.benchmarks.monthlyAverage}
                </div>
                <div className="text-sm text-gray-600">Monthly Avg</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {metrics.benchmarks.peerAverage}
                </div>
                <div className="text-sm text-gray-600">Peer Avg</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {metrics.benchmarks.percentile}th
                </div>
                <div className="text-sm text-gray-600">Percentile</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {selectedView === 'trends' && (
        <div className="space-y-6">
          {/* Velocity Trends */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Velocity Trends</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={velocityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="velocity" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="improvement" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Efficiency vs Consistency */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Efficiency vs Consistency</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={velocityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="efficiency" name="Efficiency" />
                  <YAxis dataKey="consistency" name="Consistency" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter dataKey="velocity" fill="#3b82f6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Phases Tab */}
      {selectedView === 'phases' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Learning Phases</h3>
            <div className="space-y-6">
              {learningPhases.map((phase, index) => (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-6 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{phase.name}</h4>
                      <p className="text-gray-600">{phase.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{phase.velocity}</div>
                      <div className="text-sm text-gray-600">Velocity</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Characteristics</h5>
                      <ul className="space-y-1">
                        {phase.characteristics.map((char, i) => (
                          <li key={i} className="text-sm text-gray-600">• {char}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Milestones</h5>
                      <ul className="space-y-1">
                        {phase.milestones.map((milestone, i) => (
                          <li key={i} className="text-sm text-gray-600">• {milestone}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Challenges</h5>
                      <ul className="space-y-1">
                        {phase.challenges.map((challenge, i) => (
                          <li key={i} className="text-sm text-gray-600">• {challenge}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Achievements</h5>
                      <ul className="space-y-1">
                        {phase.achievements.map((achievement, i) => (
                          <li key={i} className="text-sm text-gray-600">• {achievement}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Start: {new Date(phase.startDate).toLocaleDateString()}</span>
                    {phase.endDate && <span>End: {new Date(phase.endDate).toLocaleDateString()}</span>}
                    <span>Improvement: +{phase.improvement}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {selectedView === 'insights' && showInsights && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Velocity Insights</h3>
            <button
              onClick={() => setShowInsights(!showInsights)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>
          
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
      )}

      {/* Patterns Tab */}
      {selectedView === 'patterns' && patterns && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Learning Patterns</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Optimal Times</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-800">Best Time of Day</span>
                    <span className="text-sm font-medium text-blue-900">{patterns.bestTimeOfDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-800">Best Day of Week</span>
                    <span className="text-sm font-medium text-blue-900">{patterns.bestDayOfWeek}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Session Optimization</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-800">Optimal Session Length</span>
                    <span className="text-sm font-medium text-green-900">{patterns.optimalSessionLength} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-800">Optimal Break Length</span>
                    <span className="text-sm font-medium text-green-900">{patterns.optimalBreakLength} min</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Performance Hours</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-purple-800">Peak Hours</span>
                    <div className="text-sm font-medium text-purple-900">
                      {patterns.peakPerformanceHours.join(', ')}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-purple-800">Low Hours</span>
                    <div className="text-sm font-medium text-purple-900">
                      {patterns.lowPerformanceHours.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Predictions Tab */}
      {selectedView === 'predictions' && showPredictions && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Velocity Predictions</h3>
            <button
              onClick={() => setShowPredictions(!showPredictions)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            {predictions.map((prediction, index) => (
              <motion.div
                key={prediction.timeframe}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-6 border-base rounded-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-gray-900">
                    {prediction.timeframe === '1week' ? '1 Week' :
                     prediction.timeframe === '1month' ? '1 Month' :
                     prediction.timeframe === '3months' ? '3 Months' : '6 Months'} Prediction
                  </h4>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getVelocityColor(prediction.predictedVelocity)}`}>
                      {prediction.predictedVelocity}
                    </div>
                    <div className="text-sm text-gray-600">Predicted Velocity</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Confidence</h5>
                    <div className={`text-lg font-bold ${getConfidenceColor(prediction.confidence)}`}>
                      {prediction.confidence}%
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Key Factors</h5>
                    <ul className="space-y-1">
                      {prediction.factors.map((factor, i) => (
                        <li key={i} className="text-sm text-gray-600">• {factor}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Recommendations</h5>
                    <ul className="space-y-1">
                      {prediction.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-gray-600">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Risks & Opportunities</h5>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-red-600">Risks:</span>
                        <ul className="text-sm text-gray-600">
                          {prediction.risks.map((risk, i) => (
                            <li key={i}>• {risk}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-green-600">Opportunities:</span>
                        <ul className="text-sm text-gray-600">
                          {prediction.opportunities.map((opp, i) => (
                            <li key={i}>• {opp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
