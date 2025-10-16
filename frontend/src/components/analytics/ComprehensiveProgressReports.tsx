"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, TrendingUp, TrendingDown, Target, Award, Clock, Zap, Eye, Brain, Heart, Star, Calendar, Filter, Download, Share2, Settings, RefreshCw, AlertCircle, CheckCircle, Info, ArrowUp, ArrowDown, Minus, Plus, Activity, BookOpen, Target as TargetIcon, Flame, Trophy, BarChart, PieChart, LineChart, Gauge, Timer, Rocket, Speed, Wrench, Hammer, Shield, Award as AwardIcon, Sun, Moon, Coffee, Bed, MemoryStick, Repeat, RotateCcw, Calendar as CalendarIcon, Crown, Medal, Flag, Globe, UserCheck, UserX, UserPlus, Map, Navigation, Compass, ArrowRight, ArrowLeft, Play, Pause, SkipForward, RotateCcw as RotateCcwIcon, Focus, Layers, GitBranch, GitCommit, GitMerge, GitPullRequest, CrystalBall, Predictions, Future, Timeline, Forecast, FileBarChart, FileSpreadsheet, FileImage, FilePdf, Mail, Printer } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, Heatmap } from 'recharts';

interface ComprehensiveProgressReportsProps {
  userId: string;
  className?: string;
}

interface ProgressReport {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  period: {
    startDate: string;
    endDate: string;
    duration: number;
  };
  summary: {
    overallScore: number;
    improvement: number;
    achievements: number;
    challenges: number;
    timeSpent: number;
    charactersLearned: number;
    sessionsCompleted: number;
  };
  metrics: {
    accuracy: number;
    speed: number;
    consistency: number;
    retention: number;
    engagement: number;
    efficiency: number;
    productivity: number;
    motivation: number;
  };
  trends: {
    performance: 'improving' | 'declining' | 'stable';
    engagement: 'increasing' | 'decreasing' | 'stable';
    efficiency: 'improving' | 'declining' | 'stable';
    retention: 'improving' | 'declining' | 'stable';
  };
  insights: string[];
  recommendations: string[];
  achievements: Achievement[];
  challenges: Challenge[];
  goals: Goal[];
  nextSteps: string[];
  createdAt: string;
  status: 'draft' | 'published' | 'archived';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'milestone' | 'streak' | 'accuracy' | 'speed' | 'consistency' | 'engagement';
  date: string;
  value: number;
  unit: string;
  impact: 'high' | 'medium' | 'low';
  celebration: string;
  shareable: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'difficulty' | 'time' | 'motivation' | 'consistency' | 'retention';
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: number;
  solutions: string[];
  progress: number;
  status: 'active' | 'resolved' | 'ongoing';
}

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  progress: number;
  status: 'on-track' | 'behind' | 'ahead' | 'completed' | 'failed';
  category: 'performance' | 'milestone' | 'habit' | 'skill';
  importance: 'high' | 'medium' | 'low';
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'summary' | 'detailed' | 'executive' | 'custom';
  sections: string[];
  metrics: string[];
  charts: string[];
  format: 'pdf' | 'html' | 'json' | 'csv';
  customizable: boolean;
  default: boolean;
}

interface ReportSchedule {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  template: string;
  recipients: string[];
  format: 'pdf' | 'html' | 'email';
  enabled: boolean;
  lastSent: string;
  nextSend: string;
}

