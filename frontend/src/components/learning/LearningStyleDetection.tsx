"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Eye, Ear, Hand, Target, TrendingUp, BarChart3, Lightbulb, CheckCircle, XCircle, RefreshCw, Settings, Play, Pause, SkipForward } from 'lucide-react';

interface LearningStyleDetectionProps {
  userId: string;
  className?: string;
}

interface LearningStyle {
  primary: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  secondary: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  scores: {
    visual: number;
    auditory: number;
    kinesthetic: number;
    reading: number;
  };
  confidence: number;
  lastUpdated: string;
  assessmentCount: number;
}

interface LearningStyleAssessment {
  id: string;
  question: string;
  type: 'preference' | 'behavior' | 'performance';
  options: Array<{
    id: string;
    text: string;
    style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    weight: number;
  }>;
  category: 'learning' | 'practice' | 'review' | 'feedback';
}

interface LearningBehavior {
  id: string;
  behavior: string;
  style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  frequency: number;
  impact: number;
  lastObserved: string;
  confidence: number;
}

interface LearningStyleInsight {
  id: string;
  type: 'strength' | 'weakness' | 'recommendation' | 'pattern';
  title: string;
  description: string;
  style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  actionUrl?: string;
  createdAt: string;
}

interface LearningStyleRecommendation {
  id: string;
  title: string;
  description: string;
  style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  priority: 'high' | 'medium' | 'low';
  estimatedImprovement: number;
  implementation: string[];
  resources: string[];
}

