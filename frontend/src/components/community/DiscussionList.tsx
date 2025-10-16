"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Plus, Search, Filter, Heart, Bookmark, Share2, MoreHorizontal, Pin, Lock, Eye, TrendingUp, Clock, User, Tag } from 'lucide-react';
import type { Discussion, DiscussionCreateRequest } from '@/types/community';

interface DiscussionListProps {
  userId: string;
  className?: string;
}

interface DiscussionData {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    level: number;
  };
  category: 'hiragana' | 'katakana' | 'kanji' | 'general' | 'help' | 'tips' | 'achievements';
  tags: string[];
  replies: number;
  views: number;
  likes: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  lastReply?: {
    author: string;
    timestamp: string;
  };
  character?: {
    id: string;
    character: string;
    type: string;
  };
}

interface DiscussionFilters {
  category: 'all' | DiscussionData['category'];
  sortBy: 'recent' | 'popular' | 'trending' | 'unanswered';
  search: string;
  tags: string[];
}

export const DiscussionList: React.FC<DiscussionListProps> = ({
  userId,
  className = ''
}) => {
  const [discussions, setDiscussions] = useState<DiscussionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<DiscussionData | null>(null);
  const [showDiscussionDetails, setShowDiscussionDetails] = useState(false);
  const [filters, setFilters] = useState<DiscussionFilters>({
    category: 'all',
    sortBy: 'recent',
    search: '',
    tags: []
  });

  // Mock discussions data - in real app, this would come from community service
  useEffect(() => {
    const loadDiscussions = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock discussions data
      const mockDiscussions: DiscussionData[] = [
        {
          id: 'discussion-1',
          title: 'How to remember あ (a) character?',
          content: 'I\'m having trouble remembering the stroke order for あ. Any tips or mnemonics that helped you?',
          author: {
            id: 'user-1',
            username: 'SakuraSensei',
            displayName: 'Sakura Sensei',
            avatar: '🌸',
            level: 12
          },
          category: 'hiragana',
          tags: ['hiragana', 'stroke-order', 'mnemonics', 'beginner'],
          replies: 8,
          views: 45,
          likes: 12,
          isLiked: false,
          isBookmarked: false,
          isPinned: true,
          isLocked: false,
          createdAt: '2024-01-20T10:30:00Z',
          updatedAt: '2024-01-21T19:30:00Z',
          lastReply: {
            author: 'KanjiMaster',
            timestamp: '2024-01-21T19:30:00Z'
          },
          character: {
            id: 'hiragana-あ',
            character: 'あ',
            type: 'hiragana'
          }
        },
        {
          id: 'discussion-2',
          title: 'Best resources for learning Kanji?',
          content: 'I\'ve mastered Hiragana and Katakana, now I want to start learning Kanji. What are the best resources and methods?',
          author: {
            id: 'user-2',
            username: 'KanjiMaster',
            displayName: 'Kanji Master',
            avatar: '🎌',
            level: 15
          },
          category: 'kanji',
          tags: ['kanji', 'resources', 'methods', 'intermediate'],
          replies: 15,
          views: 89,
          likes: 23,
          isLiked: true,
          isBookmarked: true,
          isPinned: false,
          isLocked: false,
          createdAt: '2024-01-19T14:20:00Z',
          updatedAt: '2024-01-21T18:45:00Z',
          lastReply: {
            author: 'HiraganaHero',
            timestamp: '2024-01-21T18:45:00Z'
          }
        },
        {
          id: 'discussion-3',
          title: 'Daily practice routine suggestions',
          content: 'What does your daily practice routine look like? I\'m trying to build a consistent habit but struggling with motivation.',
          author: {
            id: 'user-3',
            username: 'PracticePanda',
            displayName: 'Practice Panda',
            avatar: '🐼',
            level: 9
          },
          category: 'tips',
          tags: ['routine', 'motivation', 'consistency', 'daily-practice'],
          replies: 12,
          views: 67,
          likes: 18,
          isLiked: false,
          isBookmarked: false,
          isPinned: false,
          isLocked: false,
          createdAt: '2024-01-18T09:15:00Z',
          updatedAt: '2024-01-21T17:20:00Z',
          lastReply: {
            author: 'WriteWaveUser',
            timestamp: '2024-01-21T17:20:00Z'
          }
        },
        {
          id: 'discussion-4',
          title: 'Achievement unlocked: 100 characters!',
          content: 'Just reached 100 characters mastered! 🎉 The journey has been amazing. Thanks to everyone who helped me along the way!',
          author: {
            id: userId,
            username: 'WriteWaveUser',
            displayName: 'WriteWave User',
            avatar: '🚀',
            level: 8
          },
          category: 'achievements',
          tags: ['achievement', 'milestone', 'celebration', 'progress'],
          replies: 5,
          views: 34,
          likes: 15,
          isLiked: false,
          isBookmarked: false,
          isPinned: false,
          isLocked: false,
          createdAt: '2024-01-17T16:45:00Z',
          updatedAt: '2024-01-21T16:30:00Z',
          lastReply: {
            author: 'SakuraSensei',
            timestamp: '2024-01-21T16:30:00Z'
          }
        },
        {
          id: 'discussion-5',
          title: 'Help with 漢字 stroke order',
          content: 'I\'m struggling with the stroke order for 漢字. The character is so complex! Any tips or visual guides?',
          author: {
            id: 'user-4',
            username: 'StrokeSage',
            displayName: 'Stroke Sage',
            avatar: '🧙‍♂️',
            level: 11
          },
          category: 'kanji',
          tags: ['kanji', 'stroke-order', 'help', 'complex-characters'],
          replies: 3,
          views: 23,
          likes: 7,
          isLiked: false,
          isBookmarked: false,
          isPinned: false,
          isLocked: false,
          createdAt: '2024-01-16T11:30:00Z',
          updatedAt: '2024-01-21T15:45:00Z',
          lastReply: {
            author: 'KanjiMaster',
            timestamp: '2024-01-21T15:45:00Z'
          },
          character: {
            id: 'kanji-漢字',
            character: '漢字',
            type: 'kanji'
          }
        }
      ];

      setDiscussions(mockDiscussions);
      setIsLoading(false);
    };

    loadDiscussions();
  }, [userId]);

  const filteredDiscussions = useMemo(() => {
    let filtered = discussions;

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(discussion => discussion.category === filters.category);
    }

    // Filter by search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(discussion =>
        discussion.title.toLowerCase().includes(query) ||
        discussion.content.toLowerCase().includes(query) ||
        discussion.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by tags
    if (filters.tags.length > 0) {
      filtered = filtered.filter(discussion =>
        filters.tags.some(tag => discussion.tags.includes(tag))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'popular':
          return b.likes - a.likes;
        case 'trending':
          return (b.likes + b.replies) - (a.likes + a.replies);
        case 'unanswered':
          return a.replies - b.replies;
        default:
          return 0;
      }
    });

    return filtered;
  }, [discussions, filters]);

  const handleLikeDiscussion = async (discussionId: string) => {
    setDiscussions(prev => prev.map(discussion => 
      discussion.id === discussionId 
        ? { 
            ...discussion, 
            isLiked: !discussion.isLiked,
            likes: discussion.isLiked ? discussion.likes - 1 : discussion.likes + 1
          }
        : discussion
    ));
  };

  const handleBookmarkDiscussion = async (discussionId: string) => {
    setDiscussions(prev => prev.map(discussion => 
      discussion.id === discussionId 
        ? { ...discussion, isBookmarked: !discussion.isBookmarked }
        : discussion
    ));
  };

  const handleCreateDiscussion = async (discussionData: DiscussionCreateRequest) => {
    const newDiscussion: DiscussionData = {
      id: `discussion-${Date.now()}`,
      title: discussionData.title,
      content: discussionData.content,
      author: {
        id: userId,
        username: 'WriteWaveUser',
        displayName: 'WriteWave User',
        avatar: '🚀',
        level: 8
      },
      category: discussionData.category,
      tags: discussionData.tags,
      replies: 0,
      views: 0,
      likes: 0,
      isLiked: false,
      isBookmarked: false,
      isPinned: false,
      isLocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDiscussions(prev => [newDiscussion, ...prev]);
    setShowCreateModal(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'hiragana': return 'text-blue-600 bg-blue-50';
      case 'katakana': return 'text-purple-600 bg-purple-50';
      case 'kanji': return 'text-orange-600 bg-orange-50';
      case 'general': return 'text-gray-600 bg-gray-50';
      case 'help': return 'text-red-600 bg-red-50';
      case 'tips': return 'text-green-600 bg-green-50';
      case 'achievements': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hiragana': return 'あ';
      case 'katakana': return 'ア';
      case 'kanji': return '漢';
      case 'general': return '💬';
      case 'help': return '❓';
      case 'tips': return '💡';
      case 'achievements': return '🏆';
      default: return '💬';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading discussions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Discussion Forums</h2>
          <p className="body text-gray-600">
            Share knowledge, ask questions, and learn together
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Discussion</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-base rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
            className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="hiragana">Hiragana</option>
            <option value="katakana">Katakana</option>
            <option value="kanji">Kanji</option>
            <option value="general">General</option>
            <option value="help">Help</option>
            <option value="tips">Tips</option>
            <option value="achievements">Achievements</option>
          </select>

          {/* Sort Options */}
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="trending">Trending</option>
            <option value="unanswered">Unanswered</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => setFilters({ category: 'all', sortBy: 'recent', search: '', tags: [] })}
            className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Discussions List */}
      <div className="bg-white border-base rounded-lg shadow-sm">
        <div className="divide-y divide-gray-200">
          <AnimatePresence>
            {filteredDiscussions.map((discussion, index) => (
              <motion.div
                key={discussion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedDiscussion(discussion);
                  setShowDiscussionDetails(true);
                }}
              >
                <div className="flex items-start space-x-4">
                  {/* Author Avatar */}
                  <div className="text-3xl">{discussion.author.avatar}</div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {discussion.isPinned && (
                            <Pin className="w-4 h-4 text-yellow-500" />
                          )}
                          {discussion.isLocked && (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                          <h3 className="heading text-lg font-semibold text-gray-900">
                            {discussion.title}
                          </h3>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {discussion.content}
                        </p>
                        
                        {/* Character Display */}
                        {discussion.character && (
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="text-2xl font-bold text-primary">
                              {discussion.character.character}
                            </div>
                            <span className="text-sm text-gray-600">
                              {discussion.character.type}
                            </span>
                          </div>
                        )}
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(discussion.category)}`}>
                            {getCategoryIcon(discussion.category)} {discussion.category}
                          </span>
                          {discussion.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                          {discussion.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              +{discussion.tags.length - 3} more
                            </span>
                          )}
                        </div>
                        
                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{discussion.author.displayName}</span>
                              <span className="text-xs">Level {discussion.author.level}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{discussion.replies} replies</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{discussion.views} views</span>
                            </div>
                            {discussion.lastReply && (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>Last reply by {discussion.lastReply.author}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-xs">
                            {new Date(discussion.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeDiscussion(discussion.id);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            discussion.isLiked
                              ? 'text-red-600 bg-red-50'
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${discussion.isLiked ? 'fill-current' : ''}`} />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmarkDiscussion(discussion.id);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            discussion.isBookmarked
                              ? 'text-yellow-600 bg-yellow-50'
                              : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${discussion.isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Share functionality
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Empty State */}
      {filteredDiscussions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="heading text-xl font-semibold text-gray-900 mb-2">No discussions found</h3>
          <p className="body text-gray-600 mb-4">
            {filters.search || filters.category !== 'all'
              ? 'Try adjusting your filters or search terms'
              : 'Be the first to start a discussion!'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Start Discussion
          </button>
        </div>
      )}

      {/* Create Discussion Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <DiscussionCreateModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateDiscussion}
          />
        )}
      </AnimatePresence>

      {/* Discussion Details Modal */}
      <AnimatePresence>
        {showDiscussionDetails && selectedDiscussion && (
          <DiscussionDetailsModal
            discussion={selectedDiscussion}
            onClose={() => setShowDiscussionDetails(false)}
            onLike={() => handleLikeDiscussion(selectedDiscussion.id)}
            onBookmark={() => handleBookmarkDiscussion(selectedDiscussion.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Discussion Create Modal Component
interface DiscussionCreateModalProps {
  onClose: () => void;
  onCreate: (discussionData: DiscussionCreateRequest) => void;
}

const DiscussionCreateModal: React.FC<DiscussionCreateModalProps> = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as const,
    tags: [] as string[]
  });

  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
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
            <h2 className="heading text-2xl font-bold text-gray-900">Start New Discussion</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discussion Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter discussion title"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="hiragana">Hiragana</option>
                <option value="katakana">Katakana</option>
                <option value="kanji">Kanji</option>
                <option value="help">Help</option>
                <option value="tips">Tips</option>
                <option value="achievements">Achievements</option>
              </select>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discussion Content *
              </label>
              <textarea
                required
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Share your thoughts, ask questions, or provide tips..."
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
                      onClick={() => removeTag(tag)}
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
                Start Discussion
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Discussion Details Modal Component
interface DiscussionDetailsModalProps {
  discussion: DiscussionData;
  onClose: () => void;
  onLike: () => void;
  onBookmark: () => void;
}

const DiscussionDetailsModal: React.FC<DiscussionDetailsModalProps> = ({ 
  discussion, 
  onClose, 
  onLike, 
  onBookmark 
}) => {
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
            <h2 className="heading text-2xl font-bold text-gray-900">{discussion.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Author Info */}
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{discussion.author.avatar}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">{discussion.author.displayName}</h3>
                  <p className="text-sm text-gray-600">Level {discussion.author.level}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(discussion.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div>
                <p className="text-gray-700 leading-relaxed">{discussion.content}</p>
              </div>

              {/* Character Display */}
              {discussion.character && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Related Character</h4>
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl font-bold text-primary">
                      {discussion.character.character}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Type: {discussion.character.type}</p>
                      <p className="text-sm text-gray-600">ID: {discussion.character.id}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(discussion.category)}`}>
                    {getCategoryIcon(discussion.category)} {discussion.category}
                  </span>
                  {discussion.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Discussion Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Replies</span>
                    <span className="text-sm font-medium">{discussion.replies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Views</span>
                    <span className="text-sm font-medium">{discussion.views}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Likes</span>
                    <span className="text-sm font-medium">{discussion.likes}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={onLike}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    discussion.isLiked
                      ? 'bg-red-500 text-white'
                      : 'border-base hover:border-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${discussion.isLiked ? 'fill-current' : ''}`} />
                  <span>{discussion.isLiked ? 'Liked' : 'Like'}</span>
                </button>
                
                <button
                  onClick={onBookmark}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    discussion.isBookmarked
                      ? 'bg-yellow-500 text-white'
                      : 'border-base hover:border-yellow-500 hover:bg-yellow-50'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${discussion.isBookmarked ? 'fill-current' : ''}`} />
                  <span>{discussion.isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};


