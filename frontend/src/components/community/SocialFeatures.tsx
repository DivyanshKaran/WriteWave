"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, UserCheck, UserX, Heart, MessageCircle, Share2, MoreHorizontal, Search, Filter, Crown, Star, Flame, Trophy, Eye, EyeOff, Settings, Bell, BellOff } from 'lucide-react';

interface SocialFeaturesProps {
  userId: string;
  className?: string;
}

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  location: string;
  bio: string;
  joinedAt: string;
  lastActive: string;
  isOnline: boolean;
  isFollowing: boolean;
  isFollower: boolean;
  isFriend: boolean;
  mutualFriends: number;
  sharedInterests: string[];
  achievements: string[];
  studyGroups: string[];
  learningGoals: string[];
  characterTypes: ('hiragana' | 'katakana' | 'kanji')[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  privacy: {
    profileVisible: boolean;
    activityVisible: boolean;
    friendRequests: 'everyone' | 'friends' | 'none';
    notifications: boolean;
  };
  stats: {
    totalStudyTime: number;
    charactersMastered: number;
    achievements: number;
    challengesCompleted: number;
    feedbackGiven: number;
    feedbackReceived: number;
  };
}

interface FriendRequest {
  id: string;
  fromUser: User;
  toUser: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  respondedAt?: string;
}

interface Activity {
  id: string;
  userId: string;
  user: User;
  type: 'achievement' | 'level-up' | 'streak' | 'challenge' | 'study-session' | 'feedback';
  title: string;
  description: string;
  timestamp: string;
  data?: any;
  likes: number;
  comments: number;
  isLiked: boolean;
  isCommented: boolean;
}

interface SocialStats {
  friends: number;
  followers: number;
  following: number;
  friendRequests: number;
  mutualConnections: number;
  activityScore: number;
  socialRank: number;
}

