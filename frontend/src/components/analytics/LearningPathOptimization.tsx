"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, TrendingUp, TrendingDown, Target, Award, Clock, Zap, Eye, Brain, Heart, Star, Calendar, Filter, Download, Share2, Settings, RefreshCw, AlertCircle, CheckCircle, Info, ArrowUp, ArrowDown, Minus, Plus, Activity, BookOpen, Target as TargetIcon, Flame, Trophy, BarChart, PieChart, LineChart, Gauge, Timer, Rocket, Speed, Wrench, Hammer, Shield, Award as AwardIcon, Sun, Moon, Coffee, Bed, MemoryStick, Repeat, RotateCcw, Calendar as CalendarIcon, Crown, Medal, Flag, Globe, UserCheck, UserX, UserPlus, Map, Navigation, Compass, ArrowRight, ArrowLeft, Play, Pause, SkipForward, RotateCcw as RotateCcwIcon } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, Heatmap } from 'recharts';

interface LearningPathOptimizationProps {
  userId: string;
  className?: string;
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  goal: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedDuration: number;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  efficiency: number;
  effectiveness: number;
  engagement: number;
  retention: number;
  steps: LearningStep[];
  prerequisites: string[];
  outcomes: string[];
  resources: string[];
  milestones: Milestone[];
  alternatives: string[];
  optimizations: Optimization[];
}

