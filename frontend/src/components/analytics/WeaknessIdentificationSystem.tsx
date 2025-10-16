"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Target, TrendingDown, TrendingUp, Brain, Lightbulb, CheckCircle, XCircle, Clock, Zap, Eye, Heart, Star, Calendar, Filter, Download, Share2, Settings, RefreshCw, AlertCircle, Info, ArrowUp, ArrowDown, Minus, Plus, Activity, Users, BookOpen, Target as TargetIcon, Flame, Trophy, BarChart, PieChart, LineChart, Gauge, Timer, Rocket, Speed, Wrench, Hammer, Shield, Award } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter } from 'recharts';

interface WeaknessIdentificationSystemProps {
  userId: string;
  className?: string;
}

interface WeaknessArea {
  id: string;
  category: 'accuracy' | 'speed' | 'consistency' | 'retention' | 'technique' | 'motivation';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: number;
  frequency: number;
  trend: 'improving' | 'declining' | 'stable';
  characters: string[];
  patterns: string[];
  rootCauses: string[];
  symptoms: string[];
  lastDetected: string;
  duration: number;
}

interface WeaknessAnalysis {
  overall: {
    totalWeaknesses: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    improvementRate: number;
    recoveryTime: number;
  };
  categories: {
    [key: string]: {
      count: number;
      severity: 'critical' | 'high' | 'medium' | 'low';
      trend: 'improving' | 'declining' | 'stable';
      impact: number;
    };
  };
  trends: {
    newWeaknesses: number;
    resolvedWeaknesses: number;
    recurringWeaknesses: number;
    improvementRate: number;
  };
}

interface ImprovementSuggestion {
  id: string;
  weaknessId: string;
  title: string;
  description: string;
  category: 'practice' | 'technique' | 'timing' | 'approach' | 'resources';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  expectedImprovement: number;
  steps: string[];
  resources: string[];
  practiceExercises: string[];
  trackingMetrics: string[];
  successCriteria: string[];
}

interface WeaknessPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  triggers: string[];
  contexts: string[];
  characters: string[];
  timeOfDay: string[];
  sessionLength: number;
  fatigueLevel: number;
  emotionalState: string[];
  environmentalFactors: string[];
}

interface RecoveryPlan {
  id: string;
  weaknessId: string;
  title: string;
  description: string;
  duration: number;
  phases: Array<{
    name: string;
    duration: number;
    goals: string[];
    activities: string[];
    metrics: string[];
    milestones: string[];
  }>;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  startDate: string;
  endDate?: string;
  achievements: string[];
  challenges: string[];
}