export const SocialFeatures: React.FC<SocialFeaturesProps> = ({
  userId,
  className = ''
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFriendRequestModal, setShowFriendRequestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [filters, setFilters] = useState({
    relationship: 'all' as 'all' | 'friends' | 'followers' | 'following' | 'suggestions',
    skillLevel: 'all' as 'all' | User['skillLevel'],
    characterTypes: [] as User['characterTypes'],
    location: 'all' as 'all' | 'same-country' | 'same-timezone',
    onlineOnly: false,
    search: ''
  });
  const [sortBy, setSortBy] = useState<'recent' | 'level' | 'activity' | 'mutual'>('recent');
  const [viewMode, setViewMode] = useState<'discover' | 'friends' | 'requests' | 'activity' | 'stats'>('discover');

  // Mock data - in real app, this would come from community service
  useEffect(() => {
    const loadSocialData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock users
      const mockUsers: User[] = [
        {
          id: 'user-1',
          username: 'SakuraSensei',
          displayName: 'Sakura Sensei',
          avatar: '🌸',
          level: 12,
          xp: 25420,
          streak: 45,
          location: 'Tokyo, Japan',
          bio: 'Japanese language teacher and calligraphy enthusiast. Love helping others learn!',
          joinedAt: '2023-06-15T10:00:00Z',
          lastActive: '2024-01-21T19:30:00Z',
          isOnline: true,
          isFollowing: true,
          isFollower: true,
          isFriend: true,
          mutualFriends: 3,
          sharedInterests: ['Calligraphy', 'Japanese Culture', 'Teaching'],
          achievements: ['100 Day Streak', 'Kanji Master', 'Helpful Mentor'],
          studyGroups: ['Hiragana Heroes', 'Calligraphy Club'],
          learningGoals: ['JLPT N1', 'Advanced Calligraphy'],
          characterTypes: ['hiragana', 'katakana', 'kanji'],
          skillLevel: 'advanced',
          privacy: {
            profileVisible: true,
            activityVisible: true,
            friendRequests: 'everyone',
            notifications: true
          },
          stats: {
            totalStudyTime: 1250,
            charactersMastered: 89,
            achievements: 23,
            challengesCompleted: 15,
            feedbackGiven: 45,
            feedbackReceived: 32
          }
        },
        {
          id: 'user-2',
          username: 'KanjiMaster',
          displayName: 'Kanji Master',
          avatar: '🎌',
          level: 15,
          xp: 32150,
          streak: 120,
          location: 'Osaka, Japan',
          bio: 'Kanji enthusiast and Japanese history lover. Always learning something new!',
          joinedAt: '2023-03-20T14:30:00Z',
          lastActive: '2024-01-21T18:45:00Z',
          isOnline: false,
          isFollowing: false,
          isFollower: true,
          isFriend: false,
          mutualFriends: 1,
          sharedInterests: ['Kanji', 'Japanese History', 'Anime'],
          achievements: ['Kanji Expert', '2000 Characters', 'Study Leader'],
          studyGroups: ['Kanji Masters', 'History Buffs'],
          learningGoals: ['JLPT N1', 'Classical Japanese'],
          characterTypes: ['kanji'],
          skillLevel: 'advanced',
          privacy: {
            profileVisible: true,
            activityVisible: true,
            friendRequests: 'everyone',
            notifications: true
          },
          stats: {
            totalStudyTime: 2100,
            charactersMastered: 156,
            achievements: 31,
            challengesCompleted: 28,
            feedbackGiven: 67,
            feedbackReceived: 89
          }
        },
        {
          id: 'user-3',
          username: 'HiraganaHero',
          displayName: 'Hiragana Hero',
          avatar: '⚡',
          level: 8,
          xp: 12890,
          streak: 25,
          location: 'Seoul, South Korea',
          bio: 'Beginner Japanese learner from Korea. Excited to master Hiragana and Katakana!',
          joinedAt: '2023-11-10T09:15:00Z',
          lastActive: '2024-01-21T17:20:00Z',
          isOnline: true,
          isFollowing: false,
          isFollower: false,
          isFriend: false,
          mutualFriends: 2,
          sharedInterests: ['Travel', 'Language Learning', 'Korean Culture'],
          achievements: ['First 50 Characters', 'Daily Learner'],
          studyGroups: ['Hiragana Heroes', 'Travel Japanese'],
          learningGoals: ['Basic Japanese', 'Travel Japanese'],
          characterTypes: ['hiragana', 'katakana'],
          skillLevel: 'beginner',
          privacy: {
            profileVisible: true,
            activityVisible: true,
            friendRequests: 'everyone',
            notifications: true
          },
          stats: {
            totalStudyTime: 450,
            charactersMastered: 42,
            achievements: 8,
            challengesCompleted: 5,
            feedbackGiven: 12,
            feedbackReceived: 18
          }
        }
      ];

      // Mock friend requests
      const mockFriendRequests: FriendRequest[] = [
        {
          id: 'request-1',
          fromUser: users.find(u => u.id === 'user-2') || users[1],
          toUser: userId,
          message: 'Hi! I saw your progress on Kanji and I\'d love to connect. Your dedication is inspiring!',
          status: 'pending',
          createdAt: '2024-01-21T15:30:00Z'
        },
        {
          id: 'request-2',
          fromUser: users.find(u => u.id === 'user-3') || users[2],
          toUser: userId,
          message: 'We have similar learning goals! Would you like to be friends?',
          status: 'pending',
          createdAt: '2024-01-20T10:15:00Z'
        }
      ];

      // Mock activities
      const mockActivities: Activity[] = [
        {
          id: 'activity-1',
          userId: 'user-1',
          user: users.find(u => u.id === 'user-1') || users[0],
          type: 'achievement',
          title: 'Unlocked new achievement!',
          description: 'Sakura Sensei just unlocked the "Kanji Master" achievement! 🎉',
          timestamp: '2024-01-21T19:30:00Z',
          likes: 12,
          comments: 3,
          isLiked: true,
          isCommented: false
        },
        {
          id: 'activity-2',
          userId: 'user-2',
          user: users.find(u => u.id === 'user-2') || users[1],
          type: 'level-up',
          title: 'Level up!',
          description: 'Kanji Master reached Level 15! Amazing progress! 🚀',
          timestamp: '2024-01-21T18:45:00Z',
          likes: 8,
          comments: 2,
          isLiked: false,
          isCommented: true
        },
        {
          id: 'activity-3',
          userId: 'user-3',
          user: users.find(u => u.id === 'user-3') || users[2],
          type: 'streak',
          title: 'Streak milestone!',
          description: 'Hiragana Hero maintained a 25-day learning streak! 🔥',
          timestamp: '2024-01-21T17:20:00Z',
          likes: 5,
          comments: 1,
          isLiked: false,
          isCommented: false
        }
      ];

      setUsers(mockUsers);
      setFriendRequests(mockFriendRequests);
      setActivities(mockActivities);
      setIsLoading(false);
    };

    loadSocialData();
  }, [userId]);

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filter by relationship
    if (filters.relationship === 'friends') {
      filtered = filtered.filter(user => user.isFriend);
    } else if (filters.relationship === 'followers') {
      filtered = filtered.filter(user => user.isFollower);
    } else if (filters.relationship === 'following') {
      filtered = filtered.filter(user => user.isFollowing);
    } else if (filters.relationship === 'suggestions') {
      filtered = filtered.filter(user => !user.isFriend && !user.isFollowing);
    }

    // Filter by skill level
    if (filters.skillLevel !== 'all') {
      filtered = filtered.filter(user => user.skillLevel === filters.skillLevel);
    }

    // Filter by character types
    if (filters.characterTypes.length > 0) {
      filtered = filtered.filter(user =>
        filters.characterTypes.some(type => user.characterTypes.includes(type))
      );
    }

    // Filter by location
    if (filters.location !== 'all') {
      filtered = filtered.filter(user => {
        if (filters.location === 'same-country') {
          return user.location.includes('Japan');
        }
        if (filters.location === 'same-timezone') {
          return user.location.includes('Japan') || user.location.includes('Korea');
        }
        return true;
      });
    }

    // Filter by online status
    if (filters.onlineOnly) {
      filtered = filtered.filter(user => user.isOnline);
    }

    // Filter by search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.displayName.toLowerCase().includes(query) ||
        user.bio.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        case 'level':
          return b.level - a.level;
        case 'activity':
          return b.stats.totalStudyTime - a.stats.totalStudyTime;
        case 'mutual':
          return b.mutualFriends - a.mutualFriends;
        default:
          return 0;
      }
    });

    return filtered;
  }, [users, filters, sortBy]);

  const socialStats: SocialStats = {
    friends: users.filter(u => u.isFriend).length,
    followers: users.filter(u => u.isFollower).length,
    following: users.filter(u => u.isFollowing).length,
    friendRequests: friendRequests.filter(r => r.status === 'pending').length,
    mutualConnections: users.reduce((sum, u) => sum + u.mutualFriends, 0),
    activityScore: 85,
    socialRank: 12
  };

  const handleFollowUser = async (userId: string) => {
    setUsers(prev => prev.map(user =>
      user.id === userId
        ? { ...user, isFollowing: !user.isFollowing }
        : user
    ));
  };

  const handleSendFriendRequest = (user: User, message: string) => {
    const newRequest: FriendRequest = {
      id: `request-${Date.now()}`,
      fromUser: {
        id: userId,
        username: 'WriteWaveUser',
        displayName: 'WriteWave User',
        avatar: '🚀',
        level: 8,
        xp: 15420,
        streak: 12,
        location: 'Tokyo, Japan',
        bio: 'Japanese learner',
        joinedAt: '2023-12-01T10:00:00Z',
        lastActive: '2024-01-21T19:30:00Z',
        isOnline: true,
        isFollowing: false,
        isFollower: false,
        isFriend: false,
        mutualFriends: 0,
        sharedInterests: [],
        achievements: [],
        studyGroups: [],
        learningGoals: [],
        characterTypes: ['hiragana', 'katakana'],
        skillLevel: 'intermediate',
        privacy: {
          profileVisible: true,
          activityVisible: true,
          friendRequests: 'everyone',
          notifications: true
        },
        stats: {
          totalStudyTime: 650,
          charactersMastered: 45,
          achievements: 12,
          challengesCompleted: 8,
          feedbackGiven: 15,
          feedbackReceived: 23
        }
      },
      toUser: user.id,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setFriendRequests(prev => [newRequest, ...prev]);
    setShowFriendRequestModal(false);
    setSelectedUser(null);
  };

  const handleRespondToFriendRequest = (requestId: string, response: 'accepted' | 'declined') => {
    setFriendRequests(prev => prev.map(request =>
      request.id === requestId
        ? { ...request, status: response, respondedAt: new Date().toISOString() }
        : request
    ));

    if (response === 'accepted') {
      const request = friendRequests.find(r => r.id === requestId);
      if (request) {
        setUsers(prev => prev.map(user =>
          user.id === request.fromUser.id
            ? { ...user, isFriend: true, isFollower: true }
            : user
        ));
      }
    }
  };

  const handleLikeActivity = (activityId: string) => {
    setActivities(prev => prev.map(activity =>
      activity.id === activityId
        ? {
            ...activity,
            isLiked: !activity.isLiked,
            likes: activity.isLiked ? activity.likes - 1 : activity.likes + 1
          }
        : activity
    ));
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'level-up': return <Star className="w-5 h-5 text-blue-500" />;
      case 'streak': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'challenge': return <Crown className="w-5 h-5 text-purple-500" />;
      case 'study-session': return <BookOpen className="w-5 h-5 text-green-500" />;
      case 'feedback': return <MessageCircle className="w-5 h-5 text-indigo-500" />;
      default: return <Users className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading social features...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Social Features</h2>
          <p className="body text-gray-600">
            Connect with other learners and build your learning community
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
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center border-base rounded-lg p-1 w-fit">
        {(['discover', 'friends', 'requests', 'activity', 'stats'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
              viewMode === mode
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {mode === 'discover' ? 'Discover' : 
             mode === 'friends' ? 'Friends' : 
             mode === 'requests' ? 'Requests' : 
             mode === 'activity' ? 'Activity' : 'Statistics'}
          </button>
        ))}
      </div>

      {/* Content based on view mode */}
      {viewMode === 'discover' && (
        <>
          {/* Filters */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Relationship Filter */}
              <select
                value={filters.relationship}
                onChange={(e) => setFilters(prev => ({ ...prev, relationship: e.target.value as any }))}
                className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Users</option>
                <option value="friends">Friends</option>
                <option value="followers">Followers</option>
                <option value="following">Following</option>
                <option value="suggestions">Suggestions</option>
              </select>

              {/* Skill Level Filter */}
              <select
                value={filters.skillLevel}
                onChange={(e) => setFilters(prev => ({ ...prev, skillLevel: e.target.value as any }))}
                className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              {/* Location Filter */}
              <select
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value as any }))}
                className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Locations</option>
                <option value="same-country">Same Country</option>
                <option value="same-timezone">Same Timezone</option>
              </select>

              {/* Online Only Filter */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="onlineOnly"
                  checked={filters.onlineOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, onlineOnly: e.target.checked }))}
                  className="w-4 h-4 text-primary border-base rounded focus:ring-primary"
                />
                <label htmlFor="onlineOnly" className="text-sm text-gray-700">
                  Online Only
                </label>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <div className="flex items-center space-x-2">
                {(['recent', 'level', 'activity', 'mutual'] as const).map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setSortBy(sort)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      sortBy === sort
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {sort === 'recent' ? 'Recently Active' : 
                     sort === 'level' ? 'Level' : 
                     sort === 'activity' ? 'Activity' : 'Mutual Friends'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white border-base rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{user.avatar}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.displayName}</h3>
                          <p className="text-sm text-gray-600">@{user.username}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-gray-600">Level {user.level}</span>
                            {user.isOnline && (
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {user.xp.toLocaleString()} XP
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Flame className="w-3 h-3" />
                          <span>{user.streak}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-gray-700 line-clamp-2">{user.bio}</p>

                    {/* Skills and Interests */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(user.skillLevel)}`}>
                          {user.skillLevel}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {user.characterTypes.slice(0, 2).map((type) => (
                            <span
                              key={type}
                              className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {user.sharedInterests.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {user.sharedInterests.slice(0, 3).map((interest) => (
                            <span
                              key={interest}
                              className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Study Time:</span>
                        <span>{Math.round(user.stats.totalStudyTime / 60)}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Characters:</span>
                        <span>{user.stats.charactersMastered}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Achievements:</span>
                        <span>{user.stats.achievements}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Challenges:</span>
                        <span>{user.stats.challengesCompleted}</span>
                      </div>
                    </div>

                    {/* Mutual Connections */}
                    {user.mutualFriends > 0 && (
                      <div className="text-sm text-gray-600">
                        {user.mutualFriends} mutual friend{user.mutualFriends !== 1 ? 's' : ''}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {user.isFriend ? (
                        <button
                          onClick={() => handleFollowUser(user.id)}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Friends</span>
                        </button>
                      ) : user.isFollowing ? (
                        <button
                          onClick={() => handleFollowUser(user.id)}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Following</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowFriendRequestModal(true);
                          }}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Add Friend</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserProfile(true);
                        }}
                        className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {viewMode === 'friends' && (
        <div className="space-y-4">
          <AnimatePresence>
            {users.filter(u => u.isFriend).map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white border-base rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{user.avatar}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.displayName}</h3>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-600">Level {user.level}</span>
                        {user.isOnline && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {viewMode === 'requests' && (
        <div className="space-y-4">
          <AnimatePresence>
            {friendRequests.filter(r => r.status === 'pending').map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white border-base rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{request.fromUser.avatar}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.fromUser.displayName}</h3>
                      <p className="text-sm text-gray-600">@{request.fromUser.username}</p>
                      <p className="text-sm text-gray-700 mt-2">{request.message}</p>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRespondToFriendRequest(request.id, 'accepted')}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleRespondToFriendRequest(request.id, 'declined')}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <UserX className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {viewMode === 'activity' && (
        <div className="space-y-4">
          <AnimatePresence>
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white border-base rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{activity.user.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getActivityIcon(activity.type)}
                      <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                    </div>
                    <p className="text-gray-700 mb-2">{activity.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleLikeActivity(activity.id)}
                          className={`flex items-center space-x-1 text-sm ${
                            activity.isLiked ? 'text-red-600' : 'text-gray-600'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${activity.isLiked ? 'fill-current' : ''}`} />
                          <span>{activity.likes}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-sm text-gray-600">
                          <MessageCircle className="w-4 h-4" />
                          <span>{activity.comments}</span>
                        </button>
                        <button className="text-sm text-gray-600">
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
      )}

      {viewMode === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Friends</h3>
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {socialStats.friends}
            </div>
            <div className="text-sm text-gray-600">
              Total friends
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Followers</h3>
              <UserPlus className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {socialStats.followers}
            </div>
            <div className="text-sm text-gray-600">
              People following you
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Following</h3>
              <UserCheck className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {socialStats.following}
            </div>
            <div className="text-sm text-gray-600">
              People you follow
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Social Rank</h3>
              <Crown className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              #{socialStats.socialRank}
            </div>
            <div className="text-sm text-gray-600">
              In your network
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {viewMode === 'discover' && filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="heading text-xl font-semibold text-gray-900 mb-2">No users found</h3>
          <p className="body text-gray-600 mb-4">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}

      {/* Friend Request Modal */}
      <AnimatePresence>
        {showFriendRequestModal && selectedUser && (
          <FriendRequestModal
            user={selectedUser}
            onClose={() => setShowFriendRequestModal(false)}
            onSubmit={handleSendFriendRequest}
          />
        )}
      </AnimatePresence>

      {/* User Profile Modal */}
      <AnimatePresence>
        {showUserProfile && selectedUser && (
          <UserProfileModal
            user={selectedUser}
            onClose={() => setShowUserProfile(false)}
            onFollow={() => handleFollowUser(selectedUser.id)}
            onSendRequest={() => {
              setShowUserProfile(false);
              setShowFriendRequestModal(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Friend Request Modal Component
interface FriendRequestModalProps {
  user: User;
  onClose: () => void;
  onSubmit: (user: User, message: string) => void;
}

const FriendRequestModal: React.FC<FriendRequestModalProps> = ({ user, onClose, onSubmit }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(user, message);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white border-base rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="heading text-2xl font-bold text-gray-900">Send Friend Request</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-4xl">{user.avatar}</div>
            <div>
              <h3 className="font-semibold text-gray-900">{user.displayName}</h3>
              <p className="text-sm text-gray-600">@{user.username}</p>
              <div className="text-sm text-gray-600">
                Level {user.level} • {user.mutualFriends} mutual friends
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Add a personal message to your friend request..."
              />
            </div>

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
                Send Request
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

// User Profile Modal Component
interface UserProfileModalProps {
  user: User;
  onClose: () => void;
  onFollow: () => void;
  onSendRequest: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  user, 
  onClose, 
  onFollow, 
  onSendRequest 
}) => {
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
            <h2 className="heading text-2xl font-bold text-gray-900">User Profile</h2>
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
              {/* Profile Header */}
              <div className="flex items-center space-x-4">
                <div className="text-6xl">{user.avatar}</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{user.displayName}</h3>
                  <p className="text-gray-600">@{user.username}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-600">Level {user.level}</span>
                    <span className="text-sm text-gray-600">{user.xp.toLocaleString()} XP</span>
                    <div className="flex items-center space-x-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-600">{user.streak} day streak</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">About</h4>
                <p className="text-gray-700">{user.bio}</p>
              </div>

              {/* Learning Goals */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Learning Goals</h4>
                <div className="flex flex-wrap gap-2">
                  {user.learningGoals.map((goal) => (
                    <span
                      key={goal}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recent Achievements</h4>
                <div className="flex flex-wrap gap-2">
                  {user.achievements.map((achievement) => (
                    <span
                      key={achievement}
                      className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm font-medium"
                    >
                      {achievement}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Learning Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Study Time</span>
                    <span className="text-sm font-medium">{Math.round(user.stats.totalStudyTime / 60)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Characters</span>
                    <span className="text-sm font-medium">{user.stats.charactersMastered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Achievements</span>
                    <span className="text-sm font-medium">{user.stats.achievements}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Challenges</span>
                    <span className="text-sm font-medium">{user.stats.challengesCompleted}</span>
                  </div>
                </div>
              </div>

              {/* Study Groups */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Study Groups</h3>
                <div className="space-y-1">
                  {user.studyGroups.map((group) => (
                    <div key={group} className="text-sm text-gray-700">• {group}</div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {user.isFriend ? (
                  <button
                    onClick={onFollow}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Friends</span>
                  </button>
                ) : user.isFollowing ? (
                  <button
                    onClick={onFollow}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Following</span>
                  </button>
                ) : (
                  <button
                    onClick={onSendRequest}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Friend</span>
                  </button>
                )}
                
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
