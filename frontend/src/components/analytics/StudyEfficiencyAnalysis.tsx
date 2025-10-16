"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, TrendingUp, TrendingDown, Target, Award, Zap, Eye, Brain, Heart, Star, Calendar, Filter, Download, Share2, Settings, RefreshCw, AlertCircle, CheckCircle, Info, ArrowUp, ArrowDown, Minus, Plus, Activity, BookOpen, Target as TargetIcon, Flame, Trophy, BarChart, PieChart, LineChart, Gauge, Timer, Rocket, Speed, Wrench, Hammer, Shield, Award as AwardIcon, Sun, Moon, Coffee, Bed, MemoryStick, Repeat, RotateCcw, Calendar as CalendarIcon, Crown, Medal, Flag, Globe, UserCheck, UserX, UserPlus, Map, Navigation, Compass, ArrowRight, ArrowLeft, Play, Pause, SkipForward, RotateCcw as RotateCcwIcon, Focus, Layers, GitBranch, GitCommit, GitMerge, GitPullRequest } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, Heatmap } from 'recharts';

interface StudyEfficiencyAnalysisProps {
  userId: string;
  className?: string;
}

interface EfficiencyMetrics {
  overall: {
    efficiency: number;
    productivity: number;
    focus: number;
    retention: number;
    engagement: number;
    consistency: number;
    improvement: number;
    optimization: number;
  };
  time: {
    totalStudyTime: number;
    productiveTime: number;
    wastedTime: number;
    optimalTime: number;
    averageSession: number;
    longestSession: number;
    shortestSession: number;
    breakTime: number;
  };
  patterns: {
    bestEfficiencyTime: string;
    worstEfficiencyTime: string;
    optimalSessionLength: number;
    optimalBreakLength: number;
    peakProductivityHours: string[];
    lowProductivityHours: string[];
    efficiencyTrend: 'improving' | 'declining' | 'stable';
  };
  factors: {
    distractions: number;
    contextSwitching: number;
    multitasking: number;
    deepWork: number;
    shallowWork: number;
    flowState: number;
    fatigue: number;
    motivation: number;
  };
}

interface EfficiencyDataPoint {
  date: string;
  efficiency: number;
  productivity: number;
  focus: number;
  retention: number;
  engagement: number;
  timeSpent: number;
  productiveTime: number;
  wastedTime: number;
  distractions: number;
  deepWork: number;
  flowState: number;
}

interface StudySession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  efficiency: number;
  productivity: number;
  focus: number;
  retention: number;
  engagement: number;
  activities: string[];
  distractions: string[];
  achievements: string[];
  mood: 'excellent' | 'good' | 'average' | 'poor' | 'terrible';
  energy: number;
  environment: string;
  techniques: string[];
  outcomes: string[];
  feedback: string[];
}

interface EfficiencyInsight {
  id: string;
  type: 'improvement' | 'decline' | 'plateau' | 'breakthrough' | 'warning' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  actionText?: string;
  actionUrl?: string;
  createdAt: string;
  data?: any;
}

interface EfficiencyStrategy {
  id: string;
  name: string;
  description: string;
  category: 'focus' | 'time-management' | 'environment' | 'techniques' | 'habits';
  effectiveness: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeToImplement: number;
  expectedImprovement: number;
  steps: string[];
  tips: string[];
  commonMistakes: string[];
  successCriteria: string[];
  status: 'suggested' | 'implemented' | 'rejected' | 'testing';
}

interface EfficiencyGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  progress: number;
  status: 'on-track' | 'behind' | 'ahead' | 'completed';
  category: 'efficiency' | 'productivity' | 'focus' | 'retention';
}

