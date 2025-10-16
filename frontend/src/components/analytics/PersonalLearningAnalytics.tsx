"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Target, Award, Clock, Zap, Eye, Brain, Heart, Star, Calendar, Filter, Download, Share2, Settings, RefreshCw, AlertCircle, CheckCircle, Info, ArrowUp, ArrowDown, Minus, Plus, Activity, Users, BookOpen, Target as TargetIcon, Flame, Trophy, BarChart, PieChart, LineChart } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface PersonalLearningAnalyticsProps {
  userId: string;
  className?: string;
}

interface LearningMetrics {
  overall: {
    score: number;
    level: number;
    xp: number;
    streak: number;
    accuracy: number;
    speed: number;
    consistency: number;
  };
  progress: {
    charactersLearned: number;
    charactersMastered: number;
    totalPracticeTime: number;
    averageSessionTime: number;
    sessionsCompleted: number;
    improvementRate: number;
  };
  performance: {
    bestAccuracy: number;
    bestSpeed: number;
    averageAccuracy: number;
    averageSpeed: number;
    consistency: number;
    retention: number;
  };
  engagement: {
    dailyActiveTime: number;
    weeklyActiveTime: number;
    monthlyActiveTime: number;
    sessionFrequency: number;
    featureUsage: number;
    communityParticipation: number;
  };
}

interface LearningTrend {
  date: string;
  accuracy: number;
  speed: number;
  consistency: number;
  xpEarned: number;
  timeSpent: number;
  charactersPracticed: number;
  sessionsCompleted: number;
}

interface CharacterAnalytics {
  character: string;
  type: 'hiragana' | 'katakana' | 'kanji';
  attempts: number;
  accuracy: number;
  averageTime: number;
  mastery: number;
  lastPracticed: string;
  improvement: number;
  difficulty: number;
  frequency: number;
  commonMistakes: string[];
  strengths: string[];
}

interface LearningInsight {
  id: string;
  type: 'improvement' | 'warning' | 'achievement' | 'recommendation' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  actionText?: string;
  actionUrl?: string;
  createdAt: string;
  data?: any;
}

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  progress: number;
  status: 'on-track' | 'behind' | 'ahead' | 'completed';
  category: 'accuracy' | 'speed' | 'consistency' | 'characters' | 'time' | 'streak';
}

interface LearningComparison {
  metric: string;
  yourValue: number;
  averageValue: number;
  percentile: number;
  trend: 'up' | 'down' | 'stable';
  improvement: number;
}