export const LearningStyleDetection: React.FC<LearningStyleDetectionProps> = ({
  userId,
  className = ''
}) => {
  const [learningStyle, setLearningStyle] = useState<LearningStyle | null>(null);
  const [currentAssessment, setCurrentAssessment] = useState<LearningStyleAssessment | null>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<LearningStyleAssessment[]>([]);
  const [behaviors, setBehaviors] = useState<LearningBehavior[]>([]);
  const [insights, setInsights] = useState<LearningStyleInsight[]>([]);
  const [recommendations, setRecommendations] = useState<LearningStyleRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTakingAssessment, setIsTakingAssessment] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showInsights, setShowInsights] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Mock data - in real app, this would come from learning analytics service
  useEffect(() => {
    const loadLearningStyleData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock learning style
      const mockLearningStyle: LearningStyle = {
        primary: 'visual',
        secondary: 'kinesthetic',
        scores: {
          visual: 85,
          auditory: 45,
          kinesthetic: 70,
          reading: 60
        },
        confidence: 92,
        lastUpdated: '2024-01-21T19:30:00Z',
        assessmentCount: 3
      };

      // Mock assessment questions
      const mockAssessment: LearningStyleAssessment[] = [
        {
          id: 'q1',
          question: 'When learning a new character, what helps you remember it best?',
          type: 'preference',
          options: [
            { id: 'a1', text: 'Seeing the stroke order animation', style: 'visual', weight: 3 },
            { id: 'a2', text: 'Hearing the pronunciation', style: 'auditory', weight: 3 },
            { id: 'a3', text: 'Writing it multiple times', style: 'kinesthetic', weight: 3 },
            { id: 'a4', text: 'Reading about its meaning and usage', style: 'reading', weight: 3 }
          ],
          category: 'learning'
        },
        {
          id: 'q2',
          question: 'How do you prefer to practice characters?',
          type: 'behavior',
          options: [
            { id: 'a1', text: 'Watching stroke order videos', style: 'visual', weight: 2 },
            { id: 'a2', text: 'Listening to audio while writing', style: 'auditory', weight: 2 },
            { id: 'a3', text: 'Physical writing practice', style: 'kinesthetic', weight: 2 },
            { id: 'a4', text: 'Reading character explanations', style: 'reading', weight: 2 }
          ],
          category: 'practice'
        },
        {
          id: 'q3',
          question: 'What type of feedback is most helpful for you?',
          type: 'preference',
          options: [
            { id: 'a1', text: 'Visual comparison with correct form', style: 'visual', weight: 2 },
            { id: 'a2', text: 'Audio pronunciation correction', style: 'auditory', weight: 2 },
            { id: 'a3', text: 'Hand-over-hand guidance', style: 'kinesthetic', weight: 2 },
            { id: 'a4', text: 'Written explanations and tips', style: 'reading', weight: 2 }
          ],
          category: 'feedback'
        }
      ];

      // Mock behaviors
      const mockBehaviors: LearningBehavior[] = [
        {
          id: 'b1',
          behavior: 'Frequently pauses to observe stroke animations',
          style: 'visual',
          frequency: 85,
          impact: 8.5,
          lastObserved: '2024-01-21T19:30:00Z',
          confidence: 90
        },
        {
          id: 'b2',
          behavior: 'Spends extra time on visual character comparisons',
          style: 'visual',
          frequency: 78,
          impact: 7.2,
          lastObserved: '2024-01-21T18:45:00Z',
          confidence: 85
        },
        {
          id: 'b3',
          behavior: 'Prefers writing practice over other methods',
          style: 'kinesthetic',
          frequency: 65,
          impact: 6.8,
          lastObserved: '2024-01-21T17:20:00Z',
          confidence: 80
        }
      ];

      // Mock insights
      const mockInsights: LearningStyleInsight[] = [
        {
          id: 'i1',
          type: 'strength',
          title: 'Strong Visual Learning Preference',
          description: 'You show a strong preference for visual learning methods, with 85% of your successful learning sessions involving visual elements.',
          style: 'visual',
          impact: 'high',
          actionable: true,
          actionUrl: '/learn/visual-methods',
          createdAt: '2024-01-21T19:00:00Z'
        },
        {
          id: 'i2',
          type: 'recommendation',
          title: 'Enhance Kinesthetic Learning',
          description: 'Your secondary learning style is kinesthetic. Try incorporating more physical writing practice to improve retention.',
          style: 'kinesthetic',
          impact: 'medium',
          actionable: true,
          actionUrl: '/learn/writing-practice',
          createdAt: '2024-01-21T18:30:00Z'
        },
        {
          id: 'i3',
          type: 'pattern',
          title: 'Learning Pattern Detected',
          description: 'You perform best when combining visual and kinesthetic methods. This hybrid approach increases your success rate by 23%.',
          style: 'visual',
          impact: 'high',
          actionable: true,
          actionUrl: '/learn/hybrid-methods',
          createdAt: '2024-01-21T17:45:00Z'
        }
      ];

      // Mock recommendations
      const mockRecommendations: LearningStyleRecommendation[] = [
        {
          id: 'r1',
          title: 'Use Visual Mnemonics',
          description: 'Create visual associations for characters to improve memory retention.',
          style: 'visual',
          priority: 'high',
          estimatedImprovement: 25,
          implementation: [
            'Use stroke order animations',
            'Create visual character stories',
            'Use color coding for different character types'
          ],
          resources: [
            'Visual mnemonic guide',
            'Stroke order videos',
            'Character comparison tools'
          ]
        },
        {
          id: 'r2',
          title: 'Increase Writing Practice',
          description: 'Incorporate more physical writing practice to strengthen kinesthetic learning.',
          style: 'kinesthetic',
          priority: 'medium',
          estimatedImprovement: 15,
          implementation: [
            'Practice writing each character 10 times',
            'Use different writing tools (pen, brush, digital)',
            'Focus on muscle memory development'
          ],
          resources: [
            'Writing practice sheets',
            'Calligraphy tutorials',
            'Digital writing tools'
          ]
        }
      ];

      setLearningStyle(mockLearningStyle);
      setAssessmentHistory(mockAssessment);
      setBehaviors(mockBehaviors);
      setInsights(mockInsights);
      setRecommendations(mockRecommendations);
      setIsLoading(false);
    };

    loadLearningStyleData();
  }, [userId]);

  const handleStartAssessment = () => {
    setIsTakingAssessment(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setCurrentAssessment(assessmentHistory[0]);
  };

  const handleAnswerQuestion = (questionId: string, answerId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerId }));
    
    if (currentQuestionIndex < assessmentHistory.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAssessment(assessmentHistory[currentQuestionIndex + 1]);
    } else {
      // Assessment complete
      setIsTakingAssessment(false);
      setCurrentAssessment(null);
      calculateLearningStyle();
    }
  };

  const calculateLearningStyle = () => {
    const styleScores = { visual: 0, auditory: 0, kinesthetic: 0, reading: 0 };
    
    Object.entries(answers).forEach(([questionId, answerId]) => {
      const question = assessmentHistory.find(q => q.id === questionId);
      const answer = question?.options.find(o => o.id === answerId);
      if (answer) {
        styleScores[answer.style] += answer.weight;
      }
    });

    const totalScore = Object.values(styleScores).reduce((sum, score) => sum + score, 0);
    const normalizedScores = Object.fromEntries(
      Object.entries(styleScores).map(([style, score]) => [style, (score / totalScore) * 100])
    ) as Record<keyof typeof styleScores, number>;

    const primaryStyle = Object.entries(normalizedScores).reduce((a, b) => 
      normalizedScores[a[0] as keyof typeof styleScores] > normalizedScores[b[0] as keyof typeof styleScores] ? a : b
    )[0] as keyof typeof styleScores;

    const secondaryStyle = Object.entries(normalizedScores)
      .filter(([style]) => style !== primaryStyle)
      .reduce((a, b) => 
        normalizedScores[a[0] as keyof typeof styleScores] > normalizedScores[b[0] as keyof typeof styleScores] ? a : b
      )[0] as keyof typeof styleScores;

    const newLearningStyle: LearningStyle = {
      primary: primaryStyle,
      secondary: secondaryStyle,
      scores: normalizedScores,
      confidence: 85,
      lastUpdated: new Date().toISOString(),
      assessmentCount: (learningStyle?.assessmentCount || 0) + 1
    };

    setLearningStyle(newLearningStyle);
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case 'visual': return 'text-blue-600 bg-blue-50';
      case 'auditory': return 'text-green-600 bg-green-50';
      case 'kinesthetic': return 'text-purple-600 bg-purple-50';
      case 'reading': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStyleIcon = (style: string) => {
    switch (style) {
      case 'visual': return <Eye className="w-5 h-5" />;
      case 'auditory': return <Ear className="w-5 h-5" />;
      case 'kinesthetic': return <Hand className="w-5 h-5" />;
      case 'reading': return <Brain className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'weakness': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'recommendation': return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'pattern': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      default: return <Brain className="w-5 h-5 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Analyzing your learning style...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Learning Style Detection</h2>
          <p className="body text-gray-600">
            Discover your optimal learning style for personalized character learning
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showRecommendations
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowInsights(!showInsights)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showInsights
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            <Brain className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Learning Style Overview */}
      {learningStyle && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Your Learning Style Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Primary & Secondary Styles</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={getStyleColor(learningStyle.primary)}>
                      {getStyleIcon(learningStyle.primary)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 capitalize">
                        {learningStyle.primary} (Primary)
                      </div>
                      <div className="text-sm text-gray-600">
                        {Math.round(learningStyle.scores[learningStyle.primary])}% preference
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(learningStyle.scores[learningStyle.primary])}%
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={getStyleColor(learningStyle.secondary)}>
                      {getStyleIcon(learningStyle.secondary)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 capitalize">
                        {learningStyle.secondary} (Secondary)
                      </div>
                      <div className="text-sm text-gray-600">
                        {Math.round(learningStyle.scores[learningStyle.secondary])}% preference
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(learningStyle.scores[learningStyle.secondary])}%
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Style Breakdown</h4>
              <div className="space-y-3">
                {Object.entries(learningStyle.scores).map(([style, score]) => (
                  <div key={style}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{style}</span>
                      <span>{Math.round(score)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          style === 'visual' ? 'bg-blue-500' :
                          style === 'auditory' ? 'bg-green-500' :
                          style === 'kinesthetic' ? 'bg-purple-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assessment */}
      {!isTakingAssessment && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="heading text-lg font-semibold">Learning Style Assessment</h3>
              <p className="text-sm text-gray-600">
                Take a quick assessment to discover your optimal learning style
              </p>
            </div>
            <button
              onClick={handleStartAssessment}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Start Assessment</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Assessment Info</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Questions</span>
                  <span>{assessmentHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Time</span>
                  <span>3-5 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Taken</span>
                  <span>{learningStyle?.lastUpdated ? new Date(learningStyle.lastUpdated).toLocaleDateString() : 'Never'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Confidence</span>
                  <span>{learningStyle?.confidence || 0}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Learning Styles</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <div className={getStyleColor('visual')}>
                    {getStyleIcon('visual')}
                  </div>
                  <span>Visual - Learn through seeing and observing</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className={getStyleColor('auditory')}>
                    {getStyleIcon('auditory')}
                  </div>
                  <span>Auditory - Learn through hearing and listening</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className={getStyleColor('kinesthetic')}>
                    {getStyleIcon('kinesthetic')}
                  </div>
                  <span>Kinesthetic - Learn through doing and touching</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className={getStyleColor('reading')}>
                    {getStyleIcon('reading')}
                  </div>
                  <span>Reading - Learn through reading and writing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Assessment */}
      {isTakingAssessment && currentAssessment && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="heading text-lg font-semibold">Learning Style Assessment</h3>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {assessmentHistory.length}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                <Pause className="w-4 h-4" />
              </button>
              <button className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-3 rounded-full mb-6">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / assessmentHistory.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div className="text-center space-y-6">
            <div className="text-lg font-medium text-gray-900 mb-6">
              {currentAssessment.question}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentAssessment.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswerQuestion(currentAssessment.id, option.id)}
                  className="flex items-center space-x-3 p-4 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
                >
                  <div className={getStyleColor(option.style)}>
                    {getStyleIcon(option.style)}
                  </div>
                  <span className="text-sm text-gray-700">{option.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      {showInsights && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Learning Style Insights</h3>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStyleColor(insight.style)}`}>
                      {insight.style}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                      {insight.impact} impact
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {new Date(insight.createdAt).toLocaleDateString()}
                    </div>
                    {insight.actionable && insight.actionUrl && (
                      <button className="text-sm text-primary hover:text-primary-dark font-medium">
                        Take Action →
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
      {showRecommendations && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Personalized Recommendations</h3>
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 border-base rounded-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={getStyleColor(recommendation.style)}>
                      {getStyleIcon(recommendation.style)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
                      <p className="text-sm text-gray-600">{recommendation.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      +{recommendation.estimatedImprovement}% improvement
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      recommendation.priority === 'high' ? 'text-red-600 bg-red-50' :
                      recommendation.priority === 'medium' ? 'text-yellow-600 bg-yellow-50' :
                      'text-green-600 bg-green-50'
                    }`}>
                      {recommendation.priority} priority
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Implementation</h5>
                    <ul className="space-y-1">
                      {recommendation.implementation.map((step, i) => (
                        <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                          <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Resources</h5>
                    <ul className="space-y-1">
                      {recommendation.resources.map((resource, i) => (
                        <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                          <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <span>{resource}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Behaviors */}
      <div className="bg-white border-base rounded-lg p-6 shadow-sm">
        <h3 className="heading text-lg font-semibold mb-4">Observed Learning Behaviors</h3>
        <div className="space-y-4">
          {behaviors.map((behavior, index) => (
            <motion.div
              key={behavior.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center justify-between p-4 border-base rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className={getStyleColor(behavior.style)}>
                  {getStyleIcon(behavior.style)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{behavior.behavior}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Frequency: {behavior.frequency}%</span>
                    <span>Impact: {behavior.impact}/10</span>
                    <span>Confidence: {behavior.confidence}%</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {new Date(behavior.lastObserved).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
