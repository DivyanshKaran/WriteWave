"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, TrendingUp, TrendingDown, Target, Award, Zap, Eye, Brain, Heart, Star, Filter, Download, Share2, Settings, RefreshCw, AlertCircle, CheckCircle, Info, ArrowUp, ArrowDown, Minus, Plus, Activity, Users, BookOpen, Target as TargetIcon, Flame, Trophy, BarChart, PieChart, LineChart, Gauge, Timer, Rocket, Speed, Wrench, Hammer, Shield, Award as AwardIcon, Sun, Moon, Coffee, Bed } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, Heatmap } from 'recharts';

interface TimeOptimizationAnalysisProps {
  userId: string;
  className?: string;
}

interface TimeMetrics {
  overall: {
    totalStudyTime: number;
    averageSessionLength: number;
    optimalSessionLength: number;
    efficiency: number;
    productivity: number;
    focus: number;
    retention: number;
  };
  patterns: {
    bestTimeOfDay: string;
    worstTimeOfDay: string;
    bestDayOfWeek: string;
    worstDayOfWeek: string;
    peakHours: string[];
    lowHours: string[];
    optimalBreakLength: number;
    optimalWorkBlocks: number;
  };
  efficiency: {
    timeWasted: number;
    distractions: number;
    contextSwitching: number;
    multitasking: number;
    deepWork: number;
    shallowWork: number;
  };
}

interface TimeDataPoint {
  date: string;
  totalTime: number;
  productiveTime: number;
  wastedTime: number;
  efficiency: number;
  focus: number;
  sessions: number;
  breaks: number;
  distractions: number;
  achievements: number;
}

interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: 'study' | 'break' | 'distraction' | 'transition';
  efficiency: number;
  focus: number;
  productivity: number;
  activities: string[];
  distractions: string[];
  achievements: string[];
  mood: 'excellent' | 'good' | 'average' | 'poor' | 'terrible';
  energy: number;
  environment: string;
}

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  category: 'timing' | 'duration' | 'breaks' | 'environment' | 'focus' | 'habits';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedImprovement: number;
  timeToImplement: number;
  steps: string[];
  resources: string[];
  trackingMetrics: string[];
  successCriteria: string[];
}

interface TimeAnalysis {
  productivity: {
    peakProductivityHours: string[];
    lowProductivityHours: string[];
    productivityTrend: 'improving' | 'declining' | 'stable';
    averageProductivity: number;
    bestProductivity: number;
  };
  focus: {
    averageFocusTime: number;
    longestFocusSession: number;
    focusInterruptions: number;
    focusRecoveryTime: number;
    focusTrend: 'improving' | 'declining' | 'stable';
  };
  efficiency: {
    timeUtilization: number;
    wasteReduction: number;
    efficiencyGains: number;
    efficiencyTrend: 'improving' | 'declining' | 'stable';
  };
}

interface TimeGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: 'hours' | 'minutes' | 'sessions' | 'efficiency';
  deadline: string;
  progress: number;
  status: 'on-track' | 'behind' | 'ahead' | 'completed';
  category: 'study-time' | 'efficiency' | 'focus' | 'breaks';
}

