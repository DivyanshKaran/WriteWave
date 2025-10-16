"use client";

import React, { useState } from 'react';
import { CleanPageLayout, CleanCard, CleanButton } from '@/components/layout';
import { MessageSquare, Users, Trophy, Zap, PlusCircle, Heart, Share2, Star, TrendingUp } from 'lucide-react';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'discussions' | 'groups' | 'leaderboard' | 'activity'>('discussions');

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Community', href: '/community' }
  ];

  const communityStats = [
    { label: 'Active Members', value: '2,847', icon: <Users className="w-5 h-5 text-gray-700" /> },
    { label: 'Discussions', value: '156', icon: <MessageSquare className="w-5 h-5 text-green-600" /> },
    { label: 'Study Groups', value: '23', icon: <Users className="w-5 h-5 text-purple-600" /> },
    { label: 'Your Rank', value: '#47', icon: <Trophy className="w-5 h-5 text-gray-700" /> }
  ];

  const recentDiscussions = [
    {
      id: 1,
      title: 'Best way to memorize Kanji radicals?',
      author: 'Alex Chen',
      replies: 12,
      views: 89,
      lastActivity: '2 hours ago',
      category: 'Learning Tips',
      tags: ['kanji', 'memorization', 'radicals']
    },
    {
      id: 2,
      title: 'Japanese pronunciation help needed',
      author: 'Maria Santos',
      replies: 8,
      views: 45,
      lastActivity: '4 hours ago',
      category: 'Pronunciation',
      tags: ['pronunciation', 'help', 'beginner']
    },
    {
      id: 3,
      title: 'Study group for JLPT N3 preparation',
      author: 'John Smith',
      replies: 15,
      views: 123,
      lastActivity: '1 day ago',
      category: 'Study Groups',
      tags: ['jlpt', 'n3', 'study-group']
    }
  ];

  const studyGroups = [
    {
      id: 1,
      name: 'Hiragana Beginners',
      members: 24,
      description: 'Perfect for absolute beginners starting with Hiragana',
      level: 'Beginner',
      activity: 'Very Active'
    },
    {
      id: 2,
      name: 'Kanji Masters',
      members: 18,
      description: 'Advanced Kanji study and practice group',
      level: 'Advanced',
      activity: 'Active'
    },
    {
      id: 3,
      name: 'Conversation Practice',
      members: 31,
      description: 'Practice speaking Japanese with native speakers',
      level: 'Intermediate',
      activity: 'Very Active'
    }
  ];

  const leaderboard = [
    { rank: 1, name: 'Alex Chen', xp: 25847, streak: 45, avatar: 'AC' },
    { rank: 2, name: 'Maria Santos', xp: 23156, streak: 38, avatar: 'MS' },
    { rank: 3, name: 'John Smith', xp: 22890, streak: 42, avatar: 'JS' },
    { rank: 4, name: 'You', xp: 18234, streak: 12, avatar: 'YO' },
    { rank: 5, name: 'Lisa Wang', xp: 17891, streak: 28, avatar: 'LW' }
  ];

  const recentActivity = [
    { id: 1, user: 'Alex Chen', action: 'completed Hiragana lesson', time: '5 minutes ago', icon: <Star className="w-4 h-4 text-gray-700" /> },
    { id: 2, user: 'Maria Santos', action: 'joined Study Group', time: '15 minutes ago', icon: <Users className="w-4 h-4 text-purple-600" /> },
    { id: 3, user: 'John Smith', action: 'earned achievement', time: '1 hour ago', icon: <Trophy className="w-4 h-4 text-purple-600" /> },
    { id: 4, user: 'Lisa Wang', action: 'started new discussion', time: '2 hours ago', icon: <MessageSquare className="w-4 h-4 text-green-600" /> }
  ];

  const tabs = [
    { id: 'discussions', label: 'Discussions', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'groups', label: 'Study Groups', icon: <Users className="w-4 h-4" /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <Zap className="w-4 h-4" /> }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'discussions':
        return (
          <div className="space-y-4">
            {recentDiscussions.map((discussion) => (
              <div key={discussion.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{discussion.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span>by {discussion.author}</span>
                      <span>{discussion.replies} replies</span>
                      <span>{discussion.views} views</span>
                      <span>{discussion.lastActivity}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        {discussion.category}
                      </span>
                      {discussion.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <CleanButton variant="ghost" size="sm">
                      <Heart className="w-4 h-4" />
                    </CleanButton>
                    <CleanButton variant="ghost" size="sm">
                      <Share2 className="w-4 h-4" />
                    </CleanButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'groups':
        return (
          <div className="space-y-4">
            {studyGroups.map((group) => (
              <div key={group.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{group.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{group.members} members</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                        {group.activity}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                        {group.level}
                      </span>
                    </div>
                  </div>
                  <CleanButton variant="primary" size="sm">
                    Join Group
                  </CleanButton>
                </div>
              </div>
            ))}
          </div>
        );

      case 'leaderboard':
        return (
          <div className="space-y-3">
            {leaderboard.map((user) => (
              <div key={user.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {user.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-600">
                      {user.xp.toLocaleString()} XP • {user.streak} day streak
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">#{user.rank}</div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'activity':
        return (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{activity.user}</span>
                  <span className="text-gray-600"> {activity.action}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
      <CleanPageLayout
        title="Community Hub"
        description="Connect with fellow learners and share your journey"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <CleanButton variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              New Discussion
            </CleanButton>
            <CleanButton variant="primary" size="sm">
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Group
            </CleanButton>
          </div>
        }
      >
        <div className="p-6 space-y-6">
          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {communityStats.map((stat, index) => (
              <CleanCard key={index} padding="sm" className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}
                </div>
              </CleanCard>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'discussions' | 'groups' | 'leaderboard' | 'activity')}
                  className={`
                    ${activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2
                  `}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <CleanCard>
            {renderTabContent()}
          </CleanCard>

        </div>
      </CleanPageLayout>
  );
}