export const ComprehensiveProgressReports: React.FC<ComprehensiveProgressReportsProps> = ({
  userId,
  className = ''
}) => {
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'reports' | 'templates' | 'schedules' | 'create'>('reports');
  const [selectedReport, setSelectedReport] = useState<ProgressReport | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Mock data - in real app, this would come from analytics service
  useEffect(() => {
    const loadReportData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock progress reports
      const mockReports: ProgressReport[] = [
        {
          id: 'report-1',
          title: 'Weekly Progress Report',
          description: 'Comprehensive weekly analysis of your learning progress',
          type: 'weekly',
          period: {
            startDate: '2024-01-08',
            endDate: '2024-01-14',
            duration: 7
          },
          summary: {
            overallScore: 87,
            improvement: 15,
            achievements: 5,
            challenges: 2,
            timeSpent: 420,
            charactersLearned: 12,
            sessionsCompleted: 8
          },
          metrics: {
            accuracy: 89,
            speed: 78,
            consistency: 85,
            retention: 92,
            engagement: 88,
            efficiency: 82,
            productivity: 85,
            motivation: 90
          },
          trends: {
            performance: 'improving',
            engagement: 'increasing',
            efficiency: 'improving',
            retention: 'stable'
          },
          insights: [
            'Your accuracy has improved by 15% this week',
            'You\'re showing excellent retention rates',
            'Morning sessions are most productive'
          ],
          recommendations: [
            'Continue current practice schedule',
            'Focus on speed improvement',
            'Maintain morning study routine'
          ],
          achievements: [
            {
              id: 'ach-1',
              title: 'Accuracy Milestone',
              description: 'Achieved 90% accuracy in character recognition',
              type: 'accuracy',
              date: '2024-01-12',
              value: 90,
              unit: '%',
              impact: 'high',
              celebration: '🎉 Excellent work!',
              shareable: true
            },
            {
              id: 'ach-2',
              title: 'Streak Master',
              description: 'Maintained 15-day learning streak',
              type: 'streak',
              date: '2024-01-14',
              value: 15,
              unit: 'days',
              impact: 'medium',
              celebration: '🔥 Keep it up!',
              shareable: true
            }
          ],
          challenges: [
            {
              id: 'challenge-1',
              title: 'Speed Improvement',
              description: 'Character recognition speed needs improvement',
              type: 'speed',
              severity: 'medium',
              impact: 15,
              solutions: ['Practice with timer', 'Focus on common characters', 'Use speed drills'],
              progress: 60,
              status: 'active'
            }
          ],
          goals: [
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
              category: 'milestone',
              importance: 'high'
            }
          ],
          nextSteps: [
            'Continue current learning path',
            'Focus on speed improvement',
            'Maintain consistent practice schedule'
          ],
          createdAt: '2024-01-14T10:00:00Z',
          status: 'published'
        }
      ];

      // Mock templates
      const mockTemplates: ReportTemplate[] = [
        {
          id: 'template-1',
          name: 'Weekly Summary',
          description: 'Brief weekly progress summary with key metrics',
          type: 'summary',
          sections: ['Overview', 'Key Metrics', 'Achievements', 'Next Steps'],
          metrics: ['accuracy', 'speed', 'consistency', 'retention'],
          charts: ['performance-trend', 'achievement-timeline'],
          format: 'pdf',
          customizable: true,
          default: true
        },
        {
          id: 'template-2',
          name: 'Detailed Analysis',
          description: 'Comprehensive analysis with detailed insights and recommendations',
          type: 'detailed',
          sections: ['Executive Summary', 'Performance Analysis', 'Trends', 'Insights', 'Recommendations', 'Goals', 'Challenges'],
          metrics: ['all'],
          charts: ['all'],
          format: 'pdf',
          customizable: true,
          default: false
        }
      ];

      // Mock schedules
      const mockSchedules: ReportSchedule[] = [
        {
          id: 'schedule-1',
          name: 'Weekly Progress Email',
          description: 'Weekly progress report sent via email',
          frequency: 'weekly',
          template: 'template-1',
          recipients: ['user@example.com'],
          format: 'email',
          enabled: true,
          lastSent: '2024-01-14T10:00:00Z',
          nextSend: '2024-01-21T10:00:00Z'
        }
      ];

      setReports(mockReports);
      setTemplates(mockTemplates);
      setSchedules(mockSchedules);
      setSelectedReport(mockReports[0]);
      setIsLoading(false);
    };

    loadReportData();
  }, [userId, selectedPeriod]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'increasing':
        return 'text-green-600 bg-green-50';
      case 'declining':
      case 'decreasing':
        return 'text-red-600 bg-red-50';
      case 'stable':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
      case 'published':
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'behind':
      case 'draft':
        return 'text-yellow-600 bg-yellow-50';
      case 'ahead':
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      case 'failed':
      case 'archived':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'weekly': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'monthly': return <Calendar className="w-4 h-4 text-green-500" />;
      case 'quarterly': return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'yearly': return <Calendar className="w-4 h-4 text-red-500" />;
      case 'custom': return <Settings className="w-4 h-4 text-gray-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FilePdf className="w-4 h-4 text-red-500" />;
      case 'html': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'json': return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
      case 'csv': return <FileBarChart className="w-4 h-4 text-purple-500" />;
      case 'email': return <Mail className="w-4 h-4 text-orange-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Generating progress reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Comprehensive Progress Reports</h2>
          <p className="body text-gray-600">
            Generate detailed progress reports and analytics summaries
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
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'templates', label: 'Templates', icon: FileBarChart },
          { id: 'schedules', label: 'Schedules', icon: Calendar },
          { id: 'create', label: 'Create Report', icon: Plus }
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

      {/* Reports Tab */}
      {selectedView === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Progress Reports</h3>
            <div className="space-y-4">
              {reports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border-base rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(report.type)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{report.title}</h4>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(report.period.startDate).toLocaleDateString()} - {new Date(report.period.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{report.summary.overallScore}</div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">+{report.summary.improvement}%</div>
                      <div className="text-sm text-gray-600">Improvement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{report.summary.achievements}</div>
                      <div className="text-sm text-gray-600">Achievements</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{Math.round(report.summary.timeSpent / 60)}h</div>
                      <div className="text-sm text-gray-600">Time Spent</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Report Details */}
      {selectedReport && selectedView === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedReport.title}</h3>
                <p className="text-gray-600">{selectedReport.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </button>
                <button className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
            
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{selectedReport.summary.overallScore}</div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">+{selectedReport.summary.improvement}%</div>
                <div className="text-sm text-gray-600">Improvement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{selectedReport.summary.achievements}</div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{selectedReport.summary.challenges}</div>
                <div className="text-sm text-gray-600">Challenges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{Math.round(selectedReport.summary.timeSpent / 60)}h</div>
                <div className="text-sm text-gray-600">Time Spent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{selectedReport.summary.charactersLearned}</div>
                <div className="text-sm text-gray-600">Characters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{selectedReport.summary.sessionsCompleted}</div>
                <div className="text-sm text-gray-600">Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{selectedReport.period.duration}</div>
                <div className="text-sm text-gray-600">Days</div>
              </div>
            </div>
            
            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
              {Object.entries(selectedReport.metrics).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-lg font-bold text-gray-900 mb-1">{value}%</div>
                  <div className="text-sm text-gray-600 capitalize">{key}</div>
                </div>
              ))}
            </div>
            
            {/* Trends */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(selectedReport.trends).map(([key, trend]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium capitalize">{key}</span>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(trend)}
                    <span className={`px-2 py-1 rounded text-xs ${getTrendColor(trend)}`}>
                      {trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Insights */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Key Insights</h4>
              <ul className="space-y-2">
                {selectedReport.insights.map((insight, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Recommendations */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {selectedReport.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Achievements */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Achievements</h4>
              <div className="space-y-3">
                {selectedReport.achievements.map((achievement, index) => (
                  <div key={achievement.id} className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{achievement.title}</h5>
                      <span className={`px-2 py-1 rounded text-xs ${getImpactColor(achievement.impact)}`}>
                        {achievement.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {achievement.value} {achievement.unit} • {new Date(achievement.date).toLocaleDateString()}
                      </span>
                      <span className="text-sm font-medium">{achievement.celebration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Challenges */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Challenges</h4>
              <div className="space-y-3">
                {selectedReport.challenges.map((challenge, index) => (
                  <div key={challenge.id} className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{challenge.title}</h5>
                      <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(challenge.severity)}`}>
                        {challenge.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Impact: {challenge.impact}% • Progress: {challenge.progress}%
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(challenge.status)}`}>
                        {challenge.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Goals */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Goals</h4>
              <div className="space-y-3">
                {selectedReport.goals.map((goal, index) => (
                  <div key={goal.id} className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{goal.title}</h5>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(goal.status)}`}>
                        {goal.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
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
                  </div>
                ))}
              </div>
            </div>
            
            {/* Next Steps */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Next Steps</h4>
              <ul className="space-y-2">
                {selectedReport.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                    <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {selectedView === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Report Templates</h3>
            <div className="space-y-4">
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getFormatIcon(template.format)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {template.default && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                          Default
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {template.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Sections</h5>
                      <div className="flex flex-wrap gap-1">
                        {template.sections.map((section) => (
                          <span key={section} className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm">
                            {section}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Charts</h5>
                      <div className="flex flex-wrap gap-1">
                        {template.charts.map((chart) => (
                          <span key={chart} className="px-2 py-1 bg-green-100 text-green-600 rounded text-sm">
                            {chart}
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

      {/* Schedules Tab */}
      {selectedView === 'schedules' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Report Schedules</h3>
            <div className="space-y-4">
              {schedules.map((schedule, index) => (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getFormatIcon(schedule.format)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{schedule.name}</h4>
                        <p className="text-sm text-gray-600">{schedule.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-sm ${schedule.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                        {schedule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm">
                        {schedule.frequency}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Template</h5>
                      <p className="text-sm text-gray-600">{schedule.template}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Last Sent</h5>
                      <p className="text-sm text-gray-600">
                        {new Date(schedule.lastSent).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Next Send</h5>
                      <p className="text-sm text-gray-600">
                        {new Date(schedule.nextSend).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Report Tab */}
      {selectedView === 'create' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Create New Report</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter report title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select className="w-full px-3 py-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template
                </label>
                <select className="w-full px-3 py-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="template-1">Weekly Summary</option>
                  <option value="template-2">Detailed Analysis</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <select className="w-full px-3 py-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="pdf">PDF</option>
                  <option value="html">HTML</option>
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                  Cancel
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
