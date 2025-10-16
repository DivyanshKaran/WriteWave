"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, TrendingUp, Users, MessageCircle, Target, Zap, Clock, Award, Star, Heart, Share2, Eye, Filter, Calendar, Download, RefreshCw } from 'lucide-react';

interface SocialLearningAnalyticsProps {
  userId: string;
  className?: string;
}

interface SocialLearningMetrics {
  engagement: {
    totalInteractions: number;
    dailyInteractions: number;
    weeklyInteractions: number;
    monthlyInteractions: number;
    interactionGrowth: number;
  };
  community: {
    friendsCount: number;
    followersCount: number;
    followingCount: number;
    studyGroupsJoined: number;
    discussionsParticipated: number;
    feedbackGiven: number;
    feedbackReceived: number;
  };
  learning: {
    socialLearningSessions: number;
    peerStudyTime: number;
    collaborativeAchievements: number;
    groupChallengeWins: number;
    mentorshipSessions: number;
    teachingSessions: number;
  };
  influence: {
    socialScore: number;
    influenceRank: number;
    contentViews: number;
    contentShares: number;
    contentLikes: number;
    mentions: number;
  };
  network: {
    networkSize: number;
    networkGrowth: number;
    connectionStrength: number;
    mutualConnections: number;
    geographicDiversity: number;
    timezoneDiversity: number;
  };
}

interface SocialActivity {
  id: string;
  type: 'post' | 'comment' | 'like' | 'share' | 'follow' | 'friend-request' | 'study-session' | 'feedback' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  engagement: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  impact: {
    reach: number;
    influence: number;
    learningValue: number;
  };
  category: 'learning' | 'social' | 'achievement' | 'help' | 'discussion';
}

interface SocialInsight {
  id: string;
  type: 'trend' | 'recommendation' | 'achievement' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'engagement' | 'learning' | 'community' | 'growth';
  actionable: boolean;
  actionUrl?: string;
  createdAt: string;
}

interface SocialComparison {
  metric: string;
  yourValue: number;
  averageValue: number;
  percentile: number;
  trend: 'up' | 'down' | 'stable';
  recommendation: string;
}

