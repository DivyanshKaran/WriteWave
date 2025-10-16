"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Target, Award, Clock, Zap, Eye, Brain, Heart, Star, Calendar, Filter, Download, Share2, Settings, RefreshCw, AlertCircle, CheckCircle, Info, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AdvancedPracticeAnalyticsProps {
  userId: string;
  className?: string;
}

interface LearningMetrics {
  accuracy: number;
  speed: number;
  consistency: number;
  improvement: number;
  engagement: number;
  retention: number;
  efficiency: number;
  motivation: number;
}

interface PerformanceTrend {
  date: string;
  accuracy: number;
  speed: number;
  consistency: number;
  charactersPracticed: number;
  timeSpent: number;
  xpEarned: number;
}

interface CharacterAnalytics {
  character: string;
  attempts: number;
  accuracy: number;
  averageTime: number;
  difficulty: number;
  mastery: number;
  lastPracticed: string;
  improvement: number;
  commonMistakes: string[];
  strengths: string[];
}

interface LearningPattern {
  bestTime: string;
  worstTime: string;
  optimalDuration: number;
  preferredCharacters: string[];
  difficultCharacters: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  pace: 'slow' | 'moderate' | 'fast';
  consistency: 'low' | 'medium' | 'high';
}

interface Insight {
  id: string;
  type: 'improvement' | 'warning' | 'achievement' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  actionText?: string;
  actionUrl?: string;
  createdAt: string;
}

interface AnalyticsReport {
  id: string;
  title: string;
  period: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: string;
  endDate: string;
  metrics: LearningMetrics;
  trends: PerformanceTrend[];
  characterAnalytics: CharacterAnalytics[];
  patterns: LearningPattern;
  insights: Insight[];
  recommendations: string[];
  summary: string;
}

