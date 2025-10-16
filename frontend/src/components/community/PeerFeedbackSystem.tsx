"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Star, ThumbsUp, ThumbsDown, Edit3, CheckCircle, XCircle, Clock, User, Award, TrendingUp, Eye, Send, Filter, Search } from 'lucide-react';

interface PeerFeedbackSystemProps {
  userId: string;
  className?: string;
}

interface FeedbackRequest {
  id: string;
  character: {
    id: string;
    character: string;
    type: 'hiragana' | 'katakana' | 'kanji';
    readings: string[];
    meanings: string[];
  };
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    level: number;
  };
  handwritingImage: string;
  requestMessage: string;
  createdAt: string;
  status: 'pending' | 'in-progress' | 'completed';
  feedbackCount: number;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  difficulty: number;
}

interface Feedback {
  id: string;
  requestId: string;
  reviewer: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    level: number;
    expertise: string[];
  };
  rating: number;
  comments: string;
  suggestions: string[];
  strengths: string[];
  improvements: string[];
  createdAt: string;
  isHelpful: boolean;
  helpfulCount: number;
  strokeOrderFeedback?: {
    correct: boolean;
    notes: string;
  };
  proportionFeedback?: {
    correct: boolean;
    notes: string;
  };
  styleFeedback?: {
    correct: boolean;
    notes: string;
  };
}

interface FeedbackStats {
  totalRequests: number;
  completedRequests: number;
  averageRating: number;
  helpfulFeedbackCount: number;
  expertiseLevel: string;
  feedbackGiven: number;
  feedbackReceived: number;
}