export const StudyEfficiencyAnalysis: React.FC<StudyEfficiencyAnalysisProps> = ({
  userId,
  className = ''
}) => {
  const [metrics, setMetrics] = useState<EfficiencyMetrics | null>(null);
  const [efficiencyData, setEfficiencyData] = useState<EfficiencyDataPoint[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [insights, setInsights] = useState<EfficiencyInsight[]>([]);
  const [strategies, setStrategies] = useState<EfficiencyStrategy[]>([]);
  const [goals, setGoals] = useState<EfficiencyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'sessions' | 'insights' | 'strategies' | 'goals' | 'analysis'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock data - in real app, this would come from analytics service
  useEffect(() => {
    const loadEfficiencyData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock efficiency metrics
      const mockMetrics: EfficiencyMetrics = {
        overall: {
          efficiency: 78,
          productivity: 82,
          focus: 75,
          retention: 88,
          engagement: 85,
          consistency: 80,
          improvement: 15,
          optimization: 72
        },
        time: {
          totalStudyTime: 3240,
          productiveTime: 2527,
          wastedTime: 713,
          optimalTime: 2880,
          averageSession: 45,
          longestSession: 120,
          shortestSession: 15,
          breakTime: 180
        },
        patterns: {
          bestEfficiencyTime: '09:00-11:00',
          worstEfficiencyTime: '14:00-16:00',
          optimalSessionLength: 50,
          optimalBreakLength: 15,
          peakProductivityHours: ['09:00-11:00', '19:00-21:00'],
          lowProductivityHours: ['12:00-13:00', '15:00-17:00'],
          efficiencyTrend: 'improving'
        },
        factors: {
          distractions: 12,
          contextSwitching: 8,
          multitasking: 15,
          deepWork: 65,
          shallowWork: 35,
          flowState: 25,
          fatigue: 18,
          motivation: 85
        }
      };

      // Mock efficiency data
      const mockEfficiencyData: EfficiencyDataPoint[] = [
        { date: '2024-01-08', efficiency: 72, productivity: 78, focus: 70, retention: 85, engagement: 80, timeSpent: 45, productiveTime: 32, wastedTime: 13, distractions: 8, deepWork: 60, flowState: 20 },
        { date: '2024-01-09', efficiency: 75, productivity: 80, focus: 72, retention: 86, engagement: 82, timeSpent: 50, productiveTime: 38, wastedTime: 12, distractions: 6, deepWork: 65, flowState: 25 },
        { date: '2024-01-10', efficiency: 78, productivity: 82, focus: 75, retention: 87, engagement: 84, timeSpent: 55, productiveTime: 43, wastedTime: 12, distractions: 5, deepWork: 70, flowState: 30 },
        { date: '2024-01-11', efficiency: 80, productivity: 85, focus: 78, retention: 88, engagement: 86, timeSpent: 60, productiveTime: 48, wastedTime: 12, distractions: 4, deepWork: 75, flowState: 35 },
        { date: '2024-01-12', efficiency: 82, productivity: 87, focus: 80, retention: 89, engagement: 88, timeSpent: 65, productiveTime: 53, wastedTime: 12, distractions: 3, deepWork: 80, flowState: 40 },
        { date: '2024-01-13', efficiency: 85, productivity: 90, focus: 83, retention: 90, engagement: 90, timeSpent: 70, productiveTime: 58, wastedTime: 12, distractions: 2, deepWork: 85, flowState: 45 },
        { date: '2024-01-14', efficiency: 87, productivity: 92, focus: 85, retention: 92, engagement: 92, timeSpent: 75, productiveTime: 63, wastedTime: 12, distractions: 1, deepWork: 90, flowState: 50 }
      ];

      // Mock study sessions
      const mockSessions: StudySession[] = [
        {
          id: 'session-1',
          startTime: '2024-01-14T09:00:00Z',
          endTime: '2024-01-14T09:50:00Z',
          duration: 50,
          efficiency: 90,
          productivity: 95,
          focus: 88,
          retention: 92,
          engagement: 90,
          activities: ['Character practice', 'Stroke order', 'Vocabulary'],
          distractions: [],
          achievements: ['Completed 15 characters', 'Improved accuracy'],
          mood: 'excellent',
          energy: 9,
          environment: 'Quiet room',
          techniques: ['Pomodoro', 'Active recall'],
          outcomes: ['High retention', 'Good progress'],
          feedback: ['Excellent session', 'Maintain this approach']
        },
        {
          id: 'session-2',
          startTime: '2024-01-14T14:00:00Z',
          endTime: '2024-01-14T14:30:00Z',
          duration: 30,
          efficiency: 60,
          productivity: 65,
          focus: 55,
          retention: 70,
          engagement: 60,
          activities: ['Review session', 'Reading practice'],
          distractions: ['Phone notifications', 'Background noise'],
          achievements: ['Reviewed 8 characters'],
          mood: 'average',
          energy: 6,
          environment: 'Noisy environment',
          techniques: ['Basic review'],
          outcomes: ['Moderate retention', 'Slow progress'],
          feedback: ['Need better environment', 'Reduce distractions']
        }
      ];

      // Mock insights
      const mockInsights: EfficiencyInsight[] = [
        {
          id: 'insight-1',
          type: 'improvement',
          title: 'Efficiency Improvement',
          description: 'Your study efficiency has improved by 15% over the past week',
          impact: 'high',
          actionable: true,
          actionText: 'Continue current approach',
          createdAt: '2024-01-14T10:00:00Z'
        },
        {
          id: 'insight-2',
          type: 'opportunity',
          title: 'Deep Work Opportunity',
          description: 'You achieve 90% efficiency during deep work sessions',
          impact: 'medium',
          actionable: true,
          actionText: 'Increase deep work time',
          createdAt: '2024-01-14T09:30:00Z'
        },
        {
          id: 'insight-3',
          type: 'warning',
          title: 'Afternoon Efficiency Drop',
          description: 'Your efficiency drops significantly in afternoon sessions',
          impact: 'medium',
          actionable: true,
          actionText: 'Schedule important tasks in morning',
          createdAt: '2024-01-14T08:00:00Z'
        }
      ];

      // Mock strategies
      const mockStrategies: EfficiencyStrategy[] = [
        {
          id: 'strategy-1',
          name: 'Pomodoro Technique',
          description: 'Work in 25-minute focused intervals with 5-minute breaks',
          category: 'time-management',
          effectiveness: 85,
          difficulty: 'easy',
          timeToImplement: 1,
          expectedImprovement: 20,
          steps: [
            'Set timer for 25 minutes',
            'Focus on single task',
            'Take 5-minute break',
            'Repeat for 4 cycles',
            'Take longer break (15-30 minutes)'
          ],
          tips: [
            'Use a physical timer',
            'Eliminate distractions',
            'Track your cycles',
            'Adjust intervals as needed'
          ],
          commonMistakes: [
            'Checking phone during focus time',
            'Skipping breaks',
            'Working on multiple tasks',
            'Not tracking progress'
          ],
          successCriteria: [
            'Increased focus time',
            'Better task completion',
            'Reduced fatigue',
            'Improved productivity'
          ],
          status: 'implemented'
        },
        {
          id: 'strategy-2',
          name: 'Deep Work Sessions',
          description: 'Dedicated time for focused, distraction-free work',
          category: 'focus',
          effectiveness: 90,
          difficulty: 'medium',
          timeToImplement: 3,
          expectedImprovement: 30,
          steps: [
            'Schedule deep work blocks',
            'Eliminate all distractions',
            'Set clear objectives',
            'Work in focused bursts',
            'Track deep work time'
          ],
          tips: [
            'Start with shorter sessions',
            'Create distraction-free environment',
            'Use noise-canceling headphones',
            'Track your deep work metrics'
          ],
          commonMistakes: [
            'Not eliminating distractions',
            'Trying to multitask',
            'Skipping preparation',
            'Not tracking progress'
          ],
          successCriteria: [
            'Increased deep work time',
            'Better quality output',
            'Improved focus',
            'Higher satisfaction'
          ],
          status: 'suggested'
        }
      ];

      // Mock goals
      const mockGoals: EfficiencyGoal[] = [
        {
          id: 'goal-1',
          title: 'Achieve 90% Efficiency',
          description: 'Reach 90% study efficiency in all sessions',
          target: 90,
          current: 78,
          unit: '%',
          deadline: '2024-02-01',
          progress: 87,
          status: 'on-track',
          category: 'efficiency'
        },
        {
          id: 'goal-2',
          title: 'Increase Deep Work Time',
          description: 'Spend 80% of study time in deep work',
          target: 80,
          current: 65,
          unit: '%',
          deadline: '2024-01-31',
          progress: 81,
          status: 'on-track',
          category: 'focus'
        }
      ];

      setMetrics(mockMetrics);
      setEfficiencyData(mockEfficiencyData);
      setSessions(mockSessions);
      setInsights(mockInsights);
      setStrategies(mockStrategies);
      setGoals(mockGoals);
      setIsLoading(false);
    };

    loadEfficiencyData();
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

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'decline': return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'plateau': return <Minus className="w-5 h-5 text-yellow-500" />;
      case 'breakthrough': return <Trophy className="w-5 h-5 text-blue-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'opportunity': return <Target className="w-5 h-5 text-purple-500" />;
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
      case 'behind': return 'text-red-600 bg-red-50';
      case 'ahead': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'focus': return <Focus className="w-5 h-5 text-blue-500" />;
      case 'time-management': return <Clock className="w-5 h-5 text-green-500" />;
      case 'environment': return <Eye className="w-5 h-5 text-purple-500" />;
      case 'techniques': return <Wrench className="w-5 h-5 text-orange-500" />;
      case 'habits': return <Repeat className="w-5 h-5 text-indigo-500" />;
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
          <p className="text-gray-600">Analyzing study efficiency...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Study Efficiency Analysis</h2>
          <p className="body text-gray-600">
            Analyze and optimize your study time efficiency for maximum learning outcomes
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
          { id: 'sessions', label: 'Sessions', icon: Clock },
          { id: 'insights', label: 'Insights', icon: Brain },
          { id: 'strategies', label: 'Strategies', icon: Lightbulb },
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
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-xs text-gray-500">Efficiency</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.efficiency}%</div>
              <div className="text-xs text-gray-600">Overall</div>
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
                <Focus className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-500">Focus</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.focus}%</div>
              <div className="text-xs text-gray-600">Score</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <span className="text-xs text-gray-500">Retention</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.retention}%</div>
              <div className="text-xs text-gray-600">Score</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-xs text-gray-500">Engagement</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.engagement}%</div>
              <div className="text-xs text-gray-600">Score</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-500">Improvement</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">+{metrics.overall.improvement}%</div>
              <div className="text-xs text-gray-600">This month</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Settings className="w-5 h-5 text-indigo-500" />
                <span className="text-xs text-gray-500">Optimization</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.optimization}%</div>
              <div className="text-xs text-gray-600">Score</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-teal-500" />
                <span className="text-xs text-gray-500">Consistency</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.consistency}%</div>
              <div className="text-xs text-gray-600">Score</div>
            </div>
          </div>

          {/* Time Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <h3 className="heading text-lg font-semibold mb-4">Time Breakdown</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Study Time</span>
                  <span className="text-sm font-medium">{Math.round(metrics.time.totalStudyTime / 60)}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Productive Time</span>
                  <span className="text-sm font-medium text-green-600">{Math.round(metrics.time.productiveTime / 60)}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Wasted Time</span>
                  <span className="text-sm font-medium text-red-600">{Math.round(metrics.time.wastedTime / 60)}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Optimal Time</span>
                  <span className="text-sm font-medium text-blue-600">{Math.round(metrics.time.optimalTime / 60)}h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(metrics.time.productiveTime / metrics.time.totalStudyTime) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <h3 className="heading text-lg font-semibold mb-4">Efficiency Factors</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Deep Work</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${metrics.factors.deepWork}%` }} />
                    </div>
                    <span className="text-sm font-medium">{metrics.factors.deepWork}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Flow State</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${metrics.factors.flowState}%` }} />
                    </div>
                    <span className="text-sm font-medium">{metrics.factors.flowState}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Distractions</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${metrics.factors.distractions}%` }} />
                    </div>
                    <span className="text-sm font-medium">{metrics.factors.distractions}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Motivation</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${metrics.factors.motivation}%` }} />
                    </div>
                    <span className="text-sm font-medium">{metrics.factors.motivation}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Efficiency Trends */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Efficiency Trends</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={efficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="efficiency" stroke="#f59e0b" strokeWidth={3} />
                  <Line type="monotone" dataKey="productivity" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="focus" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="retention" stroke="#8b5cf6" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {selectedView === 'sessions' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Study Sessions</h3>
            <div className="space-y-4">
              {sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-primary">
                        {new Date(session.startTime).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()}
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm">
                        {session.duration}m
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getMoodIcon(session.mood)}
                      <span className={`px-2 py-1 rounded text-sm ${getMoodColor(session.mood)}`}>
                        {session.mood}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{session.efficiency}%</div>
                      <div className="text-sm text-gray-600">Efficiency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{session.productivity}%</div>
                      <div className="text-sm text-gray-600">Productivity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{session.focus}%</div>
                      <div className="text-sm text-gray-600">Focus</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{session.retention}%</div>
                      <div className="text-sm text-gray-600">Retention</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{session.engagement}%</div>
                      <div className="text-sm text-gray-600">Engagement</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Activities</h5>
                      <div className="flex flex-wrap gap-1">
                        {session.activities.map((activity) => (
                          <span key={activity} className="px-2 py-1 bg-green-100 text-green-600 rounded text-sm">
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Distractions</h5>
                      <div className="flex flex-wrap gap-1">
                        {session.distractions.map((distraction) => (
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

      {/* Insights Tab */}
      {selectedView === 'insights' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Efficiency Insights</h3>
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
            <h3 className="heading text-lg font-semibold mb-4">Efficiency Strategies</h3>
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
                      {getCategoryIcon(strategy.category)}
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
                      Expected improvement: +{strategy.expectedImprovement}%
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(strategy.status)}`}>
                      {strategy.status}
                    </span>
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
            <h3 className="heading text-lg font-semibold mb-4">Efficiency Goals</h3>
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
                    <span className="text-sm text-gray-600 capitalize">
                      {goal.category}
                    </span>
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