export const PersonalLearningAnalytics: React.FC<PersonalLearningAnalyticsProps> = ({
  userId,
  className = ''
}) => {
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null);
  const [trends, setTrends] = useState<LearningTrend[]>([]);
  const [characterAnalytics, setCharacterAnalytics] = useState<CharacterAnalytics[]>([]);
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [comparisons, setComparisons] = useState<LearningComparison[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedView, setSelectedView] = useState<'overview' | 'performance' | 'progress' | 'insights' | 'goals' | 'comparison'>('overview');
  const [showInsights, setShowInsights] = useState(true);
  const [showGoals, setShowGoals] = useState(true);

  // Mock data - in real app, this would come from analytics service
  useEffect(() => {
    const loadAnalyticsData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock metrics
      const mockMetrics: LearningMetrics = {
        overall: {
          score: 87,
          level: 12,
          xp: 15420,
          streak: 15,
          accuracy: 89,
          speed: 78,
          consistency: 85
        },
        progress: {
          charactersLearned: 156,
          charactersMastered: 89,
          totalPracticeTime: 3240,
          averageSessionTime: 28,
          sessionsCompleted: 116,
          improvementRate: 18
        },
        performance: {
          bestAccuracy: 98,
          bestSpeed: 45,
          averageAccuracy: 89,
          averageSpeed: 78,
          consistency: 85,
          retention: 92
        },
        engagement: {
          dailyActiveTime: 45,
          weeklyActiveTime: 315,
          monthlyActiveTime: 1260,
          sessionFrequency: 4.2,
          featureUsage: 78,
          communityParticipation: 65
        }
      };

      // Mock trends
      const mockTrends: LearningTrend[] = [
        { date: '2024-01-08', accuracy: 82, speed: 65, consistency: 78, xpEarned: 120, timeSpent: 25, charactersPracticed: 8, sessionsCompleted: 2 },
        { date: '2024-01-09', accuracy: 85, speed: 68, consistency: 80, xpEarned: 150, timeSpent: 30, charactersPracticed: 10, sessionsCompleted: 3 },
        { date: '2024-01-10', accuracy: 87, speed: 72, consistency: 82, xpEarned: 180, timeSpent: 35, charactersPracticed: 12, sessionsCompleted: 3 },
        { date: '2024-01-11', accuracy: 89, speed: 75, consistency: 84, xpEarned: 200, timeSpent: 40, charactersPracticed: 15, sessionsCompleted: 4 },
        { date: '2024-01-12', accuracy: 91, speed: 78, consistency: 85, xpEarned: 220, timeSpent: 45, charactersPracticed: 18, sessionsCompleted: 4 },
        { date: '2024-01-13', accuracy: 93, speed: 80, consistency: 86, xpEarned: 240, timeSpent: 50, charactersPracticed: 20, sessionsCompleted: 5 },
        { date: '2024-01-14', accuracy: 95, speed: 82, consistency: 87, xpEarned: 260, timeSpent: 55, charactersPracticed: 22, sessionsCompleted: 5 }
      ];

      // Mock character analytics
      const mockCharacterAnalytics: CharacterAnalytics[] = [
        {
          character: 'あ',
          type: 'hiragana',
          attempts: 45,
          accuracy: 95,
          averageTime: 3.2,
          mastery: 98,
          lastPracticed: '2024-01-14T10:30:00Z',
          improvement: 15,
          difficulty: 1,
          frequency: 10,
          commonMistakes: ['Stroke order'],
          strengths: ['Consistent shape', 'Good proportions']
        },
        {
          character: 'か',
          type: 'hiragana',
          attempts: 38,
          accuracy: 88,
          averageTime: 4.1,
          mastery: 85,
          lastPracticed: '2024-01-14T09:15:00Z',
          improvement: 12,
          difficulty: 2,
          frequency: 8,
          commonMistakes: ['Curve angle', 'Stroke connection'],
          strengths: ['Good stroke order', 'Consistent size']
        },
        {
          character: '新',
          type: 'kanji',
          attempts: 25,
          accuracy: 75,
          averageTime: 8.5,
          mastery: 65,
          lastPracticed: '2024-01-13T15:20:00Z',
          improvement: 8,
          difficulty: 4,
          frequency: 6,
          commonMistakes: ['Complex strokes', 'Balance'],
          strengths: ['Good structure', 'Clear lines']
        }
      ];

      // Mock insights
      const mockInsights: LearningInsight[] = [
        {
          id: 'insight-1',
          type: 'improvement',
          title: 'Accuracy Improvement',
          description: 'Your accuracy has improved by 18% over the past month',
          impact: 'high',
          actionable: true,
          actionText: 'Continue current practice routine',
          createdAt: '2024-01-14T10:00:00Z'
        },
        {
          id: 'insight-2',
          type: 'recommendation',
          title: 'Practice Timing',
          description: 'You perform best between 9-11 AM',
          impact: 'medium',
          actionable: true,
          actionText: 'Schedule practice sessions in the morning',
          createdAt: '2024-01-14T09:30:00Z'
        },
        {
          id: 'insight-3',
          type: 'warning',
          title: 'Consistency Drop',
          description: 'Your consistency has decreased by 5% this week',
          impact: 'medium',
          actionable: true,
          actionText: 'Focus on consistent practice',
          createdAt: '2024-01-14T08:00:00Z'
        }
      ];

      // Mock goals
      const mockGoals: LearningGoal[] = [
        {
          id: 'goal-1',
          title: 'Master 100 Characters',
          description: 'Learn and master 100 Japanese characters',
          target: 100,
          current: 89,
          unit: 'characters',
          deadline: '2024-03-01',
          progress: 89,
          status: 'on-track',
          category: 'characters'
        },
        {
          id: 'goal-2',
          title: 'Achieve 95% Accuracy',
          description: 'Maintain 95% accuracy in character practice',
          target: 95,
          current: 89,
          unit: '%',
          deadline: '2024-02-01',
          progress: 94,
          status: 'on-track',
          category: 'accuracy'
        }
      ];

      // Mock comparisons
      const mockComparisons: LearningComparison[] = [
        {
          metric: 'Accuracy',
          yourValue: 89,
          averageValue: 82,
          percentile: 85,
          trend: 'up',
          improvement: 8.5
        },
        {
          metric: 'Speed',
          yourValue: 78,
          averageValue: 75,
          percentile: 72,
          trend: 'up',
          improvement: 4.0
        },
        {
          metric: 'Consistency',
          yourValue: 85,
          averageValue: 78,
          percentile: 88,
          trend: 'stable',
          improvement: 9.0
        }
      ];

      setMetrics(mockMetrics);
      setTrends(mockTrends);
      setCharacterAnalytics(mockCharacterAnalytics);
      setInsights(mockInsights);
      setGoals(mockGoals);
      setComparisons(mockComparisons);
      setIsLoading(false);
    };

    loadAnalyticsData();
  }, [userId, selectedPeriod]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'achievement': return <Award className="w-5 h-5 text-blue-500" />;
      case 'recommendation': return <Info className="w-5 h-5 text-purple-500" />;
      case 'trend': return <BarChart3 className="w-5 h-5 text-indigo-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'improvement': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'achievement': return 'border-blue-200 bg-blue-50';
      case 'recommendation': return 'border-purple-200 bg-purple-50';
      case 'trend': return 'border-indigo-200 bg-indigo-50';
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

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-50';
      case 'behind': return 'text-red-600 bg-red-50';
      case 'ahead': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4" />;
      case 'down': return <ArrowDown className="w-4 h-4" />;
      case 'stable': return <Minus className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Personal Learning Analytics</h2>
          <p className="body text-gray-600">
            Comprehensive insights into your learning journey and performance
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
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'performance', label: 'Performance', icon: Target },
          { id: 'progress', label: 'Progress', icon: TrendingUp },
          { id: 'insights', label: 'Insights', icon: Brain },
          { id: 'goals', label: 'Goals', icon: Flag },
          { id: 'comparison', label: 'Comparison', icon: Users }
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
                <Target className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-500">Score</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.score}</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-purple-500" />
                <span className="text-xs text-gray-500">Level</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.level}</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-xs text-gray-500">XP</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.xp.toLocaleString()}</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-xs text-gray-500">Streak</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.streak}</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-500">Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.accuracy}%</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-500">Speed</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.speed}%</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                <span className="text-xs text-gray-500">Consistency</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.consistency}%</div>
            </div>
          </div>

          {/* Performance Trends */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Performance Trends</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="speed" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="consistency" stroke="#8b5cf6" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Insights */}
          {showInsights && (
            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="heading text-lg font-semibold">Quick Insights</h3>
                <button
                  onClick={() => setShowInsights(!showInsights)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Minus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.slice(0, 3).map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
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
        </div>
      )}

      {/* Performance Tab */}
      {selectedView === 'performance' && metrics && (
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Accuracy Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Best Accuracy</span>
                  <span className="text-sm font-medium">{metrics.performance.bestAccuracy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Accuracy</span>
                  <span className="text-sm font-medium">{metrics.performance.averageAccuracy}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${metrics.performance.averageAccuracy}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Speed Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Best Speed</span>
                  <span className="text-sm font-medium">{metrics.performance.bestSpeed}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Speed</span>
                  <span className="text-sm font-medium">{metrics.performance.averageSpeed}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${metrics.performance.averageSpeed}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Learning Quality</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Consistency</span>
                  <span className="text-sm font-medium">{metrics.performance.consistency}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Retention</span>
                  <span className="text-sm font-medium">{metrics.performance.retention}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${metrics.performance.consistency}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Character Performance */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Character Performance</h3>
            <div className="space-y-4">
              {characterAnalytics.map((char, index) => (
                <motion.div
                  key={char.character}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl font-bold text-primary">
                        {char.character}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {char.type} • Mastery: {char.mastery}%
                        </div>
                        <div className="text-sm text-gray-600">
                          {char.attempts} attempts • {char.averageTime}s average
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(char.improvement >= 10 ? 'low' : char.improvement >= 5 ? 'medium' : 'high')}`}>
                        {char.improvement > 0 ? '+' : ''}{char.improvement}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Strengths</h5>
                      <div className="space-y-1">
                        {char.strengths.map((strength, i) => (
                          <div key={i} className="flex items-center space-x-2 text-sm text-green-700">
                            <CheckCircle className="w-4 h-4" />
                            <span>{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Areas for Improvement</h5>
                      <div className="space-y-1">
                        {char.commonMistakes.map((mistake, i) => (
                          <div key={i} className="flex items-center space-x-2 text-sm text-red-700">
                            <AlertCircle className="w-4 h-4" />
                            <span>{mistake}</span>
                          </div>
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

      {/* Progress Tab */}
      {selectedView === 'progress' && metrics && (
        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Characters Learned</h3>
                <BookOpen className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {metrics.progress.charactersLearned}
              </div>
              <div className="text-sm text-gray-600">
                {metrics.progress.charactersMastered} mastered
              </div>
            </div>

            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Practice Time</h3>
                <Clock className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {Math.round(metrics.progress.totalPracticeTime / 60)}h
              </div>
              <div className="text-sm text-gray-600">
                {metrics.progress.averageSessionTime}min average
              </div>
            </div>

            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Sessions</h3>
                <Activity className="w-6 h-6 text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {metrics.progress.sessionsCompleted}
              </div>
              <div className="text-sm text-gray-600">
                {metrics.engagement.sessionFrequency.toFixed(1)} per day
              </div>
            </div>

            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Improvement</h3>
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                +{metrics.progress.improvementRate}%
              </div>
              <div className="text-sm text-gray-600">
                This month
              </div>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Learning Progress</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="charactersPracticed" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="sessionsCompleted" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {selectedView === 'goals' && showGoals && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Learning Goals</h3>
            <button
              onClick={() => setShowGoals(!showGoals)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 border-base rounded-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGoalStatusColor(goal.status)}`}>
                    {goal.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {goal.current} / {goal.target} {goal.unit}
                  </span>
                  <span className="text-sm font-medium">{goal.progress}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {goal.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Tab */}
      {selectedView === 'comparison' && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Peer Comparison</h3>
          <div className="space-y-4">
            {comparisons.map((comparison, index) => (
              <motion.div
                key={comparison.metric}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 border-base rounded-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">{comparison.metric}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(comparison.trend)}`}>
                      {comparison.percentile}th percentile
                    </span>
                    <div className={`flex items-center space-x-1 ${getTrendColor(comparison.trend)}`}>
                      {getTrendIcon(comparison.trend)}
                      <span className="text-sm font-medium">
                        {comparison.improvement > 0 ? '+' : ''}{comparison.improvement}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Your Performance</div>
                    <div className="text-2xl font-bold text-gray-900">{comparison.yourValue}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Average</div>
                    <div className="text-2xl font-bold text-gray-500">{comparison.averageValue}</div>
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