export const PeerFeedbackSystem: React.FC<PeerFeedbackSystemProps> = ({
  userId,
  className = ''
}) => {
  const [feedbackRequests, setFeedbackRequests] = useState<FeedbackRequest[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<FeedbackRequest | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | FeedbackRequest['status'],
    priority: 'all' as 'all' | FeedbackRequest['priority'],
    characterType: 'all' as 'all' | FeedbackRequest['character']['type'],
    search: ''
  });
  const [sortBy, setSortBy] = useState<'recent' | 'priority' | 'feedback-count'>('recent');
  const [viewMode, setViewMode] = useState<'requests' | 'my-feedback' | 'stats'>('requests');

  // Mock data - in real app, this would come from community service
  useEffect(() => {
    const loadFeedbackData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock feedback requests
      const mockRequests: FeedbackRequest[] = [
        {
          id: 'request-1',
          character: {
            id: 'hiragana-あ',
            character: 'あ',
            type: 'hiragana',
            readings: ['a'],
            meanings: ['ah', 'oh']
          },
          author: {
            id: 'user-1',
            username: 'SakuraSensei',
            displayName: 'Sakura Sensei',
            avatar: '🌸',
            level: 12
          },
          handwritingImage: '/api/placeholder/300/200',
          requestMessage: 'I\'m struggling with the stroke order for あ. Can someone help me improve my handwriting?',
          createdAt: '2024-01-21T10:30:00Z',
          status: 'pending',
          feedbackCount: 0,
          priority: 'medium',
          tags: ['stroke-order', 'beginner', 'hiragana'],
          difficulty: 2
        },
        {
          id: 'request-2',
          character: {
            id: 'kanji-漢字',
            character: '漢字',
            type: 'kanji',
            readings: ['kanji'],
            meanings: ['Chinese characters', 'Kanji']
          },
          author: {
            id: 'user-2',
            username: 'KanjiMaster',
            displayName: 'Kanji Master',
            avatar: '🎌',
            level: 15
          },
          handwritingImage: '/api/placeholder/300/200',
          requestMessage: 'My 漢字 looks messy. Any tips for better proportions and stroke balance?',
          createdAt: '2024-01-20T14:20:00Z',
          status: 'in-progress',
          feedbackCount: 2,
          priority: 'high',
          tags: ['proportions', 'stroke-balance', 'kanji', 'advanced'],
          difficulty: 4
        },
        {
          id: 'request-3',
          character: {
            id: 'katakana-ア',
            character: 'ア',
            type: 'katakana',
            readings: ['a'],
            meanings: ['ah', 'oh']
          },
          author: {
            id: userId,
            username: 'WriteWaveUser',
            displayName: 'WriteWave User',
            avatar: '🚀',
            level: 8
          },
          handwritingImage: '/api/placeholder/300/200',
          requestMessage: 'How does my ア look? I want to make sure I\'m getting the angles right.',
          createdAt: '2024-01-19T16:45:00Z',
          status: 'completed',
          feedbackCount: 3,
          priority: 'low',
          tags: ['angles', 'katakana', 'intermediate'],
          difficulty: 3
        }
      ];

      // Mock feedbacks
      const mockFeedbacks: Feedback[] = [
        {
          id: 'feedback-1',
          requestId: 'request-2',
          reviewer: {
            id: 'user-3',
            username: 'StrokeSage',
            displayName: 'Stroke Sage',
            avatar: '🧙‍♂️',
            level: 11,
            expertise: ['kanji', 'stroke-order', 'calligraphy']
          },
          rating: 4,
          comments: 'Your 漢字 shows good understanding of the basic structure. The main issue is with the balance between the two parts. Try to make the left radical slightly smaller and the right part more prominent.',
          suggestions: [
            'Practice the left radical (氵) separately to get the proportions right',
            'Focus on making the right part (漢) more dominant',
            'Try writing on grid paper to maintain consistent spacing'
          ],
          strengths: [
            'Good stroke order',
            'Clear character recognition',
            'Consistent stroke thickness'
          ],
          improvements: [
            'Work on character proportions',
            'Improve stroke balance',
            'Practice spacing between components'
          ],
          createdAt: '2024-01-21T09:15:00Z',
          isHelpful: true,
          helpfulCount: 5,
          strokeOrderFeedback: {
            correct: true,
            notes: 'Stroke order is correct, good job!'
          },
          proportionFeedback: {
            correct: false,
            notes: 'The left radical is too large compared to the right part'
          },
          styleFeedback: {
            correct: true,
            notes: 'Overall style is consistent and readable'
          }
        },
        {
          id: 'feedback-2',
          requestId: 'request-3',
          reviewer: {
            id: 'user-4',
            username: 'HiraganaHero',
            displayName: 'Hiragana Hero',
            avatar: '⚡',
            level: 10,
            expertise: ['hiragana', 'katakana', 'beginners']
          },
          rating: 5,
          comments: 'Excellent work on ア! Your angles are perfect and the character is very clean. This is exactly how it should look.',
          suggestions: [
            'Keep practicing to maintain this quality',
            'Try writing it in different sizes',
            'Practice connecting it with other katakana characters'
          ],
          strengths: [
            'Perfect angles',
            'Clean strokes',
            'Good proportions',
            'Consistent style'
          ],
          improvements: [
            'No major improvements needed',
            'Just keep practicing to maintain quality'
          ],
          createdAt: '2024-01-20T11:30:00Z',
          isHelpful: true,
          helpfulCount: 8,
          strokeOrderFeedback: {
            correct: true,
            notes: 'Perfect stroke order!'
          },
          proportionFeedback: {
            correct: true,
            notes: 'Proportions are excellent'
          },
          styleFeedback: {
            correct: true,
            notes: 'Style is very clean and professional'
          }
        }
      ];

      setFeedbackRequests(mockRequests);
      setFeedbacks(mockFeedbacks);
      setIsLoading(false);
    };

    loadFeedbackData();
  }, [userId]);

  const filteredRequests = useMemo(() => {
    let filtered = feedbackRequests;

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(request => request.status === filters.status);
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      filtered = filtered.filter(request => request.priority === filters.priority);
    }

    // Filter by character type
    if (filters.characterType !== 'all') {
      filtered = filtered.filter(request => request.character.type === filters.characterType);
    }

    // Filter by search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(request =>
        request.character.character.toLowerCase().includes(query) ||
        request.requestMessage.toLowerCase().includes(query) ||
        request.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'feedback-count':
          return b.feedbackCount - a.feedbackCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [feedbackRequests, filters, sortBy]);

  const myFeedbackStats: FeedbackStats = {
    totalRequests: feedbackRequests.filter(r => r.author.id === userId).length,
    completedRequests: feedbackRequests.filter(r => r.author.id === userId && r.status === 'completed').length,
    averageRating: 4.2,
    helpfulFeedbackCount: 12,
    expertiseLevel: 'Intermediate',
    feedbackGiven: feedbacks.filter(f => f.reviewer.id === userId).length,
    feedbackReceived: feedbacks.filter(f => feedbackRequests.find(r => r.id === f.requestId && r.author.id === userId)).length
  };

  const handleProvideFeedback = (request: FeedbackRequest) => {
    setSelectedRequest(request);
    setShowFeedbackModal(true);
  };

  const handleCreateRequest = () => {
    setShowRequestModal(true);
  };

  const handleSubmitFeedback = async (feedbackData: any) => {
    // In real app, this would call the API to submit feedback
    const newFeedback: Feedback = {
      id: `feedback-${Date.now()}`,
      requestId: selectedRequest!.id,
      reviewer: {
        id: userId,
        username: 'WriteWaveUser',
        displayName: 'WriteWave User',
        avatar: '🚀',
        level: 8,
        expertise: ['hiragana', 'katakana', 'beginners']
      },
      rating: feedbackData.rating,
      comments: feedbackData.comments,
      suggestions: feedbackData.suggestions,
      strengths: feedbackData.strengths,
      improvements: feedbackData.improvements,
      createdAt: new Date().toISOString(),
      isHelpful: false,
      helpfulCount: 0,
      strokeOrderFeedback: feedbackData.strokeOrderFeedback,
      proportionFeedback: feedbackData.proportionFeedback,
      styleFeedback: feedbackData.styleFeedback
    };

    setFeedbacks(prev => [newFeedback, ...prev]);
    setFeedbackRequests(prev => prev.map(request => 
      request.id === selectedRequest!.id 
        ? { ...request, feedbackCount: request.feedbackCount + 1, status: 'in-progress' as const }
        : request
    ));
    setShowFeedbackModal(false);
    setSelectedRequest(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < difficulty ? 'text-yellow-500 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading feedback system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Peer Feedback System</h2>
          <p className="body text-gray-600">
            Get feedback on your handwriting and help others improve
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode('stats')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'stats'
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            My Stats
          </button>
          <button
            onClick={() => setViewMode('my-feedback')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'my-feedback'
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            My Feedback
          </button>
          <button
            onClick={handleCreateRequest}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Request Feedback</span>
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center border-base rounded-lg p-1 w-fit">
        {(['requests', 'my-feedback', 'stats'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
              viewMode === mode
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {mode === 'requests' ? 'Feedback Requests' : 
             mode === 'my-feedback' ? 'My Feedback' : 'Statistics'}
          </button>
        ))}
      </div>

      {/* Content based on view mode */}
      {viewMode === 'requests' && (
        <>
          {/* Filters and Search */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              {/* Priority Filter */}
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as any }))}
                className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Character Type Filter */}
              <select
                value={filters.characterType}
                onChange={(e) => setFilters(prev => ({ ...prev, characterType: e.target.value as any }))}
                className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="hiragana">Hiragana</option>
                <option value="katakana">Katakana</option>
                <option value="kanji">Kanji</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <div className="flex items-center space-x-2">
                {(['recent', 'priority', 'feedback-count'] as const).map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setSortBy(sort)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      sortBy === sort
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {sort === 'recent' ? 'Most Recent' : 
                     sort === 'priority' ? 'Priority' : 'Most Feedback'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback Requests List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white border-base rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    {/* Character Display */}
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {request.character.character}
                      </div>
                      <div className="text-sm text-gray-600">
                        {request.character.type}
                      </div>
                      <div className="flex items-center justify-center mt-2">
                        {getDifficultyStars(request.difficulty)}
                      </div>
                    </div>

                    {/* Request Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="heading text-lg font-semibold text-gray-900 mb-1">
                            {request.character.readings.join(', ')} - {request.character.meanings.join(', ')}
                          </h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                              {request.priority} priority
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div className="flex items-center space-x-1 mb-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{request.feedbackCount} feedback</span>
                          </div>
                          <div>{new Date(request.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{request.requestMessage}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {request.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Author Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{request.author.avatar}</div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.author.displayName}
                            </div>
                            <div className="text-xs text-gray-600">
                              Level {request.author.level}
                            </div>
                          </div>
                        </div>

                        {request.author.id !== userId && (
                          <button
                            onClick={() => handleProvideFeedback(request)}
                            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Provide Feedback</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {viewMode === 'my-feedback' && (
        <div className="space-y-4">
          <AnimatePresence>
            {feedbacks.filter(f => f.reviewer.id === userId).map((feedback, index) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white border-base rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{feedback.reviewer.avatar}</div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {feedback.reviewer.displayName}
                      </div>
                      <div className="text-sm text-gray-600">
                        Level {feedback.reviewer.level} • {feedback.reviewer.expertise.join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < feedback.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Comments</h4>
                    <p className="text-gray-700">{feedback.comments}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Strengths</h4>
                      <ul className="space-y-1">
                        {feedback.strengths.map((strength, i) => (
                          <li key={i} className="flex items-center space-x-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Improvements</h4>
                      <ul className="space-y-1">
                        {feedback.improvements.map((improvement, i) => (
                          <li key={i} className="flex items-center space-x-2 text-sm text-gray-700">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Suggestions</h4>
                    <ul className="space-y-1">
                      {feedback.suggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                          <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {viewMode === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Total Requests</h3>
              <Edit3 className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {myFeedbackStats.totalRequests}
            </div>
            <div className="text-sm text-gray-600">
              Feedback requests made
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Completed</h3>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {myFeedbackStats.completedRequests}
            </div>
            <div className="text-sm text-gray-600">
              Requests with feedback
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Average Rating</h3>
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {myFeedbackStats.averageRating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              Out of 5.0 stars
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Expertise Level</h3>
              <Award className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {myFeedbackStats.expertiseLevel}
            </div>
            <div className="text-sm text-gray-600">
              Based on feedback quality
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {viewMode === 'requests' && filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✍️</div>
          <h3 className="heading text-xl font-semibold text-gray-900 mb-2">No feedback requests found</h3>
          <p className="body text-gray-600 mb-4">
            {filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.characterType !== 'all'
              ? 'Try adjusting your filters'
              : 'Be the first to request feedback on your handwriting!'
            }
          </p>
          <button
            onClick={handleCreateRequest}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Request Feedback
          </button>
        </div>
      )}

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && selectedRequest && (
          <FeedbackModal
            request={selectedRequest}
            onClose={() => setShowFeedbackModal(false)}
            onSubmit={handleSubmitFeedback}
          />
        )}
      </AnimatePresence>

      {/* Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <RequestModal
            onClose={() => setShowRequestModal(false)}
            onSubmit={(requestData) => {
              // Handle request creation
              console.log('Create request:', requestData);
              setShowRequestModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Feedback Modal Component
interface FeedbackModalProps {
  request: FeedbackRequest;
  onClose: () => void;
  onSubmit: (feedbackData: any) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ request, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    rating: 3,
    comments: '',
    suggestions: [] as string[],
    strengths: [] as string[],
    improvements: [] as string[],
    strokeOrderFeedback: { correct: true, notes: '' },
    proportionFeedback: { correct: true, notes: '' },
    styleFeedback: { correct: true, notes: '' }
  });

  const [newSuggestion, setNewSuggestion] = useState('');
  const [newStrength, setNewStrength] = useState('');
  const [newImprovement, setNewImprovement] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addSuggestion = () => {
    if (newSuggestion.trim()) {
      setFormData(prev => ({ ...prev, suggestions: [...prev.suggestions, newSuggestion.trim()] }));
      setNewSuggestion('');
    }
  };

  const addStrength = () => {
    if (newStrength.trim()) {
      setFormData(prev => ({ ...prev, strengths: [...prev.strengths, newStrength.trim()] }));
      setNewStrength('');
    }
  };

  const addImprovement = () => {
    if (newImprovement.trim()) {
      setFormData(prev => ({ ...prev, improvements: [...prev.improvements, newImprovement.trim()] }));
      setNewImprovement('');
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white border-base rounded-lg p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="heading text-2xl font-bold text-gray-900">Provide Feedback</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Character Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold text-primary">
                {request.character.character}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {request.character.readings.join(', ')} - {request.character.meanings.join(', ')}
                </h3>
                <p className="text-sm text-gray-600">{request.character.type}</p>
                <p className="text-sm text-gray-700 mt-2">{request.requestMessage}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating
              </label>
              <div className="flex items-center space-x-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating: i + 1 }))}
                    className="text-2xl"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        i < formData.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {formData.rating} out of 5
                </span>
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Comments
              </label>
              <textarea
                required
                rows={4}
                value={formData.comments}
                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Provide detailed feedback on the handwriting..."
              />
            </div>

            {/* Specific Feedback Areas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stroke Order
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="stroke-correct"
                      checked={formData.strokeOrderFeedback.correct}
                      onChange={() => setFormData(prev => ({ 
                        ...prev, 
                        strokeOrderFeedback: { ...prev.strokeOrderFeedback, correct: true }
                      }))}
                      className="text-primary"
                    />
                    <label htmlFor="stroke-correct" className="text-sm">Correct</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="stroke-incorrect"
                      checked={!formData.strokeOrderFeedback.correct}
                      onChange={() => setFormData(prev => ({ 
                        ...prev, 
                        strokeOrderFeedback: { ...prev.strokeOrderFeedback, correct: false }
                      }))}
                      className="text-primary"
                    />
                    <label htmlFor="stroke-incorrect" className="text-sm">Needs Work</label>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.strokeOrderFeedback.notes}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      strokeOrderFeedback: { ...prev.strokeOrderFeedback, notes: e.target.value }
                    }))}
                    className="w-full p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Notes on stroke order..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proportions
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="proportion-correct"
                      checked={formData.proportionFeedback.correct}
                      onChange={() => setFormData(prev => ({ 
                        ...prev, 
                        proportionFeedback: { ...prev.proportionFeedback, correct: true }
                      }))}
                      className="text-primary"
                    />
                    <label htmlFor="proportion-correct" className="text-sm">Good</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="proportion-incorrect"
                      checked={!formData.proportionFeedback.correct}
                      onChange={() => setFormData(prev => ({ 
                        ...prev, 
                        proportionFeedback: { ...prev.proportionFeedback, correct: false }
                      }))}
                      className="text-primary"
                    />
                    <label htmlFor="proportion-incorrect" className="text-sm">Needs Work</label>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.proportionFeedback.notes}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      proportionFeedback: { ...prev.proportionFeedback, notes: e.target.value }
                    }))}
                    className="w-full p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Notes on proportions..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="style-correct"
                      checked={formData.styleFeedback.correct}
                      onChange={() => setFormData(prev => ({ 
                        ...prev, 
                        styleFeedback: { ...prev.styleFeedback, correct: true }
                      }))}
                      className="text-primary"
                    />
                    <label htmlFor="style-correct" className="text-sm">Good</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="style-incorrect"
                      checked={!formData.styleFeedback.correct}
                      onChange={() => setFormData(prev => ({ 
                        ...prev, 
                        styleFeedback: { ...prev.styleFeedback, correct: false }
                      }))}
                      className="text-primary"
                    />
                    <label htmlFor="style-incorrect" className="text-sm">Needs Work</label>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.styleFeedback.notes}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      styleFeedback: { ...prev.styleFeedback, notes: e.target.value }
                    }))}
                    className="w-full p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Notes on style..."
                  />
                </div>
              </div>
            </div>

            {/* Strengths */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Strengths
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={newStrength}
                  onChange={(e) => setNewStrength(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStrength())}
                  className="flex-1 p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add a strength"
                />
                <button
                  type="button"
                  onClick={addStrength}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-1">
                {formData.strengths.map((strength, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-700">{strength}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        strengths: prev.strengths.filter((_, i) => i !== index)
                      }))}
                      className="text-green-600 hover:text-green-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Areas for Improvement
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={newImprovement}
                  onChange={(e) => setNewImprovement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImprovement())}
                  className="flex-1 p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add an improvement area"
                />
                <button
                  type="button"
                  onClick={addImprovement}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-1">
                {formData.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-700">{improvement}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        improvements: prev.improvements.filter((_, i) => i !== index)
                      }))}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggestions
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={newSuggestion}
                  onChange={(e) => setNewSuggestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSuggestion())}
                  className="flex-1 p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add a suggestion"
                />
                <button
                  type="button"
                  onClick={addSuggestion}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-1">
                {formData.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                    <span className="text-sm text-gray-700">{suggestion}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        suggestions: prev.suggestions.filter((_, i) => i !== index)
                      }))}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Submit Feedback
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Request Modal Component
interface RequestModalProps {
  onClose: () => void;
  onSubmit: (requestData: any) => void;
}

const RequestModal: React.FC<RequestModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    character: '',
    characterType: 'hiragana' as const,
    requestMessage: '',
    priority: 'medium' as const,
    tags: [] as string[]
  });

  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white border-base rounded-lg p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="heading text-2xl font-bold text-gray-900">Request Feedback</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Character */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Character
                </label>
                <input
                  type="text"
                  required
                  value={formData.character}
                  onChange={(e) => setFormData(prev => ({ ...prev, character: e.target.value }))}
                  className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter character"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Character Type
                </label>
                <select
                  value={formData.characterType}
                  onChange={(e) => setFormData(prev => ({ ...prev, characterType: e.target.value as any }))}
                  className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="hiragana">Hiragana</option>
                  <option value="katakana">Katakana</option>
                  <option value="kanji">Kanji</option>
                </select>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Request Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Message
              </label>
              <textarea
                required
                rows={4}
                value={formData.requestMessage}
                onChange={(e) => setFormData(prev => ({ ...prev, requestMessage: e.target.value }))}
                className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Describe what kind of feedback you're looking for..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center space-x-2"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}
                      className="text-primary hover:text-primary-dark"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Request Feedback
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};