export const TimeOptimizationAnalysis: React.FC<TimeOptimizationAnalysisProps> = ({
  userId,
  className = ''
}) => {
  const [metrics, setMetrics] = useState<TimeMetrics | null>(null);
  const [timeData, setTimeData] = useState<TimeDataPoint[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [analysis, setAnalysis] = useState<TimeAnalysis | null>(null);
  const [goals, setGoals] = useState<TimeGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'patterns' | 'efficiency' | 'suggestions' | 'goals' | 'analysis'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock data - in real app, this would come from analytics service
  useEffect(() => {
    const loadTimeData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock time metrics
      const mockMetrics: TimeMetrics = {
        overall: {
          totalStudyTime: 3240,
          averageSessionLength: 28,
          optimalSessionLength: 45,
          efficiency: 78,
          productivity: 82,
          focus: 75,
          retention: 88
        },
        patterns: {
          bestTimeOfDay: '09:00-11:00',
          worstTimeOfDay: '14:00-16:00',
          bestDayOfWeek: 'Tuesday',
          worstDayOfWeek: 'Friday',
          peakHours: ['09:00-11:00', '19:00-21:00'],
          lowHours: ['12:00-13:00', '15:00-17:00'],
          optimalBreakLength: 15,
          optimalWorkBlocks: 3
        },
        efficiency: {
          timeWasted: 18,
          distractions: 12,
          contextSwitching: 8,
          multitasking: 15,
          deepWork: 65,
          shallowWork: 35
        }
      };

      // Mock time data
      const mockTimeData: TimeDataPoint[] = [
        { date: '2024-01-08', totalTime: 45, productiveTime: 35, wastedTime: 10, efficiency: 78, focus: 72, sessions: 2, breaks: 3, distractions: 5, achievements: 8 },
        { date: '2024-01-09', totalTime: 60, productiveTime: 48, wastedTime: 12, efficiency: 80, focus: 75, sessions: 3, breaks: 4, distractions: 4, achievements: 12 },
        { date: '2024-01-10', totalTime: 55, productiveTime: 44, wastedTime: 11, efficiency: 82, focus: 78, sessions: 3, breaks: 3, distractions: 3, achievements: 15 },
        { date: '2024-01-11', totalTime: 70, productiveTime: 56, wastedTime: 14, efficiency: 85, focus: 80, sessions: 4, breaks: 5, distractions: 2, achievements: 18 },
        { date: '2024-01-12', totalTime: 65, productiveTime: 52, wastedTime: 13, efficiency: 87, focus: 82, sessions: 4, breaks: 4, distractions: 2, achievements: 20 },
        { date: '2024-01-13', totalTime: 75, productiveTime: 60, wastedTime: 15, efficiency: 88, focus: 85, sessions: 5, breaks: 6, distractions: 1, achievements: 22 },
        { date: '2024-01-14', totalTime: 80, productiveTime: 64, wastedTime: 16, efficiency: 90, focus: 87, sessions: 5, breaks: 7, distractions: 1, achievements: 25 }
      ];

      // Mock time blocks
      const mockTimeBlocks: TimeBlock[] = [
        {
          id: 'block-1',
          startTime: '09:00',
          endTime: '09:45',
          duration: 45,
          type: 'study',
          efficiency: 90,
          focus: 85,
          productivity: 88,
          activities: ['Character practice', 'Stroke order', 'Vocabulary'],
          distractions: [],
          achievements: ['Completed 10 characters', 'Improved accuracy'],
          mood: 'excellent',
          energy: 9,
          environment: 'Quiet room'
        },
        {
          id: 'block-2',
          startTime: '14:00',
          endTime: '14:30',
          duration: 30,
          type: 'study',
          efficiency: 60,
          focus: 55,
          productivity: 58,
          activities: ['Review session', 'Reading practice'],
          distractions: ['Phone notifications', 'Background noise'],
          achievements: ['Reviewed 5 characters'],
          mood: 'average',
          energy: 6,
          environment: 'Noisy environment'
        }
      ];

      // Mock suggestions
      const mockSuggestions: OptimizationSuggestion[] = [
        {
          id: 'suggestion-1',
          title: 'Optimize Study Schedule',
          description: 'Schedule study sessions during your peak productivity hours (9-11 AM)',
          category: 'timing',
          priority: 'high',
          impact: 'high',
          difficulty: 'easy',
          estimatedImprovement: 25,
          timeToImplement: 1,
          steps: [
            'Identify your peak hours',
            'Schedule important tasks during peak hours',
            'Avoid scheduling during low-energy periods',
            'Track productivity changes'
          ],
          resources: ['Productivity tracker', 'Time analysis tools'],
          trackingMetrics: ['Productivity score', 'Focus time', 'Achievement rate'],
          successCriteria: ['25% increase in productivity', 'Better focus during peak hours']
        },
        {
          id: 'suggestion-2',
          title: 'Implement Pomodoro Technique',
          description: 'Use 25-minute focused work blocks with 5-minute breaks',
          category: 'duration',
          priority: 'medium',
          impact: 'medium',
          difficulty: 'easy',
          estimatedImprovement: 15,
          timeToImplement: 1,
          steps: [
            'Set timer for 25 minutes',
            'Focus on single task',
            'Take 5-minute break',
            'Repeat for 4 cycles',
            'Take longer break (15-30 minutes)'
          ],
          resources: ['Pomodoro timer app', 'Focus techniques guide'],
          trackingMetrics: ['Focus duration', 'Task completion rate', 'Break frequency'],
          successCriteria: ['Improved focus', 'Better task completion', 'Reduced fatigue']
        }
      ];

      // Mock analysis
      const mockAnalysis: TimeAnalysis = {
        productivity: {
          peakProductivityHours: ['09:00-11:00', '19:00-21:00'],
          lowProductivityHours: ['12:00-13:00', '15:00-17:00'],
          productivityTrend: 'improving',
          averageProductivity: 82,
          bestProductivity: 95
        },
        focus: {
          averageFocusTime: 35,
          longestFocusSession: 90,
          focusInterruptions: 3,
          focusRecoveryTime: 5,
          focusTrend: 'improving'
        },
        efficiency: {
          timeUtilization: 78,
          wasteReduction: 22,
          efficiencyGains: 15,
          efficiencyTrend: 'improving'
        }
      };

      // Mock goals
      const mockGoals: TimeGoal[] = [
        {
          id: 'goal-1',
          title: 'Increase Daily Study Time',
          description: 'Gradually increase daily study time to 2 hours',
          target: 120,
          current: 80,
          unit: 'minutes',
          deadline: '2024-02-01',
          progress: 67,
          status: 'on-track',
          category: 'study-time'
        },
        {
          id: 'goal-2',
          title: 'Improve Efficiency',
          description: 'Achieve 90% time efficiency in study sessions',
          target: 90,
          current: 78,
          unit: 'efficiency',
          deadline: '2024-01-31',
          progress: 87,
          status: 'on-track',
          category: 'efficiency'
        }
      ];

      setMetrics(mockMetrics);
      setTimeData(mockTimeData);
      setTimeBlocks(mockTimeBlocks);
      setSuggestions(mockSuggestions);
      setAnalysis(mockAnalysis);
      setGoals(mockGoals);
      setIsLoading(false);
    };

    loadTimeData();
  }, [userId, selectedPeriod]);

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'average': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-orange-600 bg-orange-50';
      case 'terrible': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'excellent': return <Star className="w-4 h-4 text-green-500" />;
      case 'good': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'average': return <Minus className="w-4 h-4 text-yellow-500" />;
      case 'poor': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'terrible': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 bg-green-50';
      case 'declining': return 'text-red-600 bg-red-50';
      case 'stable': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'timing': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'duration': return <Timer className="w-5 h-5 text-green-500" />;
      case 'breaks': return <Coffee className="w-5 h-5 text-orange-500" />;
      case 'environment': return <Eye className="w-5 h-5 text-purple-500" />;
      case 'focus': return <Target className="w-5 h-5 text-indigo-500" />;
      case 'habits': return <Brain className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-50';
      case 'behind': return 'text-red-600 bg-red-50';
      case 'ahead': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTimeOfDayIcon = (time: string) => {
    if (time.includes('09:00') || time.includes('10:00') || time.includes('11:00')) {
      return <Sun className="w-4 h-4 text-yellow-500" />;
    } else if (time.includes('14:00') || time.includes('15:00') || time.includes('16:00')) {
      return <Coffee className="w-4 h-4 text-orange-500" />;
    } else if (time.includes('19:00') || time.includes('20:00') || time.includes('21:00')) {
      return <Moon className="w-4 h-4 text-blue-500" />;
    }
    return <Clock className="w-4 h-4 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Analyzing time patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Time Optimization Analysis</h2>
          <p className="body text-gray-600">
            Analyze your study time patterns and optimize for maximum productivity
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
          { id: 'patterns', label: 'Patterns', icon: Calendar },
          { id: 'efficiency', label: 'Efficiency', icon: Zap },
          { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
          { id: 'goals', label: 'Goals', icon: Target },
          { id: 'analysis', label: 'Analysis', icon: Gauge }
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-500">Total Time</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(metrics.overall.totalStudyTime / 60)}h
              </div>
              <div className="text-xs text-gray-600">This month</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Timer className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-500">Avg Session</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.averageSessionLength}m</div>
              <div className="text-xs text-gray-600">Length</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-purple-500" />
                <span className="text-xs text-gray-500">Optimal</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.optimalSessionLength}m</div>
              <div className="text-xs text-gray-600">Session</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-xs text-gray-500">Efficiency</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.efficiency}%</div>
              <div className="text-xs text-gray-600">Score</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Rocket className="w-5 h-5 text-orange-500" />
                <span className="text-xs text-gray-500">Productivity</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.productivity}%</div>
              <div className="text-xs text-gray-600">Score</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-5 h-5 text-indigo-500" />
                <span className="text-xs text-gray-500">Focus</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.focus}%</div>
              <div className="text-xs text-gray-600">Score</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Brain className="w-5 h-5 text-red-500" />
                <span className="text-xs text-gray-500">Retention</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.retention}%</div>
              <div className="text-xs text-gray-600">Score</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Coffee className="w-5 h-5 text-brown-500" />
                <span className="text-xs text-gray-500">Optimal Break</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.patterns.optimalBreakLength}m</div>
              <div className="text-xs text-gray-600">Length</div>
            </div>
          </div>

          {/* Time Patterns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <h3 className="heading text-lg font-semibold mb-4">Optimal Times</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTimeOfDayIcon(metrics.patterns.bestTimeOfDay)}
                    <span className="text-sm text-gray-600">Best Time</span>
                  </div>
                  <span className="font-medium">{metrics.patterns.bestTimeOfDay}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTimeOfDayIcon(metrics.patterns.worstTimeOfDay)}
                    <span className="text-sm text-gray-600">Worst Time</span>
                  </div>
                  <span className="font-medium">{metrics.patterns.worstTimeOfDay}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Best Day</span>
                  <span className="font-medium">{metrics.patterns.bestDayOfWeek}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Worst Day</span>
                  <span className="font-medium">{metrics.patterns.worstDayOfWeek}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <h3 className="heading text-lg font-semibold mb-4">Efficiency Breakdown</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Deep Work</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${metrics.efficiency.deepWork}%` }} />
                    </div>
                    <span className="text-sm font-medium">{metrics.efficiency.deepWork}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Shallow Work</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${metrics.efficiency.shallowWork}%` }} />
                    </div>
                    <span className="text-sm font-medium">{metrics.efficiency.shallowWork}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Time Wasted</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${metrics.efficiency.timeWasted}%` }} />
                    </div>
                    <span className="text-sm font-medium">{metrics.efficiency.timeWasted}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Distractions</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${metrics.efficiency.distractions}%` }} />
                    </div>
                    <span className="text-sm font-medium">{metrics.efficiency.distractions}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Time Trends */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Time Usage Trends</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="productiveTime" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="wastedTime" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Patterns Tab */}
      {selectedView === 'patterns' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Time Blocks Analysis</h3>
            <div className="space-y-4">
              {timeBlocks.map((block, index) => (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-primary">
                        {block.startTime} - {block.endTime}
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm">
                        {block.duration}m
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getMoodIcon(block.mood)}
                      <span className={`px-2 py-1 rounded text-sm ${getMoodColor(block.mood)}`}>
                        {block.mood}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">{block.efficiency}%</div>
                      <div className="text-sm text-gray-600">Efficiency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">{block.focus}%</div>
                      <div className="text-sm text-gray-600">Focus</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">{block.productivity}%</div>
                      <div className="text-sm text-gray-600">Productivity</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Activities</h5>
                      <div className="flex flex-wrap gap-1">
                        {block.activities.map((activity) => (
                          <span key={activity} className="px-2 py-1 bg-green-100 text-green-600 rounded text-sm">
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Distractions</h5>
                      <div className="flex flex-wrap gap-1">
                        {block.distractions.map((distraction) => (
                          <span key={distraction} className="px-2 py-1 bg-red-100 text-red-600 rounded text-sm">
                            {distraction}
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

      {/* Suggestions Tab */}
      {selectedView === 'suggestions' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Optimization Suggestions</h3>
            <div className="space-y-6">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-6 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getCategoryIcon(suggestion.category)}
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{suggestion.title}</h4>
                        <p className="text-gray-600">{suggestion.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority}
                      </span>
                      <span className="text-sm text-gray-600">+{suggestion.estimatedImprovement}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Implementation Steps</h5>
                      <ol className="space-y-1">
                        {suggestion.steps.map((step, i) => (
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
                        {suggestion.successCriteria.map((criteria, i) => (
                          <li key={i} className="text-sm text-gray-600">• {criteria}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Time to implement: {suggestion.timeToImplement} day{suggestion.timeToImplement !== 1 ? 's' : ''}
                    </div>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                      Implement
                    </button>
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
            <h3 className="heading text-lg font-semibold mb-4">Time Optimization Goals</h3>
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
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(goal.status)}`}>
                      {goal.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                    <span className="text-sm font-medium">{goal.progress}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Deadline: {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                      Update Goal
                    </button>
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
