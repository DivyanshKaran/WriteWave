"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, TrendingDown, Target, Award, Clock, Zap, Eye, Brain, Heart, Star, Calendar, Filter, Download, Share2, Settings, RefreshCw, AlertCircle, CheckCircle, Info, ArrowUp, ArrowDown, Minus, Plus, Activity, BookOpen, Target as TargetIcon, Flame, Trophy, BarChart, PieChart, LineChart, Gauge, Timer, Rocket, Speed, Wrench, Hammer, Shield, Award as AwardIcon, Sun, Moon, Coffee, Bed, MemoryStick, Repeat, RotateCcw, Calendar as CalendarIcon, Crown, Medal, Flag, Globe, UserCheck, UserX, UserPlus } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, Heatmap } from 'recharts';

interface PeerBenchmarkingSystemProps {
  userId: string;
  className?: string;
}

interface BenchmarkMetrics {
  overall: {
    percentile: number;
    rank: number;
    totalUsers: number;
    score: number;
    improvement: number;
    trend: 'up' | 'down' | 'stable';
  };
  categories: {
    accuracy: {
      score: number;
      percentile: number;
      rank: number;
      average: number;
      top10: number;
    };
    speed: {
      score: number;
      percentile: number;
      rank: number;
      average: number;
      top10: number;
    };
    consistency: {
      score: number;
      percentile: number;
      rank: number;
      average: number;
      top10: number;
    };
    retention: {
      score: number;
      percentile: number;
      rank: number;
      average: number;
      top10: number;
    };
    engagement: {
      score: number;
      percentile: number;
      rank: number;
      average: number;
      top10: number;
    };
  };
  comparisons: {
    similarLevel: {
      count: number;
      averageScore: number;
      yourScore: number;
      difference: number;
    };
    similarAge: {
      count: number;
      averageScore: number;
      yourScore: number;
      difference: number;
    };
    similarGoals: {
      count: number;
      averageScore: number;
      yourScore: number;
      difference: number;
    };
  };
}

interface PeerComparison {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  score: number;
  accuracy: number;
  speed: number;
  consistency: number;
  retention: number;
  engagement: number;
  streak: number;
  totalTime: number;
  charactersLearned: number;
  achievements: number;
  rank: number;
  similarity: number;
  relationship: 'friend' | 'study-buddy' | 'competitor' | 'mentor' | 'mentee' | 'unknown';
  lastActive: string;
  progress: number;
  goals: string[];
  strengths: string[];
  weaknesses: string[];
}

interface BenchmarkTrend {
  date: string;
  yourScore: number;
  averageScore: number;
  top10Score: number;
  percentile: number;
  rank: number;
  improvement: number;
}

interface BenchmarkInsight {
  id: string;
  type: 'strength' | 'weakness' | 'opportunity' | 'threat' | 'achievement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  actionText?: string;
  actionUrl?: string;
  createdAt: string;
  data?: any;
}

interface BenchmarkGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  progress: number;
  status: 'on-track' | 'behind' | 'ahead' | 'completed';
  category: 'rank' | 'percentile' | 'score' | 'improvement';
  benchmark: 'global' | 'friends' | 'level' | 'age' | 'goals';
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  rank: number;
  change: number;
  level: number;
  streak: number;
  achievements: number;
  lastActive: string;
  isYou: boolean;
  relationship?: string;
}