export const AdvancedPracticeAnalytics: React.FC<AdvancedPracticeAnalyticsProps> = ({
  userId,
  className = ''
}) => {
  const [currentReport, setCurrentReport] = useState<AnalyticsReport | null>(null);
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('weekly');
  const [showInsights, setShowInsights] = useState(true);
  const [showPatterns, setShowPatterns] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Mock data - in real app, this would come from analytics service
  useEffect(() => {
    const loadAnalyticsData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock performance trends
      const mockTrends: PerformanceTrend[] = [
        { date: '2024-01-08', accuracy: 75, speed: 65, consistency: 70, charactersPracticed: 12, timeSpent: 25, xpEarned: 150 },
        { date: '2024-01-09', accuracy: 78, speed: 68, consistency: 72, charactersPracticed: 15, timeSpent: 30, xpEarned: 180 },
        { date: '2024-01-10', accuracy: 82, speed: 72, consistency: 75, charactersPracticed: 18, timeSpent: 35, xpEarned: 220 },
        { date: '2024-01-11', accuracy: 85, speed: 75, consistency: 78, charactersPracticed: 20, timeSpent: 40, xpEarned: 250 },
        { date: '2024-01-12', accuracy: 88, speed: 78, consistency: 80, charactersPracticed: 22, timeSpent: 45, xpEarned: 280 },
        { date: '2024-01-13', accuracy: 90, speed: 80, consistency: 82, charactersPracticed: 25, timeSpent: 50, xpEarned: 320 },
        { date: '2024-01-14', accuracy: 92, speed: 82, consistency: 85, charactersPracticed: 28, timeSpent: 55, xpEarned: 350 }
      ];

      // Mock character analytics
      const mockCharacterAnalytics: CharacterAnalytics[] = [
        {
          character: 'あ',
          attempts: 45,
          accuracy: 95,
          averageTime: 3.2,
          difficulty: 1,
          mastery: 98,
          lastPracticed: '2024-01-14T10:30:00Z',
          improvement: 15,
          commonMistakes: ['Stroke order'],
          strengths: ['Consistent shape', 'Good proportions']
        },
        {
          character: 'か',
          attempts: 38,
          accuracy: 88,
          averageTime: 4.1,
          difficulty: 2,
          mastery: 85,
          lastPracticed: '2024-01-14T09:15:00Z',
          improvement: 12,
          commonMistakes: ['Curve angle', 'Stroke connection'],
          strengths: ['Good stroke order', 'Consistent size']
        }
      ];

      // Mock insights
      const mockInsights: Insight[] = [
        {
          id: 'insight-1',
          type: 'improvement',
          title: 'Accuracy Improvement',
          description: 'Your accuracy has improved by 15% over the past week',
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
        }
      ];

      // Mock learning patterns
      const mockPatterns: LearningPattern = {
        bestTime: '09:00-11:00',
        worstTime: '14:00-16:00',
        optimalDuration: 45,
        preferredCharacters: ['あ', 'い', 'う', 'え', 'お'],
        difficultCharacters: ['り', 'つ', 'ふ'],
        learningStyle: 'visual',
        pace: 'moderate',
        consistency: 'high'
      };

      // Mock metrics
      const mockMetrics: LearningMetrics = {
        accuracy: 92,
        speed: 82,
        consistency: 85,
        improvement: 15,
        engagement: 88,
        retention: 90,
        efficiency: 85,
        motivation: 92
      };

      // Mock report
      const mockReport: AnalyticsReport = {
        id: 'report-1',
        title: 'Weekly Learning Report',
        period: 'weekly',
        startDate: '2024-01-08',
        endDate: '2024-01-14',
        metrics: mockMetrics,
        trends: mockTrends,
        characterAnalytics: mockCharacterAnalytics,
        patterns: mockPatterns,
        insights: mockInsights,
        recommendations: [
          'Continue practicing in the morning for best results',
          'Focus on characters り, つ, ふ for improvement',
          'Maintain current practice duration of 45 minutes'
        ],
        summary: 'Excellent progress this week with significant improvements in accuracy and consistency.'
      };

      setCurrentReport(mockReport);
      setReports([mockReport]);
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
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'improvement': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'achievement': return 'border-blue-200 bg-blue-50';
      case 'recommendation': return 'border-purple-200 bg-purple-50';
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

  const getMetricColor = (value: number) => {
    if (value >= 90) return 'text-green-600';
    if (value >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'accuracy': return <Target className="w-5 h-5" />;
      case 'speed': return <Zap className="w-5 h-5" />;
      case 'consistency': return <TrendingUp className="w-5 h-5" />;
      case 'improvement': return <ArrowUp className="w-5 h-5" />;
      case 'engagement': return <Heart className="w-5 h-5" />;
      case 'retention': return <Brain className="w-5 h-5" />;
      case 'efficiency': return <Clock className="w-5 h-5" />;
      case 'motivation': return <Star className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
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
          <h2 className="heading text-3xl font-bold text-gray-900">Advanced Practice Analytics</h2>
          <p className="body text-gray-600">
            Deep insights into your learning patterns and performance
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom</option>
          </select>
          <button className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {currentReport && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {Object.entries(currentReport.metrics).map(([key, value]) => (
            <div key={key} className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                {getMetricIcon(key)}
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getImpactColor(value >= 80 ? 'low' : value >= 60 ? 'medium' : 'high')}`}>
                  {value >= 80 ? 'High' : value >= 60 ? 'Medium' : 'Low'}
                </span>
              </div>
              <div className={`text-2xl font-bold mb-1 ${getMetricColor(value)}`}>
                {value}%
              </div>
              <div className="text-xs text-gray-600 capitalize">
                {key}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Performance Trends */}
      {currentReport && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Performance Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentReport.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="speed" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="consistency" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Character Analytics */}
      {currentReport && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Character Performance</h3>
          <div className="space-y-4">
            {currentReport.characterAnalytics.map((char, index) => (
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
                        Mastery: {char.mastery}%
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
      )}

      {/* Learning Patterns */}
      {currentReport && showPatterns && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Learning Patterns</h3>
            <button
              onClick={() => setShowPatterns(!showPatterns)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Optimal Times</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-800">Best Time</span>
                  <span className="text-sm font-medium text-blue-900">{currentReport.patterns.bestTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-800">Worst Time</span>
                  <span className="text-sm font-medium text-blue-900">{currentReport.patterns.worstTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-800">Optimal Duration</span>
                  <span className="text-sm font-medium text-blue-900">{currentReport.patterns.optimalDuration} min</span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Learning Style</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-green-800">Style</span>
                  <span className="text-sm font-medium text-green-900 capitalize">{currentReport.patterns.learningStyle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-800">Pace</span>
                  <span className="text-sm font-medium text-green-900 capitalize">{currentReport.patterns.pace}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-800">Consistency</span>
                  <span className="text-sm font-medium text-green-900 capitalize">{currentReport.patterns.consistency}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Character Preferences</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-purple-800">Preferred</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentReport.patterns.preferredCharacters.slice(0, 3).map((char) => (
                      <span key={char} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-purple-800">Difficult</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentReport.patterns.difficultCharacters.slice(0, 3).map((char) => (
                      <span key={char} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      {currentReport && showInsights && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">AI Insights</h3>
            <button
              onClick={() => setShowInsights(!showInsights)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {currentReport.insights.map((insight, index) => (
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

      {/* Recommendations */}
      {currentReport && showRecommendations && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Personalized Recommendations</h3>
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-3">
            {currentReport.recommendations.map((recommendation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
              >
                <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">{recommendation}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {currentReport && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Summary</h3>
          <p className="text-gray-700">{currentReport.summary}</p>
        </div>
      )}
    </div>
  );
};
