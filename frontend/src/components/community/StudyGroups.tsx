"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, Filter, Settings, Crown, Shield, MessageCircle, Calendar, Target, Star, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import type { StudyGroup, StudyGroupCreateRequest } from '@/types/community';

interface StudyGroupsProps {
  userId: string;
  className?: string;
}

interface StudyGroupData {
  id: string;
  name: string;
  description: string;
  category: 'hiragana' | 'katakana' | 'kanji' | 'mixed' | 'beginner' | 'intermediate' | 'advanced';
  level: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  maxMembers: number;
  currentMembers: number;
  isPrivate: boolean;
  isJoined: boolean;
  isOwner: boolean;
  isModerator: boolean;
  createdAt: string;
  lastActivity: string;
  tags: string[];
  rules: string[];
  weeklyGoal: string;
  meetingSchedule: string;
  owner: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    level: number;
  };
  members: Array<{
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    level: number;
    joinedAt: string;
    role: 'owner' | 'moderator' | 'member';
  }>;
  recentActivity: Array<{
    id: string;
    type: 'join' | 'leave' | 'post' | 'achievement';
    user: string;
    message: string;
    timestamp: string;
  }>;
}

export const StudyGroups: React.FC<StudyGroupsProps> = ({
  userId,
  className = ''
}) => {
  const [studyGroups, setStudyGroups] = useState<StudyGroupData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroupData | null>(null);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    level: 'all',
    privacy: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'newest'>('recent');

  // Mock study groups data - in real app, this would come from community service
  useEffect(() => {
    const loadStudyGroups = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock study groups data
      const mockStudyGroups: StudyGroupData[] = [
        {
          id: 'group-1',
          name: 'Hiragana Heroes',
          description: 'A supportive group for beginners learning Hiragana characters. We practice together and help each other improve!',
          category: 'hiragana',
          level: 'beginner',
          maxMembers: 20,
          currentMembers: 15,
          isPrivate: false,
          isJoined: true,
          isOwner: false,
          isModerator: false,
          createdAt: '2024-01-01T10:00:00Z',
          lastActivity: '2024-01-21T19:30:00Z',
          tags: ['hiragana', 'beginner', 'supportive', 'daily-practice'],
          rules: [
            'Be respectful to all members',
            'Share your progress regularly',
            'Help others when you can',
            'No spam or off-topic posts'
          ],
          weeklyGoal: 'Learn 5 new Hiragana characters',
          meetingSchedule: 'Every Sunday at 2 PM JST',
          owner: {
            id: 'user-1',
            username: 'SakuraSensei',
            displayName: 'Sakura Sensei',
            avatar: '🌸',
            level: 12
          },
          members: [
            {
              id: 'user-1',
              username: 'SakuraSensei',
              displayName: 'Sakura Sensei',
              avatar: '🌸',
              level: 12,
              joinedAt: '2024-01-01T10:00:00Z',
              role: 'owner'
            },
            {
              id: userId,
              username: 'WriteWaveUser',
              displayName: 'WriteWave User',
              avatar: '🚀',
              level: 8,
              joinedAt: '2024-01-15T14:30:00Z',
              role: 'member'
            }
          ],
          recentActivity: [
            {
              id: 'activity-1',
              type: 'post',
              user: 'SakuraSensei',
              message: 'Shared a new practice sheet for あ-お characters',
              timestamp: '2024-01-21T19:30:00Z'
            },
            {
              id: 'activity-2',
              type: 'join',
              user: 'WriteWaveUser',
              message: 'joined the group',
              timestamp: '2024-01-15T14:30:00Z'
            }
          ]
        },
        {
          id: 'group-2',
          name: 'Kanji Masters',
          description: 'Advanced learners focusing on Kanji characters. We study complex characters and share learning techniques.',
          category: 'kanji',
          level: 'advanced',
          maxMembers: 15,
          currentMembers: 12,
          isPrivate: true,
          isJoined: false,
          isOwner: false,
          isModerator: false,
          createdAt: '2024-01-05T16:00:00Z',
          lastActivity: '2024-01-21T18:45:00Z',
          tags: ['kanji', 'advanced', 'techniques', 'weekly-challenges'],
          rules: [
            'Must be at least Level 10',
            'Share one learning tip per week',
            'Participate in weekly challenges',
            'Help others with difficult characters'
          ],
          weeklyGoal: 'Master 3 new Kanji characters',
          meetingSchedule: 'Every Wednesday at 7 PM JST',
          owner: {
            id: 'user-2',
            username: 'KanjiMaster',
            displayName: 'Kanji Master',
            avatar: '🎌',
            level: 15
          },
          members: [],
          recentActivity: []
        },
        {
          id: 'group-3',
          name: 'Daily Practice Buddies',
          description: 'Motivation and accountability group for daily practice. We check in every day and celebrate progress together!',
          category: 'mixed',
          level: 'mixed',
          maxMembers: 30,
          currentMembers: 25,
          isPrivate: false,
          isJoined: false,
          isOwner: false,
          isModerator: false,
          createdAt: '2024-01-10T09:00:00Z',
          lastActivity: '2024-01-21T20:15:00Z',
          tags: ['daily-practice', 'motivation', 'accountability', 'streaks'],
          rules: [
            'Check in daily with your progress',
            'Encourage other members',
            'Share your daily goals',
            'Celebrate achievements together'
          ],
          weeklyGoal: 'Practice every day for 7 days',
          meetingSchedule: 'Daily check-ins at 9 PM JST',
          owner: {
            id: 'user-3',
            username: 'PracticePanda',
            displayName: 'Practice Panda',
            avatar: '🐼',
            level: 9
          },
          members: [],
          recentActivity: []
        }
      ];

      setStudyGroups(mockStudyGroups);
      setIsLoading(false);
    };

    loadStudyGroups();
  }, [userId]);

  const filteredGroups = useMemo(() => {
    let filtered = studyGroups;

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(group => group.category === filters.category);
    }

    // Filter by level
    if (filters.level !== 'all') {
      filtered = filtered.filter(group => group.level === filters.level);
    }

    // Filter by privacy
    if (filters.privacy !== 'all') {
      filtered = filtered.filter(group => 
        filters.privacy === 'private' ? group.isPrivate : !group.isPrivate
      );
    }

    // Filter by search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(query) ||
        group.description.toLowerCase().includes(query) ||
        group.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        case 'popular':
          return b.currentMembers - a.currentMembers;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [studyGroups, filters, sortBy]);

  const handleJoinGroup = async (groupId: string) => {
    // In real app, this would call the API to join the group
    setStudyGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isJoined: true, currentMembers: group.currentMembers + 1 }
        : group
    ));
  };

  const handleLeaveGroup = async (groupId: string) => {
    // In real app, this would call the API to leave the group
    setStudyGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isJoined: false, currentMembers: group.currentMembers - 1 }
        : group
    ));
  };

  const handleCreateGroup = async (groupData: StudyGroupCreateRequest) => {
    // In real app, this would call the API to create the group
    const newGroup: StudyGroupData = {
      id: `group-${Date.now()}`,
      name: groupData.name,
      description: groupData.description,
      category: groupData.category,
      level: groupData.level,
      maxMembers: groupData.maxMembers,
      currentMembers: 1,
      isPrivate: groupData.isPrivate,
      isJoined: true,
      isOwner: true,
      isModerator: true,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      tags: groupData.tags,
      rules: groupData.rules,
      weeklyGoal: groupData.weeklyGoal,
      meetingSchedule: groupData.meetingSchedule,
      owner: {
        id: userId,
        username: 'WriteWaveUser',
        displayName: 'WriteWave User',
        avatar: '🚀',
        level: 8
      },
      members: [],
      recentActivity: []
    };

    setStudyGroups(prev => [newGroup, ...prev]);
    setShowCreateModal(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'hiragana': return 'text-blue-600 bg-blue-50';
      case 'katakana': return 'text-purple-600 bg-purple-50';
      case 'kanji': return 'text-orange-600 bg-orange-50';
      case 'mixed': return 'text-green-600 bg-green-50';
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      case 'mixed': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading study groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Study Groups</h2>
          <p className="body text-gray-600">
            Join groups to learn together and stay motivated
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Group</span>
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
              placeholder="Search groups..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="hiragana">Hiragana</option>
            <option value="katakana">Katakana</option>
            <option value="kanji">Kanji</option>
            <option value="mixed">Mixed</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Level Filter */}
          <select
            value={filters.level}
            onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
            className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="mixed">Mixed</option>
          </select>

          {/* Privacy Filter */}
          <select
            value={filters.privacy}
            onChange={(e) => setFilters(prev => ({ ...prev, privacy: e.target.value }))}
            className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Groups</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        {/* Sort Options */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <div className="flex items-center space-x-2">
            {(['recent', 'popular', 'newest'] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  sortBy === sort
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {sort === 'recent' ? 'Most Recent' : sort === 'popular' ? 'Most Popular' : 'Newest'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Study Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredGroups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white border-base rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedGroup(group);
                setShowGroupDetails(true);
              }}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="heading text-lg font-semibold text-gray-900 mb-1">
                      {group.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {group.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {group.isPrivate ? (
                      <Lock className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Unlock className="w-4 h-4 text-gray-400" />
                    )}
                    {group.isJoined && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(group.category)}`}>
                    {group.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(group.level)}`}>
                    {group.level}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{group.currentMembers}/{group.maxMembers}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{group.recentActivity.length} activities</span>
                    </div>
                  </div>
                  <div className="text-xs">
                    {new Date(group.lastActivity).toLocaleDateString()}
                  </div>
                </div>

                {/* Weekly Goal */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-gray-900">Weekly Goal</span>
                  </div>
                  <p className="text-sm text-gray-600">{group.weeklyGoal}</p>
                </div>

                {/* Owner */}
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{group.owner.avatar}</div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {group.owner.displayName}
                    </div>
                    <div className="text-xs text-gray-600">
                      Level {group.owner.level} • Owner
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {group.isJoined ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLeaveGroup(group.id);
                      }}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                      Leave Group
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinGroup(group.id);
                      }}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                    >
                      Join Group
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGroup(group);
                      setShowGroupDetails(true);
                    }}
                    className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="heading text-xl font-semibold text-gray-900 mb-2">No study groups found</h3>
          <p className="body text-gray-600 mb-4">
            {filters.search || filters.category !== 'all' || filters.level !== 'all' || filters.privacy !== 'all'
              ? 'Try adjusting your filters or search terms'
              : 'Be the first to create a study group!'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Create Study Group
          </button>
        </div>
      )}

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <StudyGroupCreateModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateGroup}
          />
        )}
      </AnimatePresence>

      {/* Group Details Modal */}
      <AnimatePresence>
        {showGroupDetails && selectedGroup && (
          <StudyGroupDetailsModal
            group={selectedGroup}
            onClose={() => setShowGroupDetails(false)}
            onJoin={() => handleJoinGroup(selectedGroup.id)}
            onLeave={() => handleLeaveGroup(selectedGroup.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Study Group Create Modal Component
interface StudyGroupCreateModalProps {
  onClose: () => void;
  onCreate: (groupData: StudyGroupCreateRequest) => void;
}

const StudyGroupCreateModal: React.FC<StudyGroupCreateModalProps> = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'mixed' as const,
    level: 'mixed' as const,
    maxMembers: 20,
    isPrivate: false,
    tags: [] as string[],
    rules: [] as string[],
    weeklyGoal: '',
    meetingSchedule: ''
  });

  const [newTag, setNewTag] = useState('');
  const [newRule, setNewRule] = useState('');

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

  const addRule = () => {
    if (newRule.trim() && !formData.rules.includes(newRule.trim())) {
      setFormData(prev => ({ ...prev, rules: [...prev.rules, newRule.trim()] }));
      setNewRule('');
    }
  };

  const removeRule = (rule: string) => {
    setFormData(prev => ({ ...prev, rules: prev.rules.filter(r => r !== rule) }));
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
            <h2 className="heading text-2xl font-bold text-gray-900">Create Study Group</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Members
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={formData.maxMembers}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                  className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Describe your study group"
              />
            </div>

            {/* Category and Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="mixed">Mixed</option>
                  <option value="hiragana">Hiragana</option>
                  <option value="katakana">Katakana</option>
                  <option value="kanji">Kanji</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
                  className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="mixed">Mixed</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Privacy */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isPrivate"
                checked={formData.isPrivate}
                onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                className="w-4 h-4 text-primary border-base rounded focus:ring-primary"
              />
              <label htmlFor="isPrivate" className="text-sm font-medium text-gray-700">
                Private group (invitation only)
              </label>
            </div>

            {/* Weekly Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weekly Goal
              </label>
              <input
                type="text"
                value={formData.weeklyGoal}
                onChange={(e) => setFormData(prev => ({ ...prev, weeklyGoal: e.target.value }))}
                className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Learn 5 new characters"
              />
            </div>

            {/* Meeting Schedule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Schedule
              </label>
              <input
                type="text"
                value={formData.meetingSchedule}
                onChange={(e) => setFormData(prev => ({ ...prev, meetingSchedule: e.target.value }))}
                className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Every Sunday at 2 PM JST"
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

            {/* Rules */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Rules
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
                  className="flex-1 p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add a rule"
                />
                <button
                  type="button"
                  onClick={addRule}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.rules.map((rule) => (
                  <div
                    key={rule}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{rule}</span>
                    <button
                      type="button"
                      onClick={() => removeRule(rule)}
                      className="text-gray-400 hover:text-gray-600"
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
                Create Group
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Study Group Details Modal Component
interface StudyGroupDetailsModalProps {
  group: StudyGroupData;
  onClose: () => void;
  onJoin: () => void;
  onLeave: () => void;
}

const StudyGroupDetailsModal: React.FC<StudyGroupDetailsModalProps> = ({ 
  group, 
  onClose, 
  onJoin, 
  onLeave 
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
            <h2 className="heading text-2xl font-bold text-gray-900">{group.name}</h2>
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
              {/* Description */}
              <div>
                <h3 className="heading text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{group.description}</p>
              </div>

              {/* Weekly Goal */}
              <div>
                <h3 className="heading text-lg font-semibold mb-2">Weekly Goal</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{group.weeklyGoal}</p>
                </div>
              </div>

              {/* Meeting Schedule */}
              <div>
                <h3 className="heading text-lg font-semibold mb-2">Meeting Schedule</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{group.meetingSchedule}</p>
                </div>
              </div>

              {/* Rules */}
              <div>
                <h3 className="heading text-lg font-semibold mb-2">Group Rules</h3>
                <div className="space-y-2">
                  {group.rules.map((rule, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="heading text-lg font-semibold mb-2">Recent Activity</h3>
                <div className="space-y-3">
                  {group.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">{activity.user}</span> {activity.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Group Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="heading text-lg font-semibold mb-3">Group Info</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Members</span>
                    <span className="text-sm font-medium">{group.currentMembers}/{group.maxMembers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Privacy</span>
                    <span className="text-sm font-medium">
                      {group.isPrivate ? 'Private' : 'Public'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm font-medium">
                      {new Date(group.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Owner */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="heading text-lg font-semibold mb-3">Group Owner</h3>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{group.owner.avatar}</div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {group.owner.displayName}
                    </div>
                    <div className="text-sm text-gray-600">
                      Level {group.owner.level}
                    </div>
                  </div>
                </div>
              </div>

              {/* Members */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="heading text-lg font-semibold mb-3">Members</h3>
                <div className="space-y-2">
                  {group.members.slice(0, 5).map((member) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <div className="text-lg">{member.avatar}</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {member.displayName}
                        </div>
                        <div className="text-xs text-gray-600">
                          Level {member.level} • {member.role}
                        </div>
                      </div>
                    </div>
                  ))}
                  {group.members.length > 5 && (
                    <div className="text-sm text-gray-600">
                      +{group.members.length - 5} more members
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {group.isJoined ? (
                  <button
                    onClick={onLeave}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    Leave Group
                  </button>
                ) : (
                  <button
                    onClick={onJoin}
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                  >
                    Join Group
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors font-medium"
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