interface LearningStep {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'practice' | 'assessment' | 'review' | 'project';
  duration: number;
  difficulty: number;
  prerequisites: string[];
  outcomes: string[];
  resources: string[];
  status: 'not-started' | 'in-progress' | 'completed' | 'skipped';
  progress: number;
  efficiency: number;
  effectiveness: number;
  engagement: number;
  retention: number;
  feedback: string[];
  optimizations: string[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue';
  rewards: string[];
  criteria: string[];
  achievements: string[];
}

interface Optimization {
  id: string;
  title: string;
  description: string;
  type: 'sequence' | 'timing' | 'content' | 'method' | 'resources';
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedImprovement: number;
  implementation: string[];
  risks: string[];
  benefits: string[];
  status: 'suggested' | 'implemented' | 'rejected' | 'testing';
}

interface PathAnalysis {
  overall: {
    efficiency: number;
    effectiveness: number;
    engagement: number;
    retention: number;
    completionRate: number;
    averageTime: number;
    optimalTime: number;
  };
  bottlenecks: {
    step: string;
    issue: string;
    impact: number;
    solution: string;
  }[];
  strengths: {
    area: string;
    performance: number;
    contribution: number;
  }[];
  weaknesses: {
    area: string;
    performance: number;
    impact: number;
    improvement: string;
  }[];
  recommendations: {
    type: 'sequence' | 'timing' | 'content' | 'method';
    title: string;
    description: string;
    impact: number;
    implementation: string[];
  }[];
}

interface PathComparison {
  path: string;
  efficiency: number;
  effectiveness: number;
  engagement: number;
  retention: number;
  completionRate: number;
  averageTime: number;
  userSatisfaction: number;
  difficulty: number;
  prerequisites: string[];
  outcomes: string[];
}

interface PathInsight {
  id: string;
  type: 'efficiency' | 'effectiveness' | 'engagement' | 'retention' | 'bottleneck' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  actionText?: string;
  actionUrl?: string;
  createdAt: string;
  data?: any;
}

export const LearningPathOptimization: React.FC<LearningPathOptimizationProps> = ({
  userId,
  className = ''
}) => {
  const [currentPath, setCurrentPath] = useState<LearningPath | null>(null);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [analysis, setAnalysis] = useState<PathAnalysis | null>(null);
  const [comparisons, setComparisons] = useState<PathComparison[]>([]);
  const [insights, setInsights] = useState<PathInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'path' | 'analysis' | 'comparison' | 'insights' | 'optimization'>('overview');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  // Mock data - in real app, this would come from analytics service
  useEffect(() => {
    const loadPathData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock learning paths
      const mockPaths: LearningPath[] = [
        {
          id: 'path-1',
          name: 'Hiragana Mastery Path',
          description: 'Complete mastery of all hiragana characters with proper stroke order and pronunciation',
          goal: 'Master all 46 basic hiragana characters',
          difficulty: 'beginner',
          estimatedDuration: 30,
          progress: 65,
          status: 'in-progress',
          efficiency: 85,
          effectiveness: 90,
          engagement: 88,
          retention: 92,
          steps: [
            {
              id: 'step-1',
              title: 'Basic Vowels (あいうえお)',
              description: 'Learn the five basic vowel sounds and their hiragana characters',
              type: 'lesson',
              duration: 2,
              difficulty: 1,
              prerequisites: [],
              outcomes: ['Recognize basic vowels', 'Write basic vowels', 'Pronounce basic vowels'],
              resources: ['Video lessons', 'Practice sheets', 'Audio guides'],
              status: 'completed',
              progress: 100,
              efficiency: 95,
              effectiveness: 98,
              engagement: 90,
              retention: 95,
              feedback: ['Excellent progress', 'Good pronunciation'],
              optimizations: ['Add more practice exercises']
            },
            {
              id: 'step-2',
              title: 'K-line Characters (かきくけこ)',
              description: 'Learn the K-line hiragana characters with proper stroke order',
              type: 'practice',
              duration: 3,
              difficulty: 2,
              prerequisites: ['step-1'],
              outcomes: ['Master K-line characters', 'Understand stroke patterns'],
              resources: ['Interactive exercises', 'Stroke order guides'],
              status: 'in-progress',
              progress: 75,
              efficiency: 80,
              effectiveness: 85,
              engagement: 85,
              retention: 88,
              feedback: ['Good progress', 'Need more practice with き'],
              optimizations: ['Focus on difficult characters', 'Add more repetition']
            }
          ],
          prerequisites: ['Basic Japanese interest', 'Time commitment'],
          outcomes: ['Hiragana mastery', 'Reading foundation', 'Writing skills'],
          resources: ['Textbooks', 'Apps', 'Video lessons'],
          milestones: [
            {
              id: 'milestone-1',
              title: 'Vowel Mastery',
              description: 'Complete all basic vowel characters',
              targetDate: '2024-01-15',
              progress: 100,
              status: 'completed',
              rewards: ['Badge', 'XP bonus'],
              criteria: ['95% accuracy', 'Complete all exercises'],
              achievements: ['First milestone', 'Vowel expert']
            }
          ],
          alternatives: ['Katakana first', 'Mixed approach'],
          optimizations: [
            {
              id: 'opt-1',
              title: 'Spaced Repetition Integration',
              description: 'Add spaced repetition to improve retention',
              type: 'method',
              impact: 'high',
              difficulty: 'easy',
              estimatedImprovement: 25,
              implementation: ['Integrate SRS system', 'Adjust review intervals'],
              risks: ['Initial complexity'],
              benefits: ['Better retention', 'Faster learning'],
              status: 'suggested'
            }
          ]
        }
      ];

      // Mock analysis
      const mockAnalysis: PathAnalysis = {
        overall: {
          efficiency: 85,
          effectiveness: 90,
          engagement: 88,
          retention: 92,
          completionRate: 75,
          averageTime: 25,
          optimalTime: 20
        },
        bottlenecks: [
          {
            step: 'K-line Characters',
            issue: 'Complex stroke patterns',
            impact: 15,
            solution: 'Add more practice exercises'
          }
        ],
        strengths: [
          {
            area: 'Retention',
            performance: 92,
            contribution: 25
          },
          {
            area: 'Engagement',
            performance: 88,
            contribution: 20
          }
        ],
        weaknesses: [
          {
            area: 'Speed',
            performance: 75,
            impact: 10,
            improvement: 'Add speed exercises'
          }
        ],
        recommendations: [
          {
            type: 'sequence',
            title: 'Reorder Difficult Characters',
            description: 'Move difficult characters to later in the sequence',
            impact: 15,
            implementation: ['Analyze difficulty', 'Reorder steps', 'Test new sequence']
          }
        ]
      };

      // Mock comparisons
      const mockComparisons: PathComparison[] = [
        {
          path: 'Hiragana Mastery',
          efficiency: 85,
          effectiveness: 90,
          engagement: 88,
          retention: 92,
          completionRate: 75,
          averageTime: 25,
          userSatisfaction: 4.5,
          difficulty: 2,
          prerequisites: ['Basic interest'],
          outcomes: ['Reading', 'Writing']
        },
        {
          path: 'Katakana Mastery',
          efficiency: 80,
          effectiveness: 85,
          engagement: 82,
          retention: 88,
          completionRate: 70,
          averageTime: 28,
          userSatisfaction: 4.2,
          difficulty: 3,
          prerequisites: ['Hiragana knowledge'],
          outcomes: ['Reading', 'Writing']
        }
      ];

      // Mock insights
      const mockInsights: PathInsight[] = [
        {
          id: 'insight-1',
          type: 'efficiency',
          title: 'Path Efficiency Improvement',
          description: 'Your current path is 15% more efficient than the average',
          impact: 'high',
          actionable: true,
          actionText: 'Continue current approach',
          createdAt: '2024-01-14T10:00:00Z'
        },
        {
          id: 'insight-2',
          type: 'bottleneck',
          title: 'Bottleneck Identified',
          description: 'K-line characters are slowing down your progress',
          impact: 'medium',
          actionable: true,
          actionText: 'Focus on K-line practice',
          createdAt: '2024-01-14T09:30:00Z'
        }
      ];

      setPaths(mockPaths);
      setCurrentPath(mockPaths[0]);
      setAnalysis(mockAnalysis);
      setComparisons(mockComparisons);
      setInsights(mockInsights);
      setIsLoading(false);
    };

    loadPathData();
  }, [userId]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-orange-600 bg-orange-50';
      case 'expert': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started': return 'text-gray-600 bg-gray-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'practice': return <Target className="w-4 h-4 text-green-500" />;
      case 'assessment': return <CheckCircle className="w-4 h-4 text-purple-500" />;
      case 'review': return <Repeat className="w-4 h-4 text-orange-500" />;
      case 'project': return <Rocket className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'efficiency': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'effectiveness': return <Target className="w-5 h-5 text-green-500" />;
      case 'engagement': return <Heart className="w-5 h-5 text-red-500" />;
      case 'retention': return <Brain className="w-5 h-5 text-purple-500" />;
      case 'bottleneck': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'opportunity': return <Lightbulb className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'efficiency': return 'border-yellow-200 bg-yellow-50';
      case 'effectiveness': return 'border-green-200 bg-green-50';
      case 'engagement': return 'border-red-200 bg-red-50';
      case 'retention': return 'border-purple-200 bg-purple-50';
      case 'bottleneck': return 'border-orange-200 bg-orange-50';
      case 'opportunity': return 'border-blue-200 bg-blue-50';
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

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Analyzing learning paths...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Learning Path Optimization</h2>
          <p className="body text-gray-600">
            Optimize your learning journey with AI-powered path analysis and recommendations
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
          { id: 'path', label: 'Current Path', icon: Route },
          { id: 'analysis', label: 'Analysis', icon: Gauge },
          { id: 'comparison', label: 'Comparison', icon: BarChart },
          { id: 'insights', label: 'Insights', icon: Brain },
          { id: 'optimization', label: 'Optimization', icon: Settings }
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
      {selectedView === 'overview' && currentPath && (
        <div className="space-y-6">
          {/* Current Path Overview */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{currentPath.name}</h3>
                <p className="text-gray-600">{currentPath.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentPath.difficulty)}`}>
                  {currentPath.difficulty}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentPath.status)}`}>
                  {currentPath.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{currentPath.progress}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{currentPath.efficiency}%</div>
                <div className="text-sm text-gray-600">Efficiency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{currentPath.effectiveness}%</div>
                <div className="text-sm text-gray-600">Effectiveness</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{currentPath.estimatedDuration}</div>
                <div className="text-sm text-gray-600">Days</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${currentPath.progress}%` }}
              />
            </div>
          </div>

          {/* Path Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-xs text-gray-500">Efficiency</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{currentPath.efficiency}%</div>
              <div className="text-xs text-gray-600">Learning efficiency</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-500">Effectiveness</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{currentPath.effectiveness}%</div>
              <div className="text-xs text-gray-600">Learning effectiveness</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-xs text-gray-500">Engagement</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{currentPath.engagement}%</div>
              <div className="text-xs text-gray-600">User engagement</div>
            </div>
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <span className="text-xs text-gray-500">Retention</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{currentPath.retention}%</div>
              <div className="text-xs text-gray-600">Knowledge retention</div>
            </div>
          </div>
        </div>
      )}

      {/* Current Path Tab */}
      {selectedView === 'path' && currentPath && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Learning Steps</h3>
            <div className="space-y-4">
              {currentPath.steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStepTypeIcon(step.type)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(step.status)}`}>
                        {step.status}
                      </span>
                      <span className="text-sm text-gray-600">{step.duration}h</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{step.progress}%</div>
                      <div className="text-sm text-gray-600">Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{step.efficiency}%</div>
                      <div className="text-sm text-gray-600">Efficiency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{step.effectiveness}%</div>
                      <div className="text-sm text-gray-600">Effectiveness</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{step.retention}%</div>
                      <div className="text-sm text-gray-600">Retention</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Outcomes</h5>
                      <ul className="space-y-1">
                        {step.outcomes.map((outcome, i) => (
                          <li key={i} className="text-sm text-gray-600">• {outcome}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Resources</h5>
                      <ul className="space-y-1">
                        {step.resources.map((resource, i) => (
                          <li key={i} className="text-sm text-gray-600">• {resource}</li>
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

      {/* Analysis Tab */}
      {selectedView === 'analysis' && analysis && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Path Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{analysis.overall.efficiency}%</div>
                <div className="text-sm text-gray-600">Efficiency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{analysis.overall.effectiveness}%</div>
                <div className="text-sm text-gray-600">Effectiveness</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{analysis.overall.engagement}%</div>
                <div className="text-sm text-gray-600">Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{analysis.overall.retention}%</div>
                <div className="text-sm text-gray-600">Retention</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Strengths</h4>
                <div className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm text-gray-700">{strength.area}</span>
                      <span className="text-sm font-medium text-green-600">{strength.performance}%</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Weaknesses</h4>
                <div className="space-y-2">
                  {analysis.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <span className="text-sm text-gray-700">{weakness.area}</span>
                      <span className="text-sm font-medium text-red-600">{weakness.performance}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {selectedView === 'insights' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Path Insights</h3>
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

      {/* Optimization Tab */}
      {selectedView === 'optimization' && currentPath && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="heading text-lg font-semibold mb-4">Optimization Suggestions</h3>
            <div className="space-y-4">
              {currentPath.optimizations.map((optimization, index) => (
                <motion.div
                  key={optimization.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{optimization.title}</h4>
                      <p className="text-sm text-gray-600">{optimization.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-sm ${getImpactColor(optimization.impact)}`}>
                        {optimization.impact}
                      </span>
                      <span className="text-sm text-gray-600">+{optimization.estimatedImprovement}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Implementation</h5>
                      <ul className="space-y-1">
                        {optimization.implementation.map((step, i) => (
                          <li key={i} className="text-sm text-gray-600">• {step}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Benefits</h5>
                      <ul className="space-y-1">
                        {optimization.benefits.map((benefit, i) => (
                          <li key={i} className="text-sm text-gray-600">• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(optimization.status)}`}>
                      {optimization.status}
                    </span>
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
    </div>
  );
};