export const SocialLearningAnalytics: React.FC<SocialLearningAnalyticsProps> = ({
  userId,
  className = ''
}) => {
  const [metrics, setMetrics] = useState<SocialLearningMetrics | null>(null);
  const [activities, setActivities] = useState<SocialActivity[]>([]);
  const [insights, setInsights] = useState<SocialInsight[]>([]);
  const [comparisons, setComparisons] = useState<SocialComparison[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'all-time'>('weekly');
  const [selectedCategory, setSelectedCategory] = useState<'engagement' | 'community' | 'learning' | 'influence' | 'network'>('engagement');
  const [showInsights, setShowInsights] = useState(true);
  const [showComparisons, setShowComparisons] = useState(true);

  // Mock data - in real app, this would come from analytics service
  useEffect(() => {
    const loadAnalyticsData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock metrics
      const mockMetrics: SocialLearningMetrics = {
        engagement: {
          totalInteractions: 1247,
          dailyInteractions: 23,
          weeklyInteractions: 156,
          monthlyInteractions: 623,
          interactionGrowth: 15.2
        },
        community: {
          friendsCount: 12,
          followersCount: 8,
          followingCount: 15,
          studyGroupsJoined: 3,
          discussionsParticipated: 28,
          feedbackGiven: 15,
          feedbackReceived: 23
        },
        learning: {
          socialLearningSessions: 45,
          peerStudyTime: 320, // minutes
          collaborativeAchievements: 8,
          groupChallengeWins: 3,
          mentorshipSessions: 2,
          teachingSessions: 5
        },
        influence: {
          socialScore: 75,
          influenceRank: 12,
          contentViews: 456,
          contentShares: 23,
          contentLikes: 89,
          mentions: 12
        },
        network: {
          networkSize: 35,
          networkGrowth: 8.5,
          connectionStrength: 78,
          mutualConnections: 15,
          geographicDiversity: 6,
          timezoneDiversity: 4
        }
      };

      // Mock activities
      const mockActivities: SocialActivity[] = [
        {
          id: 'activity-1',
          type: 'post',
          title: 'Shared learning progress',
          description: 'Posted about mastering あ character with helpful tips',
          timestamp: '2024-01-21T19:30:00Z',
          engagement: {
            views: 45,
            likes: 12,
            comments: 3,
            shares: 2
          },
          impact: {
            reach: 67,
            influence: 8.5,
            learningValue: 9.2
          },
          category: 'learning'
        },
        {
          id: 'activity-2',
          type: 'feedback',
          title: 'Provided handwriting feedback',
          description: 'Helped Hiragana Hero improve their い character',
          timestamp: '2024-01-21T18:45:00Z',
          engagement: {
            views: 12,
            likes: 5,
            comments: 1,
            shares: 0
          },
          impact: {
            reach: 18,
            influence: 7.8,
            learningValue: 9.5
          },
          category: 'help'
        },
        {
          id: 'activity-3',
          type: 'achievement',
          title: 'Unlocked achievement',
          description: 'Achieved "First 50 Characters" milestone',
          timestamp: '2024-01-21T17:20:00Z',
          engagement: {
            views: 89,
            likes: 23,
            comments: 8,
            shares: 5
          },
          impact: {
            reach: 124,
            influence: 6.2,
            learningValue: 7.8
          },
          category: 'achievement'
        }
      ];

      // Mock insights
      const mockInsights: SocialInsight[] = [
        {
          id: 'insight-1',
          type: 'trend',
          title: 'Increasing Social Engagement',
          description: 'Your social interactions have increased by 23% this week. You\'re becoming more active in the community!',
          impact: 'high',
          category: 'engagement',
          actionable: true,
          actionUrl: '/community/discussions',
          createdAt: '2024-01-21T19:00:00Z'
        },
        {
          id: 'insight-2',
          type: 'recommendation',
          title: 'Join More Study Groups',
          description: 'Users who join 3+ study groups show 40% better learning outcomes. Consider joining another group!',
          impact: 'medium',
          category: 'learning',
          actionable: true,
          actionUrl: '/community/study-groups',
          createdAt: '2024-01-21T18:30:00Z'
        },
        {
          id: 'insight-3',
          type: 'opportunity',
          title: 'Mentorship Opportunity',
          description: 'Your progress is impressive! Consider becoming a mentor to help other beginners.',
          impact: 'high',
          category: 'community',
          actionable: true,
          actionUrl: '/community/mentorship',
          createdAt: '2024-01-21T17:45:00Z'
        }
      ];

      // Mock comparisons
      const mockComparisons: SocialComparison[] = [
        {
          metric: 'Social Interactions',
          yourValue: 23,
          averageValue: 15,
          percentile: 78,
          trend: 'up',
          recommendation: 'Keep up the great engagement! You\'re above average.'
        },
        {
          metric: 'Study Group Participation',
          yourValue: 3,
          averageValue: 2,
          percentile: 65,
          trend: 'stable',
          recommendation: 'Consider joining one more study group for better outcomes.'
        },
        {
          metric: 'Feedback Given',
          yourValue: 15,
          averageValue: 8,
          percentile: 85,
          trend: 'up',
          recommendation: 'Excellent! You\'re a helpful community member.'
        },
        {
          metric: 'Network Growth',
          yourValue: 8.5,
          averageValue: 5.2,
          percentile: 72,
          trend: 'up',
          recommendation: 'Your network is growing well. Keep connecting!'
        }
      ];

      setMetrics(mockMetrics);
      setActivities(mockActivities);
      setInsights(mockInsights);
      setComparisons(mockComparisons);
      setIsLoading(false);
    };

    loadAnalyticsData();
  }, [userId, selectedTimeframe]);

  const getCategoryData = (category: string) => {
    if (!metrics) return {};
    
    switch (category) {
      case 'engagement':
        return metrics.engagement;
      case 'community':
        return metrics.community;
      case 'learning':
        return metrics.learning;
      case 'influence':
        return metrics.influence;
      case 'network':
        return metrics.network;
      default:
        return {};
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'engagement': return <MessageCircle className="w-5 h-5" />;
      case 'community': return <Users className="w-5 h-5" />;
      case 'learning': return <Target className="w-5 h-5" />;
      case 'influence': return <Star className="w-5 h-5" />;
      case 'network': return <Share2 className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'engagement': return 'text-blue-600 bg-blue-50';
      case 'community': return 'text-green-600 bg-green-50';
      case 'learning': return 'text-purple-600 bg-purple-50';
      case 'influence': return 'text-yellow-600 bg-yellow-50';
      case 'network': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-gray-600 bg-gray-50';
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
      case 'up': return <TrendingUp className="w-4 h-4" />;
      case 'down': return <TrendingUp className="w-4 h-4 rotate-180" />;
      case 'stable': return <div className="w-4 h-4" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading social analytics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Social Learning Analytics</h2>
          <p className="body text-gray-600">
            Understand your social learning patterns and community impact
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center border-base rounded-lg p-1 w-fit">
        {(['daily', 'weekly', 'monthly', 'all-time'] as const).map((timeframe) => (
          <button
            key={timeframe}
            onClick={() => setSelectedTimeframe(timeframe)}
            className={`flex items-center space-x-2 px-3 py-1 text-sm font-medium rounded transition-colors ${
              selectedTimeframe === timeframe
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{timeframe === 'daily' ? 'Today' : 
                   timeframe === 'weekly' ? 'This Week' :
                   timeframe === 'monthly' ? 'This Month' : 'All Time'}</span>
          </button>
        ))}
      </div>

      {/* Category Selector */}
      <div className="flex flex-wrap gap-2">
        {(['engagement', 'community', 'learning', 'influence', 'network'] as const).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            <div className={selectedCategory === category ? 'text-white' : getCategoryColor(category).split(' ')[0]}>
              {getCategoryIcon(category)}
            </div>
            <span className="capitalize">{category}</span>
          </button>
        ))}
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(getCategoryData(selectedCategory)).map(([key, value]) => (
          <div key={key} className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <div className={getCategoryColor(selectedCategory)}>
                {getCategoryIcon(selectedCategory)}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            <div className="text-sm text-gray-600">
              {selectedTimeframe} metric
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      {showInsights && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Social Learning Insights</h3>
            <button
              onClick={() => setShowInsights(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className={`p-2 rounded-lg ${getImpactColor(insight.impact)}`}>
                  {getCategoryIcon(insight.category)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
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

      {/* Comparisons */}
      {showComparisons && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Community Comparisons</h3>
            <button
              onClick={() => setShowComparisons(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {comparisons.map((comparison, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{comparison.metric}</h4>
                    <div className={`flex items-center space-x-1 ${getTrendColor(comparison.trend)}`}>
                      {getTrendIcon(comparison.trend)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>You: {comparison.yourValue}</span>
                    <span>Average: {comparison.averageValue}</span>
                    <span>Percentile: {comparison.percentile}%</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{comparison.recommendation}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      <div className="bg-white border-base rounded-lg p-6 shadow-sm">
        <h3 className="heading text-lg font-semibold mb-4">Recent Social Activities</h3>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-start space-x-4 p-4 border-base rounded-lg"
            >
              <div className={`p-2 rounded-lg ${getCategoryColor(activity.category)}`}>
                {getCategoryIcon(activity.category)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    {activity.type}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-3">{activity.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{activity.engagement.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{activity.engagement.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{activity.engagement.comments}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 className="w-4 h-4" />
                      <span>{activity.engagement.shares}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Social Learning Recommendations */}
      <div className="bg-white border-base rounded-lg p-6 shadow-sm">
        <h3 className="heading text-lg font-semibold mb-4">Social Learning Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">Join Study Groups</h4>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Join 2-3 more study groups to increase your learning outcomes by 40%
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Browse Groups →
            </button>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">Share More Content</h4>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Share your learning progress to help others and increase your social score
            </p>
            <button className="text-sm text-green-600 hover:text-green-800 font-medium">
              Share Progress →
            </button>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-gray-900">Join Challenges</h4>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Participate in group challenges to boost your learning and social engagement
            </p>
            <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">
              View Challenges →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