export const WeaknessIdentificationSystem: React.FC<WeaknessIdentificationSystemProps> = ({
  userId,
  className = ''
}) => {
  const [weaknesses, setWeaknesses] = useState<WeaknessArea[]>([]);
  const [analysis, setAnalysis] = useState<WeaknessAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<ImprovementSuggestion[]>([]);
  const [patterns, setPatterns] = useState<WeaknessPattern[]>([]);
  const [recoveryPlans, setRecoveryPlans] = useState<RecoveryPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'weaknesses' | 'suggestions' | 'patterns' | 'recovery' | 'analysis'>('overview');
  const [selectedWeakness, setSelectedWeakness] = useState<WeaknessArea | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Mock data - in real app, this would come from analytics service
  useEffect(() => {
    const loadWeaknessData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock weaknesses
      const mockWeaknesses: WeaknessArea[] = [
        {
          id: 'weakness-1',
          category: 'accuracy',
          title: 'Stroke Order Confusion',
          description: 'Frequent mistakes in stroke order for complex characters',
          severity: 'high',
          impact: 75,
          frequency: 8,
          trend: 'declining',
          characters: ['新', '書', '道', '美'],
          patterns: ['Rushing through strokes', 'Not following guidelines'],
          rootCauses: ['Lack of muscle memory', 'Insufficient practice', 'Poor visualization'],
          symptoms: ['Inconsistent character shapes', 'Slower writing speed', 'Frustration'],
          lastDetected: '2024-01-14T10:30:00Z',
          duration: 14
        },
        {
          id: 'weakness-2',
          category: 'speed',
          title: 'Slow Character Recognition',
          description: 'Takes too long to recognize and recall characters',
          severity: 'medium',
          impact: 60,
          frequency: 6,
          trend: 'stable',
          characters: ['り', 'つ', 'ふ', 'わ'],
          patterns: ['Hesitation before writing', 'Multiple attempts'],
          rootCauses: ['Insufficient repetition', 'Poor association techniques'],
          symptoms: ['Long pauses', 'Reduced confidence', 'Time pressure'],
          lastDetected: '2024-01-13T15:20:00Z',
          duration: 21
        },
        {
          id: 'weakness-3',
          category: 'consistency',
          title: 'Inconsistent Character Size',
          description: 'Characters vary significantly in size and proportions',
          severity: 'medium',
          impact: 55,
          frequency: 5,
          trend: 'improving',
          characters: ['あ', 'い', 'う', 'え', 'お'],
          patterns: ['Larger characters when rushed', 'Smaller characters when careful'],
          rootCauses: ['Lack of spatial awareness', 'Inconsistent practice'],
          symptoms: ['Uneven appearance', 'Difficulty reading own writing'],
          lastDetected: '2024-01-12T09:15:00Z',
          duration: 7
        }
      ];

      // Mock analysis
      const mockAnalysis: WeaknessAnalysis = {
        overall: {
          totalWeaknesses: 3,
          criticalCount: 0,
          highCount: 1,
          mediumCount: 2,
          lowCount: 0,
          improvementRate: 25,
          recoveryTime: 14
        },
        categories: {
          accuracy: { count: 1, severity: 'high', trend: 'declining', impact: 75 },
          speed: { count: 1, severity: 'medium', trend: 'stable', impact: 60 },
          consistency: { count: 1, severity: 'medium', trend: 'improving', impact: 55 }
        },
        trends: {
          newWeaknesses: 1,
          resolvedWeaknesses: 2,
          recurringWeaknesses: 1,
          improvementRate: 25
        }
      };

      // Mock suggestions
      const mockSuggestions: ImprovementSuggestion[] = [
        {
          id: 'suggestion-1',
          weaknessId: 'weakness-1',
          title: 'Stroke Order Practice Routine',
          description: 'Dedicated practice sessions focusing on stroke order for complex characters',
          category: 'practice',
          priority: 'high',
          difficulty: 'medium',
          estimatedTime: 30,
          expectedImprovement: 40,
          steps: [
            'Practice stroke order slowly with visual guides',
            'Use tracing exercises for muscle memory',
            'Gradually increase speed while maintaining accuracy',
            'Regular review sessions'
          ],
          resources: ['Stroke order animations', 'Practice worksheets', 'Video tutorials'],
          practiceExercises: ['Tracing exercises', 'Stroke order drills', 'Character building'],
          trackingMetrics: ['Accuracy rate', 'Completion time', 'Error frequency'],
          successCriteria: ['95% accuracy in stroke order', 'Consistent character shapes', 'Reduced hesitation']
        },
        {
          id: 'suggestion-2',
          weaknessId: 'weakness-2',
          title: 'Character Recognition Speed Training',
          description: 'Flashcard-based training to improve character recognition speed',
          category: 'technique',
          priority: 'medium',
          difficulty: 'easy',
          estimatedTime: 20,
          expectedImprovement: 30,
          steps: [
            'Use spaced repetition flashcards',
            'Practice with timer for speed',
            'Focus on problem characters',
            'Regular speed tests'
          ],
          resources: ['Digital flashcards', 'Speed training apps', 'Character recognition games'],
          practiceExercises: ['Flashcard drills', 'Speed recognition tests', 'Character matching'],
          trackingMetrics: ['Recognition speed', 'Accuracy rate', 'Response time'],
          successCriteria: ['Under 2 seconds per character', '95% accuracy', 'Consistent performance']
        }
      ];

      // Mock patterns
      const mockPatterns: WeaknessPattern[] = [
        {
          id: 'pattern-1',
          name: 'Afternoon Accuracy Drop',
          description: 'Accuracy decreases significantly in afternoon sessions',
          frequency: 8,
          triggers: ['Fatigue', 'Time pressure', 'Long sessions'],
          contexts: ['After 2 PM', 'After lunch', 'Long practice sessions'],
          characters: ['Complex kanji', 'Characters with many strokes'],
          timeOfDay: ['14:00-16:00'],
          sessionLength: 45,
          fatigueLevel: 7,
          emotionalState: ['Tired', 'Rushed', 'Frustrated'],
          environmentalFactors: ['Noise', 'Distractions', 'Poor lighting']
        }
      ];

      // Mock recovery plans
      const mockRecoveryPlans: RecoveryPlan[] = [
        {
          id: 'plan-1',
          weaknessId: 'weakness-1',
          title: 'Stroke Order Mastery Plan',
          description: 'Comprehensive plan to master stroke order for complex characters',
          duration: 21,
          phases: [
            {
              name: 'Foundation',
              duration: 7,
              goals: ['Learn basic stroke order rules', 'Practice simple characters'],
              activities: ['Daily stroke order practice', 'Video tutorials', 'Tracing exercises'],
              metrics: ['Accuracy rate', 'Completion time'],
              milestones: ['Master 10 basic characters', 'Achieve 80% accuracy']
            },
            {
              name: 'Application',
              duration: 7,
              goals: ['Apply rules to complex characters', 'Increase speed'],
              activities: ['Complex character practice', 'Speed drills', 'Error analysis'],
              metrics: ['Speed improvement', 'Error reduction'],
              milestones: ['Master 20 complex characters', 'Achieve 90% accuracy']
            },
            {
              name: 'Mastery',
              duration: 7,
              goals: ['Achieve consistent performance', 'Maintain accuracy under pressure'],
              activities: ['Timed practice', 'Pressure simulations', 'Review sessions'],
              metrics: ['Consistency score', 'Pressure performance'],
              milestones: ['Achieve 95% accuracy', 'Maintain performance under pressure']
            }
          ],
          progress: 45,
          status: 'in-progress',
          startDate: '2024-01-01',
          achievements: ['Completed foundation phase', 'Improved accuracy by 20%'],
          challenges: ['Time management', 'Maintaining motivation']
        }
      ];

      setWeaknesses(mockWeaknesses);
      setAnalysis(mockAnalysis);
      setSuggestions(mockSuggestions);
      setPatterns(mockPatterns);
      setRecoveryPlans(mockRecoveryPlans);
      setIsLoading(false);
    };

    loadWeaknessData();
  }, [userId]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'high': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'medium': return <Info className="w-5 h-5 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
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
      case 'accuracy': return <Target className="w-5 h-5 text-blue-500" />;
      case 'speed': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'consistency': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'retention': return <Brain className="w-5 h-5 text-purple-500" />;
      case 'technique': return <Wrench className="w-5 h-5 text-indigo-500" />;
      case 'motivation': return <Heart className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started': return 'text-gray-600 bg-gray-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Analyzing weaknesses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Weakness Identification System</h2>
          <p className="body text-gray-600">
            AI-powered analysis to identify learning weaknesses and provide targeted improvement suggestions
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
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
          { id: 'weaknesses', label: 'Weaknesses', icon: AlertTriangle },
          { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
          { id: 'patterns', label: 'Patterns', icon: Brain },
          { id: 'recovery', label: 'Recovery Plans', icon: Shield },
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
      {selectedView === 'overview' && analysis && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{analysis.overall.totalWeaknesses}</div>
              <div className="text-xs text-gray-600">Weaknesses</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span className="text-xs text-gray-500">High</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{analysis.overall.highCount}</div>
              <div className="text-xs text-gray-600">Severity</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Info className="w-5 h-5 text-yellow-500" />
                <span className="text-xs text-gray-500">Medium</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{analysis.overall.mediumCount}</div>
              <div className="text-xs text-gray-600">Severity</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-500">Improvement</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">+{analysis.overall.improvementRate}%</div>
              <div className="text-xs text-gray-600">Rate</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-500">Recovery</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{analysis.overall.recoveryTime}</div>
              <div className="text-xs text-gray-600">Days</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-500">Resolved</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{analysis.trends.resolvedWeaknesses}</div>
              <div className="text-xs text-gray-600">This month</div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Weakness Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analysis.categories).map(([category, data]) => (
                <div key={category} className="p-4 border-base rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    {getCategoryIcon(category)}
                    <span className="text-sm font-medium capitalize">{category}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{data.count}</div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(data.severity)}`}>
                      {data.severity}
                    </span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(data.trend)}
                      <span className="text-xs text-gray-600">{data.impact}% impact</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Weaknesses */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Recent Weaknesses</h3>
            <div className="space-y-3">
              {weaknesses.slice(0, 3).map((weakness, index) => (
                <motion.div
                  key={weakness.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border-base rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedWeakness(weakness);
                    setShowDetails(true);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getSeverityIcon(weakness.severity)}
                      <h4 className="font-semibold text-gray-900">{weakness.title}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(weakness.severity)}`}>
                        {weakness.severity}
                      </span>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(weakness.trend)}
                        <span className="text-xs text-gray-600">{weakness.impact}% impact</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{weakness.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Characters: {weakness.characters.slice(0, 3).join(', ')}</span>
                    <span>Duration: {weakness.duration} days</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Weaknesses Tab */}
      {selectedView === 'weaknesses' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Identified Weaknesses</h3>
            <div className="space-y-4">
              {weaknesses.map((weakness, index) => (
                <motion.div
                  key={weakness.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-6 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getSeverityIcon(weakness.severity)}
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{weakness.title}</h4>
                        <p className="text-gray-600">{weakness.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(weakness.severity)}`}>
                        {weakness.severity}
                      </span>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(weakness.trend)}
                        <span className="text-sm text-gray-600">{weakness.impact}% impact</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Affected Characters</h5>
                      <div className="flex flex-wrap gap-1">
                        {weakness.characters.map((char) => (
                          <span key={char} className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm">
                            {char}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Patterns</h5>
                      <ul className="space-y-1">
                        {weakness.patterns.map((pattern, i) => (
                          <li key={i} className="text-sm text-gray-600">• {pattern}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Root Causes</h5>
                      <ul className="space-y-1">
                        {weakness.rootCauses.map((cause, i) => (
                          <li key={i} className="text-sm text-gray-600">• {cause}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Symptoms</h5>
                      <ul className="space-y-1">
                        {weakness.symptoms.map((symptom, i) => (
                          <li key={i} className="text-sm text-gray-600">• {symptom}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Frequency: {weakness.frequency} times</span>
                    <span>Last detected: {new Date(weakness.lastDetected).toLocaleDateString()}</span>
                    <span>Duration: {weakness.duration} days</span>
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
            <h3 className="heading text-lg font-semibold mb-4">Improvement Suggestions</h3>
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
                      <Lightbulb className="w-6 h-6 text-yellow-500" />
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{suggestion.title}</h4>
                        <p className="text-gray-600">{suggestion.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority}
                      </span>
                      <span className="text-sm text-gray-600">{suggestion.estimatedTime} min</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Steps</h5>
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
                      <h5 className="font-medium text-gray-900 mb-2">Resources</h5>
                      <ul className="space-y-1">
                        {suggestion.resources.map((resource, i) => (
                          <li key={i} className="text-sm text-gray-600">• {resource}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Practice Exercises</h5>
                      <ul className="space-y-1">
                        {suggestion.practiceExercises.map((exercise, i) => (
                          <li key={i} className="text-sm text-gray-600">• {exercise}</li>
                        ))}
                      </ul>
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
                      Expected improvement: +{suggestion.expectedImprovement}%
                    </div>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                      Start Practice
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recovery Plans Tab */}
      {selectedView === 'recovery' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Recovery Plans</h3>
            <div className="space-y-6">
              {recoveryPlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-6 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-6 h-6 text-blue-500" />
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{plan.title}</h4>
                        <p className="text-gray-600">{plan.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(plan.status)}`}>
                        {plan.status}
                      </span>
                      <span className="text-sm text-gray-600">{plan.duration} days</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium">{plan.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${plan.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Phases */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {plan.phases.map((phase, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">{phase.name}</h5>
                        <div className="text-sm text-gray-600 mb-2">{phase.duration} days</div>
                        <div className="space-y-1">
                          {phase.goals.slice(0, 2).map((goal, j) => (
                            <div key={j} className="text-sm text-gray-600">• {goal}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Started: {new Date(plan.startDate).toLocaleDateString()}
                    </div>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                      View Details
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