export const PeerBenchmarkingSystem: React.FC<PeerBenchmarkingSystemProps> = ({
  userId,
  className = ''
}) => {
  const [metrics, setMetrics] = useState<BenchmarkMetrics | null>(null);
  const [peers, setPeers] = useState<PeerComparison[]>([]);
  const [trends, setTrends] = useState<BenchmarkTrend[]>([]);
  const [insights, setInsights] = useState<BenchmarkInsight[]>([]);
  const [goals, setGoals] = useState<BenchmarkGoal[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'comparison' | 'leaderboard' | 'insights' | 'goals' | 'trends'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedBenchmark, setSelectedBenchmark] = useState<'global' | 'friends' | 'level' | 'age' | 'goals'>('global');

  // Mock data - in real app, this would come from analytics service
  useEffect(() => {
    const loadBenchmarkData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock benchmark metrics
      const mockMetrics: BenchmarkMetrics = {
        overall: {
          percentile: 85,
          rank: 1250,
          totalUsers: 10000,
          score: 87,
          improvement: 12,
          trend: 'up'
        },
        categories: {
          accuracy: {
            score: 89,
            percentile: 88,
            rank: 1200,
            average: 82,
            top10: 95
          },
          speed: {
            score: 78,
            percentile: 72,
            rank: 2800,
            average: 75,
            top10: 90
          },
          consistency: {
            score: 85,
            percentile: 82,
            rank: 1800,
            average: 78,
            top10: 92
          },
          retention: {
            score: 92,
            percentile: 95,
            rank: 500,
            average: 80,
            top10: 98
          },
          engagement: {
            score: 88,
            percentile: 90,
            rank: 1000,
            average: 75,
            top10: 95
          }
        },
        comparisons: {
          similarLevel: {
            count: 500,
            averageScore: 82,
            yourScore: 87,
            difference: 5
          },
          similarAge: {
            count: 800,
            averageScore: 85,
            yourScore: 87,
            difference: 2
          },
          similarGoals: {
            count: 300,
            averageScore: 84,
            yourScore: 87,
            difference: 3
          }
        }
      };

      // Mock peers
      const mockPeers: PeerComparison[] = [
        {
          id: 'peer-1',
          name: 'Sakura Tanaka',
          level: 15,
          score: 92,
          accuracy: 95,
          speed: 85,
          consistency: 90,
          retention: 88,
          engagement: 95,
          streak: 25,
          totalTime: 4500,
          charactersLearned: 200,
          achievements: 45,
          rank: 800,
          similarity: 85,
          relationship: 'friend',
          lastActive: '2024-01-14T10:30:00Z',
          progress: 15,
          goals: ['JLPT N3', 'Business Japanese'],
          strengths: ['Accuracy', 'Consistency', 'Engagement'],
          weaknesses: ['Speed', 'Complex Characters']
        },
        {
          id: 'peer-2',
          name: 'Hiroshi Yamada',
          level: 12,
          score: 85,
          accuracy: 88,
          speed: 82,
          consistency: 85,
          retention: 85,
          engagement: 80,
          streak: 18,
          totalTime: 3200,
          charactersLearned: 150,
          achievements: 32,
          rank: 1500,
          similarity: 78,
          relationship: 'study-buddy',
          lastActive: '2024-01-14T09:15:00Z',
          progress: 12,
          goals: ['JLPT N4', 'Travel Japanese'],
          strengths: ['Speed', 'Retention'],
          weaknesses: ['Consistency', 'Engagement']
        }
      ];

      // Mock trends
      const mockTrends: BenchmarkTrend[] = [
        { date: '2024-01-08', yourScore: 82, averageScore: 78, top10Score: 92, percentile: 80, rank: 2000, improvement: 8 },
        { date: '2024-01-09', yourScore: 83, averageScore: 79, top10Score: 93, percentile: 81, rank: 1900, improvement: 9 },
        { date: '2024-01-10', yourScore: 84, averageScore: 79, top10Score: 93, percentile: 82, rank: 1800, improvement: 10 },
        { date: '2024-01-11', yourScore: 85, averageScore: 80, top10Score: 94, percentile: 83, rank: 1700, improvement: 11 },
        { date: '2024-01-12', yourScore: 86, averageScore: 80, top10Score: 94, percentile: 84, rank: 1600, improvement: 12 },
        { date: '2024-01-13', yourScore: 86, averageScore: 81, top10Score: 95, percentile: 84, rank: 1400, improvement: 12 },
        { date: '2024-01-14', yourScore: 87, averageScore: 81, top10Score: 95, percentile: 85, rank: 1250, improvement: 12 }
      ];

      // Mock insights
      const mockInsights: BenchmarkInsight[] = [
        {
          id: 'insight-1',
          type: 'strength',
          title: 'Retention Excellence',
          description: 'Your retention rate is in the top 5% of all users',
          impact: 'high',
          actionable: true,
          actionText: 'Share your retention strategies with others',
          createdAt: '2024-01-14T10:00:00Z'
        },
        {
          id: 'insight-2',
          type: 'opportunity',
          title: 'Speed Improvement Opportunity',
          description: 'Your speed is below average but has high improvement potential',
          impact: 'medium',
          actionable: true,
          actionText: 'Focus on speed training exercises',
          createdAt: '2024-01-14T09:30:00Z'
        }
      ];

      // Mock goals
      const mockGoals: BenchmarkGoal[] = [
        {
          id: 'goal-1',
          title: 'Top 1000 Global Rank',
          description: 'Achieve a global rank in the top 1000 users',
          target: 1000,
          current: 1250,
          unit: 'rank',
          deadline: '2024-02-01',
          progress: 80,
          status: 'on-track',
          category: 'rank',
          benchmark: 'global'
        },
        {
          id: 'goal-2',
          title: '90th Percentile Accuracy',
          description: 'Reach 90th percentile in accuracy category',
          target: 90,
          current: 88,
          unit: 'percentile',
          deadline: '2024-01-31',
          progress: 98,
          status: 'on-track',
          category: 'percentile',
          benchmark: 'global'
        }
      ];

      // Mock leaderboard
      const mockLeaderboard: LeaderboardEntry[] = [
        { id: '1', name: 'You', score: 87, rank: 1250, change: 150, level: 12, streak: 15, achievements: 28, lastActive: '2024-01-14T10:30:00Z', isYou: true },
        { id: '2', name: 'Sakura Tanaka', score: 92, rank: 800, change: -50, level: 15, streak: 25, achievements: 45, lastActive: '2024-01-14T10:30:00Z', isYou: false, relationship: 'friend' },
        { id: '3', name: 'Hiroshi Yamada', score: 85, rank: 1500, change: 100, level: 12, streak: 18, achievements: 32, lastActive: '2024-01-14T09:15:00Z', isYou: false, relationship: 'study-buddy' },
        { id: '4', name: 'Yuki Sato', score: 90, rank: 1000, change: -25, level: 14, streak: 22, achievements: 38, lastActive: '2024-01-14T08:45:00Z', isYou: false },
        { id: '5', name: 'Takeshi Kimura', score: 88, rank: 1200, change: 75, level: 13, streak: 20, achievements: 35, lastActive: '2024-01-14T07:30:00Z', isYou: false }
      ];

      setMetrics(mockMetrics);
      setPeers(mockPeers);
      setTrends(mockTrends);
      setInsights(mockInsights);
      setGoals(mockGoals);
      setLeaderboard(mockLeaderboard);
      setIsLoading(false);
    };

    loadBenchmarkData();
  }, [userId, selectedPeriod, selectedBenchmark]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50';
      case 'down': return 'text-red-600 bg-red-50';
      case 'stable': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return <Trophy className="w-5 h-5 text-green-500" />;
      case 'weakness': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'opportunity': return <Target className="w-5 h-5 text-blue-500" />;
      case 'threat': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'achievement': return <Award className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'strength': return 'border-green-200 bg-green-50';
      case 'weakness': return 'border-red-200 bg-red-50';
      case 'opportunity': return 'border-blue-200 bg-blue-50';
      case 'threat': return 'border-orange-200 bg-orange-50';
      case 'achievement': return 'border-yellow-200 bg-yellow-50';
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

  const getRelationshipIcon = (relationship: string) => {
    switch (relationship) {
      case 'friend': return <UserCheck className="w-4 h-4 text-green-500" />;
      case 'study-buddy': return <Users className="w-4 h-4 text-blue-500" />;
      case 'competitor': return <Target className="w-4 h-4 text-red-500" />;
      case 'mentor': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'mentee': return <UserPlus className="w-4 h-4 text-purple-500" />;
      default: return <UserX className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'text-green-600';
    if (percentile >= 75) return 'text-blue-600';
    if (percentile >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 100) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (rank <= 500) return <Medal className="w-4 h-4 text-gray-500" />;
    if (rank <= 1000) return <Trophy className="w-4 h-4 text-orange-500" />;
    return <Flag className="w-4 h-4 text-blue-500" />;
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading benchmark data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Peer Benchmarking System</h2>
          <p className="body text-gray-600">
            Compare your performance with peers and track your competitive standing
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedBenchmark}
            onChange={(e) => setSelectedBenchmark(e.target.value as any)}
            className="px-4 py-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="global">Global</option>
            <option value="friends">Friends</option>
            <option value="level">Same Level</option>
            <option value="age">Same Age</option>
            <option value="goals">Same Goals</option>
          </select>
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
          { id: 'comparison', label: 'Peer Comparison', icon: Users },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          { id: 'insights', label: 'Insights', icon: Brain },
          { id: 'goals', label: 'Goals', icon: Target },
          { id: 'trends', label: 'Trends', icon: TrendingUp }
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
          {/* Overall Performance */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                {getRankIcon(metrics.overall.rank)}
                <span className="text-xs text-gray-500">Rank</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                #{metrics.overall.rank.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">of {metrics.overall.totalUsers.toLocaleString()}</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <BarChart className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-500">Percentile</span>
              </div>
              <div className={`text-2xl font-bold ${getPercentileColor(metrics.overall.percentile)}`}>
                {metrics.overall.percentile}th
              </div>
              <div className="text-xs text-gray-600">Percentile</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-500">Score</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.overall.score}</div>
              <div className="text-xs text-gray-600">Overall</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                {getTrendIcon(metrics.overall.trend)}
                <span className="text-xs text-gray-500">Improvement</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                +{metrics.overall.improvement}%
              </div>
              <div className="text-xs text-gray-600">This month</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span className="text-xs text-gray-500">Similar Level</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                +{metrics.comparisons.similarLevel.difference}
              </div>
              <div className="text-xs text-gray-600">vs average</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Globe className="w-5 h-5 text-orange-500" />
                <span className="text-xs text-gray-500">Global Avg</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">81</div>
              <div className="text-xs text-gray-600">Score</div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Performance Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(metrics.categories).map(([category, data]) => (
                <div key={category} className="p-4 border-base rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{category}</span>
                    <span className={`text-sm font-bold ${getPercentileColor(data.percentile)}`}>
                      {data.percentile}th
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{data.score}</div>
                  <div className="text-xs text-gray-600 mb-2">Your Score</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Average</span>
                      <span>{data.average}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Top 10%</span>
                      <span>{data.top10}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Rank</span>
                      <span>#{data.rank.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Groups */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Comparison Groups</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(metrics.comparisons).map(([group, data]) => (
                <div key={group} className="p-4 border-base rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">
                      {group.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm text-gray-600">{data.count} users</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{data.yourScore}</div>
                  <div className="text-xs text-gray-600 mb-2">Your Score</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Group Average</span>
                      <span>{data.averageScore}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Difference</span>
                      <span className={data.difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {data.difference >= 0 ? '+' : ''}{data.difference}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Peer Comparison Tab */}
      {selectedView === 'comparison' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Peer Comparisons</h3>
            <div className="space-y-4">
              {peers.map((peer, index) => (
                <motion.div
                  key={peer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-6 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">
                        {peer.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{peer.name}</h4>
                        <p className="text-sm text-gray-600">
                          Level {peer.level} • {peer.relationship}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getRelationshipIcon(peer.relationship)}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{peer.score}</div>
                        <div className="text-sm text-gray-600">Score</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{peer.accuracy}%</div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{peer.speed}%</div>
                      <div className="text-sm text-gray-600">Speed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{peer.consistency}%</div>
                      <div className="text-sm text-gray-600">Consistency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{peer.retention}%</div>
                      <div className="text-sm text-gray-600">Retention</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{peer.engagement}%</div>
                      <div className="text-sm text-gray-600">Engagement</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Strengths</h5>
                      <div className="flex flex-wrap gap-1">
                        {peer.strengths.map((strength) => (
                          <span key={strength} className="px-2 py-1 bg-green-100 text-green-600 rounded text-sm">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Goals</h5>
                      <div className="flex flex-wrap gap-1">
                        {peer.goals.map((goal) => (
                          <span key={goal} className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm">
                            {goal}
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

      {/* Leaderboard Tab */}
      {selectedView === 'leaderboard' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Global Leaderboard</h3>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`p-4 rounded-lg ${
                    entry.isYou ? 'bg-primary/10 border-2 border-primary' : 'bg-gray-50 border-base'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getRankIcon(entry.rank)}
                        <span className="text-lg font-bold text-gray-900">#{entry.rank}</span>
                      </div>
                      <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {entry.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{entry.name}</h4>
                        <p className="text-sm text-gray-600">
                          Level {entry.level} • {entry.streak} day streak
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{entry.score}</div>
                        <div className="text-sm text-gray-600">Score</div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {entry.change > 0 ? (
                          <ArrowUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          entry.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Math.abs(entry.change)}
                        </span>
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
            <h3 className="heading text-lg font-semibold mb-4">Benchmark Insights</h3>
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

      {/* Goals Tab */}
      {selectedView === 'goals' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Benchmark Goals</h3>
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
                      {goal.benchmark} benchmark
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {selectedView === 'trends' && (
        <div className="space-y-6">
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
                  <Line type="monotone" dataKey="yourScore" stroke="#3b82f6" strokeWidth={3} />
                  <Line type="monotone" dataKey="averageScore" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="top10Score" stroke="#ef4444" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
