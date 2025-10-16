"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Clock, Target, CheckCircle, AlertCircle, Zap, Star, ArrowRight } from 'lucide-react';

interface OnboardingAnalyticsProps {
  className?: string;
}

interface OnboardingMetrics {
  totalUsers: number;
  completionRate: number;
  averageTime: number;
  dropoffPoints: Array<{ step: string; dropoffRate: number }>;
  goalDistribution: Array<{ goal: string; percentage: number }>;
  levelDistribution: Array<{ level: string; percentage: number }>;
  paceDistribution: Array<{ pace: string; percentage: number }>;
  timeToFirstCharacter: number;
  featureTourEngagement: number;
  celebrationEngagement: number;
  recoveryOnboardingUsage: number;
}

interface UserJourney {
  userId: string;
  startTime: string;
  completionTime?: string;
  stepsCompleted: string[];
  dropoffStep?: string;
  totalTime?: number;
  goal?: string;
  level?: string;
  pace?: string;
  completed: boolean;
}

export const OnboardingAnalytics: React.FC<OnboardingAnalyticsProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState<OnboardingMetrics | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'overview' | 'funnel' | 'engagement' | 'optimization'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in real app, this would come from analytics service
  const mockMetrics: OnboardingMetrics = {
    totalUsers: 1247,
    completionRate: 73.2,
    averageTime: 4.2, // minutes
    dropoffPoints: [
      { step: 'Welcome Screen', dropoffRate: 2.1 },
      { step: 'Goal Selection', dropoffRate: 8.5 },
      { step: 'Level Assessment', dropoffRate: 12.3 },
      { step: 'Pace Selection', dropoffRate: 15.7 },
      { step: 'Account Creation', dropoffRate: 18.2 },
      { step: 'Character Tutorial', dropoffRate: 22.1 },
      { step: 'Feature Tour', dropoffRate: 28.9 },
      { step: 'Celebration', dropoffRate: 31.4 }
    ],
    goalDistribution: [
      { goal: 'JLPT', percentage: 35.2 },
      { goal: 'Manga/Anime', percentage: 28.7 },
      { goal: 'Travel', percentage: 18.9 },
      { goal: 'Business', percentage: 12.1 },
      { goal: 'Personal', percentage: 5.1 }
    ],
    levelDistribution: [
      { level: 'Complete Beginner', percentage: 45.3 },
      { level: 'Know Hiragana', percentage: 28.7 },
      { level: 'Know Hiragana + Katakana', percentage: 15.2 },
      { level: 'Some Kanji', percentage: 8.1 },
      { level: 'Intermediate+', percentage: 2.7 }
    ],
    paceDistribution: [
      { pace: 'Casual', percentage: 42.1 },
      { pace: 'Regular', percentage: 38.7 },
      { pace: 'Intensive', percentage: 15.2 },
      { pace: 'Custom', percentage: 4.0 }
    ],
    timeToFirstCharacter: 3.8,
    featureTourEngagement: 67.3,
    celebrationEngagement: 89.1,
    recoveryOnboardingUsage: 23.4
  };

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setMetrics(mockMetrics);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedTimeframe]);

  const getDropoffColor = (rate: number) => {
    if (rate < 10) return '#10B981';
    if (rate < 20) return '#F59E0B';
    return '#EF4444';
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return '#10B981';
    if (rate >= 60) return '#F59E0B';
    return '#EF4444';
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 ${className}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="heading text-4xl font-bold text-gray-900">Onboarding Analytics</h1>
          <p className="body text-lg text-gray-600 max-w-2xl mx-auto">
            Track and optimize the user onboarding experience to improve conversion rates
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex justify-center">
          <div className="bg-white border-base rounded-lg p-1 shadow-sm">
            {(['7d', '30d', '90d'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {timeframe === '7d' ? '7 Days' : timeframe === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex justify-center">
          <div className="bg-white border-base rounded-lg p-1 shadow-sm">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'funnel', label: 'Funnel Analysis' },
              { id: 'engagement', label: 'Engagement' },
              { id: 'optimization', label: 'Optimization' }
            ].map((metric) => (
              <button
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id as typeof selectedMetric)}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  selectedMetric === metric.id
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Metrics */}
        {selectedMetric === 'overview' && metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              className="bg-white border-base rounded-lg p-6 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </motion.div>

            <motion.div
              className="bg-white border-base rounded-lg p-6 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className={`text-2xl font-bold ${getCompletionColor(metrics.completionRate)}`}>
                    {metrics.completionRate}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </motion.div>

            <motion.div
              className="bg-white border-base rounded-lg p-6 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Time</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.averageTime} min</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </motion.div>

            <motion.div
              className="bg-white border-base rounded-lg p-6 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Time to First Character</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.timeToFirstCharacter} min</p>
                </div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Funnel Analysis */}
        {selectedMetric === 'funnel' && metrics && (
          <div className="space-y-6">
            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <h3 className="heading text-xl font-semibold mb-4">Onboarding Funnel</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.dropoffPoints}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="dropoffRate" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border-base rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold mb-4">Goal Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={metrics.goalDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="percentage"
                      label={({ goal, percentage }) => `${goal}: ${percentage}%`}
                    >
                      {metrics.goalDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white border-base rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold mb-4">Level Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={metrics.levelDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="percentage"
                      label={({ level, percentage }) => `${level}: ${percentage}%`}
                    >
                      {metrics.levelDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white border-base rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold mb-4">Pace Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={metrics.paceDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="percentage"
                      label={({ pace, percentage }) => `${pace}: ${percentage}%`}
                    >
                      {metrics.paceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff7300'][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Engagement Metrics */}
        {selectedMetric === 'engagement' && metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <h3 className="heading text-xl font-semibold mb-4">Feature Engagement</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Feature Tour</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 h-2 rounded-full">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${metrics.featureTourEngagement}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{metrics.featureTourEngagement}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Celebration System</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 h-2 rounded-full">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${metrics.celebrationEngagement}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{metrics.celebrationEngagement}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recovery Onboarding</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 h-2 rounded-full">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${metrics.recoveryOnboardingUsage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{metrics.recoveryOnboardingUsage}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <h3 className="heading text-xl font-semibold mb-4">Optimization Opportunities</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">High dropoff at Account Creation</p>
                    <p className="text-xs text-gray-600">18.2% of users drop off here</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Celebration system works well</p>
                    <p className="text-xs text-gray-600">89.1% engagement rate</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Consider A/B testing pace selection</p>
                    <p className="text-xs text-gray-600">15.7% dropoff rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Optimization Recommendations */}
        {selectedMetric === 'optimization' && metrics && (
          <div className="space-y-6">
            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <h3 className="heading text-xl font-semibold mb-4">Optimization Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">High Priority</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Simplify account creation process</li>
                      <li>• Add guest mode option earlier</li>
                      <li>• Reduce form fields in registration</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Medium Priority</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• A/B test pace selection options</li>
                      <li>• Add progress indicators</li>
                      <li>• Improve level assessment flow</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Low Priority</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Enhance celebration animations</li>
                      <li>• Add more social proof</li>
                      <li>• Improve mobile experience</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Experiments</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Test shorter onboarding flow</li>
                      <li>• Try different goal options</li>
                      <li>• Experiment with skip options</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <h3 className="heading text-xl font-semibold mb-4">Success Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{metrics.completionRate}%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                  <div className="text-xs text-gray-500 mt-1">Target: 80%</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{metrics.averageTime} min</div>
                  <div className="text-sm text-gray-600">Average Time</div>
                  <div className="text-xs text-gray-500 mt-1">Target: 3 min</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{metrics.timeToFirstCharacter} min</div>
                  <div className="text-sm text-gray-600">Time to First Character</div>
                  <div className="text-xs text-gray-500 mt-1">Target: 2 min</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
