"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Ban, Eye, EyeOff, MessageSquare, Users, Flag, CheckCircle, XCircle, Clock, User, Settings, Filter, Search, MoreHorizontal, Trash2, Edit, Lock, Unlock } from 'lucide-react';

interface CommunityModerationProps {
  userId: string;
  isModerator: boolean;
  className?: string;
}

interface ModerationReport {
  id: string;
  type: 'spam' | 'harassment' | 'inappropriate' | 'off-topic' | 'fake-content' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  reportedBy: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  reportedUser?: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  content: {
    type: 'post' | 'comment' | 'discussion' | 'study-group' | 'user-profile';
    id: string;
    title?: string;
    content: string;
    url?: string;
  };
  reason: string;
  evidence: string[];
  createdAt: string;
  assignedTo?: string;
  resolution?: {
    action: 'warning' | 'content-removal' | 'user-suspension' | 'user-ban' | 'no-action';
    reason: string;
    duration?: number; // days
    resolvedBy: string;
    resolvedAt: string;
  };
  priority: number;
  tags: string[];
}

interface ModerationAction {
  id: string;
  type: 'warning' | 'content-removal' | 'user-suspension' | 'user-ban' | 'content-approval' | 'user-promotion';
  target: {
    type: 'user' | 'content' | 'group';
    id: string;
    name: string;
  };
  moderator: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  reason: string;
  duration?: number; // days
  createdAt: string;
  expiresAt?: string;
  status: 'active' | 'expired' | 'revoked';
  appealStatus?: 'none' | 'pending' | 'approved' | 'denied';
}

interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  activeActions: number;
  averageResolutionTime: number; // hours
  topReportTypes: Array<{ type: string; count: number }>;
  moderationScore: number;
}

interface ModerationSettings {
  autoModeration: {
    enabled: boolean;
    spamDetection: boolean;
    profanityFilter: boolean;
    inappropriateContentDetection: boolean;
  };
  reportThresholds: {
    autoAction: number;
    priorityEscalation: number;
    banThreshold: number;
  };
  notificationSettings: {
    newReports: boolean;
    priorityReports: boolean;
    actionRequired: boolean;
  };
}

export const CommunityModeration: React.FC<CommunityModerationProps> = ({
  userId,
  isModerator,
  className = ''
}) => {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | ModerationReport['status'],
    type: 'all' as 'all' | ModerationReport['type'],
    severity: 'all' as 'all' | ModerationReport['severity'],
    assignedTo: 'all' as 'all' | 'me' | 'unassigned',
    search: ''
  });
  const [sortBy, setSortBy] = useState<'recent' | 'priority' | 'severity'>('recent');
  const [viewMode, setViewMode] = useState<'reports' | 'actions' | 'stats' | 'settings'>('reports');

  // Mock data - in real app, this would come from community service
  useEffect(() => {
    const loadModerationData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock reports
      const mockReports: ModerationReport[] = [
        {
          id: 'report-1',
          type: 'spam',
          severity: 'medium',
          status: 'pending',
          reportedBy: {
            id: 'user-1',
            username: 'SakuraSensei',
            displayName: 'Sakura Sensei',
            avatar: '🌸'
          },
          reportedUser: {
            id: 'user-2',
            username: 'SpamUser',
            displayName: 'Spam User',
            avatar: '🤖'
          },
          content: {
            type: 'post',
            id: 'post-1',
            title: 'Learn Japanese Fast!',
            content: 'Click here to learn Japanese in 30 days! Amazing results guaranteed!',
            url: '/discussions/post-1'
          },
          reason: 'This post contains promotional content and appears to be spam',
          evidence: ['Screenshot of post', 'User history analysis'],
          createdAt: '2024-01-21T19:30:00Z',
          priority: 7,
          tags: ['spam', 'promotional', 'suspicious-links']
        },
        {
          id: 'report-2',
          type: 'harassment',
          severity: 'high',
          status: 'investigating',
          reportedBy: {
            id: 'user-3',
            username: 'HiraganaHero',
            displayName: 'Hiragana Hero',
            avatar: '⚡'
          },
          reportedUser: {
            id: 'user-4',
            username: 'ToxicUser',
            displayName: 'Toxic User',
            avatar: '😈'
          },
          content: {
            type: 'comment',
            id: 'comment-1',
            content: 'Your handwriting is terrible. You should give up learning Japanese.',
            url: '/discussions/post-2#comment-1'
          },
          reason: 'This comment contains harassment and is discouraging to other learners',
          evidence: ['Screenshot of comment', 'Previous interaction history'],
          createdAt: '2024-01-21T18:45:00Z',
          assignedTo: userId,
          priority: 9,
          tags: ['harassment', 'discouraging', 'toxic-behavior']
        },
        {
          id: 'report-3',
          type: 'inappropriate',
          severity: 'low',
          status: 'resolved',
          reportedBy: {
            id: 'user-5',
            username: 'PracticePanda',
            displayName: 'Practice Panda',
            avatar: '🐼'
          },
          content: {
            type: 'discussion',
            id: 'discussion-1',
            title: 'Off-topic discussion',
            content: 'This discussion is not related to Japanese learning',
            url: '/discussions/discussion-1'
          },
          reason: 'Discussion content is not related to Japanese learning',
          evidence: ['Discussion content analysis'],
          createdAt: '2024-01-20T14:20:00Z',
          assignedTo: 'moderator-1',
          resolution: {
            action: 'content-removal',
            reason: 'Content is off-topic and violates community guidelines',
            resolvedBy: 'moderator-1',
            resolvedAt: '2024-01-20T16:30:00Z'
          },
          priority: 3,
          tags: ['off-topic', 'content-violation']
        }
      ];

      // Mock actions
      const mockActions: ModerationAction[] = [
        {
          id: 'action-1',
          type: 'user-suspension',
          target: {
            type: 'user',
            id: 'user-2',
            name: 'SpamUser'
          },
          moderator: {
            id: userId,
            username: 'WriteWaveUser',
            displayName: 'WriteWave User',
            avatar: '🚀'
          },
          reason: 'Repeated spam violations',
          duration: 7,
          createdAt: '2024-01-21T10:00:00Z',
          expiresAt: '2024-01-28T10:00:00Z',
          status: 'active'
        },
        {
          id: 'action-2',
          type: 'content-removal',
          target: {
            type: 'content',
            id: 'post-1',
            name: 'Spam Post'
          },
          moderator: {
            id: 'moderator-1',
            username: 'Moderator1',
            displayName: 'Community Moderator',
            avatar: '🛡️'
          },
          reason: 'Spam content violation',
          createdAt: '2024-01-21T09:30:00Z',
          status: 'active'
        }
      ];

      setReports(mockReports);
      setActions(mockActions);
      setIsLoading(false);
    };

    loadModerationData();
  }, [userId]);

  const filteredReports = useMemo(() => {
    let filtered = reports;

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(report => report.status === filters.status);
    }

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(report => report.type === filters.type);
    }

    // Filter by severity
    if (filters.severity !== 'all') {
      filtered = filtered.filter(report => report.severity === filters.severity);
    }

    // Filter by assignment
    if (filters.assignedTo === 'me') {
      filtered = filtered.filter(report => report.assignedTo === userId);
    } else if (filters.assignedTo === 'unassigned') {
      filtered = filtered.filter(report => !report.assignedTo);
    }

    // Filter by search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(report =>
        report.reason.toLowerCase().includes(query) ||
        report.content.content.toLowerCase().includes(query) ||
        report.reportedBy.username.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'priority':
          return b.priority - a.priority;
        case 'severity':
          const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        default:
          return 0;
      }
    });

    return filtered;
  }, [reports, filters, sortBy, userId]);

  const moderationStats: ModerationStats = {
    totalReports: reports.length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    resolvedReports: reports.filter(r => r.status === 'resolved').length,
    activeActions: actions.filter(a => a.status === 'active').length,
    averageResolutionTime: 4.5,
    topReportTypes: [
      { type: 'spam', count: 15 },
      { type: 'inappropriate', count: 8 },
      { type: 'harassment', count: 5 },
      { type: 'off-topic', count: 3 }
    ],
    moderationScore: 92
  };

  const handleAssignReport = (reportId: string) => {
    setReports(prev => prev.map(report =>
      report.id === reportId
        ? { ...report, assignedTo: userId, status: 'investigating' as const }
        : report
    ));
  };

  const handleResolveReport = (reportId: string, resolution: any) => {
    setReports(prev => prev.map(report =>
      report.id === reportId
        ? { 
            ...report, 
            status: 'resolved' as const,
            resolution: {
              ...resolution,
              resolvedBy: userId,
              resolvedAt: new Date().toISOString()
            }
          }
        : report
    ));
  };

  const handleTakeAction = (actionData: any) => {
    const newAction: ModerationAction = {
      id: `action-${Date.now()}`,
      type: actionData.type,
      target: actionData.target,
      moderator: {
        id: userId,
        username: 'WriteWaveUser',
        displayName: 'WriteWave User',
        avatar: '🚀'
      },
      reason: actionData.reason,
      duration: actionData.duration,
      createdAt: new Date().toISOString(),
      expiresAt: actionData.duration ? new Date(Date.now() + actionData.duration * 24 * 60 * 60 * 1000).toISOString() : undefined,
      status: 'active'
    };

    setActions(prev => [newAction, ...prev]);
    setShowActionModal(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'investigating': return 'text-blue-600 bg-blue-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'dismissed': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spam': return '📧';
      case 'harassment': return '⚠️';
      case 'inappropriate': return '🚫';
      case 'off-topic': return '💬';
      case 'fake-content': return '❌';
      case 'other': return '📋';
      default: return '📋';
    }
  };

  if (!isModerator) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4">🛡️</div>
        <h3 className="heading text-xl font-semibold text-gray-900 mb-2">Moderator Access Required</h3>
        <p className="body text-gray-600 mb-4">
          You need moderator privileges to access community moderation tools
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading moderation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Community Moderation</h2>
          <p className="body text-gray-600">
            Manage community reports and maintain a safe learning environment
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode('settings')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'settings'
                ? 'bg-primary text-white'
                : 'border-base hover:border-primary hover:bg-primary/5'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center border-base rounded-lg p-1 w-fit">
        {(['reports', 'actions', 'stats', 'settings'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
              viewMode === mode
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {mode === 'reports' ? 'Reports' : 
             mode === 'actions' ? 'Actions' : 
             mode === 'stats' ? 'Statistics' : 'Settings'}
          </button>
        ))}
      </div>

      {/* Content based on view mode */}
      {viewMode === 'reports' && (
        <>
          {/* Filters */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
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
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>

              {/* Type Filter */}
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="inappropriate">Inappropriate</option>
                <option value="off-topic">Off-topic</option>
                <option value="fake-content">Fake Content</option>
                <option value="other">Other</option>
              </select>

              {/* Severity Filter */}
              <select
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value as any }))}
                className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Severity</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>

              {/* Assignment Filter */}
              <select
                value={filters.assignedTo}
                onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value as any }))}
                className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Assignments</option>
                <option value="me">Assigned to Me</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <div className="flex items-center space-x-2">
                {(['recent', 'priority', 'severity'] as const).map((sort) => (
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
                     sort === 'priority' ? 'Priority' : 'Severity'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white border-base rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedReport(report);
                    setShowReportDetails(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">{getTypeIcon(report.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                            {report.severity}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            Priority: {report.priority}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                        </h3>
                        
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                          {report.reason}
                        </p>
                        
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>Reported by {report.reportedBy.displayName}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!report.assignedTo && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignReport(report.id);
                          }}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          Assign to Me
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(report);
                          setShowReportDetails(true);
                        }}
                        className="px-3 py-1 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {viewMode === 'actions' && (
        <div className="space-y-4">
          <AnimatePresence>
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white border-base rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">
                      {action.type === 'user-ban' ? '🚫' :
                       action.type === 'user-suspension' ? '⏸️' :
                       action.type === 'content-removal' ? '🗑️' :
                       action.type === 'warning' ? '⚠️' : '✅'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                          {action.type.replace('-', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          action.status === 'active' ? 'text-green-600 bg-green-50' :
                          action.status === 'expired' ? 'text-gray-600 bg-gray-50' :
                          'text-red-600 bg-red-50'
                        }`}>
                          {action.status}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {action.target.name}
                      </h3>
                      
                      <p className="text-sm text-gray-700 mb-2">
                        {action.reason}
                      </p>
                      
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>By {action.moderator.displayName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(action.createdAt).toLocaleDateString()}</span>
                          </div>
                          {action.expiresAt && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>Expires {new Date(action.expiresAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
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
              <h3 className="heading text-lg font-semibold">Total Reports</h3>
              <Flag className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {moderationStats.totalReports}
            </div>
            <div className="text-sm text-gray-600">
              All time reports
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Pending</h3>
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {moderationStats.pendingReports}
            </div>
            <div className="text-sm text-gray-600">
              Awaiting review
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Resolved</h3>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {moderationStats.resolvedReports}
            </div>
            <div className="text-sm text-gray-600">
              Successfully resolved
            </div>
          </div>

          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg font-semibold">Moderation Score</h3>
              <Shield className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {moderationStats.moderationScore}%
            </div>
            <div className="text-sm text-gray-600">
              Community health score
            </div>
          </div>
        </div>
      )}

      {viewMode === 'settings' && (
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <h3 className="heading text-lg font-semibold mb-4">Moderation Settings</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Auto Moderation</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="w-4 h-4 text-primary border-base rounded focus:ring-primary" />
                  <span className="text-sm text-gray-700">Enable auto moderation</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="w-4 h-4 text-primary border-base rounded focus:ring-primary" />
                  <span className="text-sm text-gray-700">Spam detection</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="w-4 h-4 text-primary border-base rounded focus:ring-primary" />
                  <span className="text-sm text-gray-700">Profanity filter</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="w-4 h-4 text-primary border-base rounded focus:ring-primary" />
                  <span className="text-sm text-gray-700">Inappropriate content detection</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Report Thresholds</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto Action Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    defaultValue="3"
                    className="w-full p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Escalation
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    defaultValue="5"
                    className="w-full p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ban Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    defaultValue="7"
                    className="w-full p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Notifications</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="w-4 h-4 text-primary border-base rounded focus:ring-primary" />
                  <span className="text-sm text-gray-700">New reports</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="w-4 h-4 text-primary border-base rounded focus:ring-primary" />
                  <span className="text-sm text-gray-700">Priority reports</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="w-4 h-4 text-primary border-base rounded focus:ring-primary" />
                  <span className="text-sm text-gray-700">Action required</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {viewMode === 'reports' && filteredReports.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛡️</div>
          <h3 className="heading text-xl font-semibold text-gray-900 mb-2">No reports found</h3>
          <p className="body text-gray-600 mb-4">
            {filters.search || filters.status !== 'all' || filters.type !== 'all' || filters.severity !== 'all'
              ? 'Try adjusting your filters'
              : 'Great! No reports to review at the moment'
            }
          </p>
        </div>
      )}

      {/* Report Details Modal */}
      <AnimatePresence>
        {showReportDetails && selectedReport && (
          <ReportDetailsModal
            report={selectedReport}
            onClose={() => setShowReportDetails(false)}
            onAssign={() => handleAssignReport(selectedReport.id)}
            onResolve={handleResolveReport}
            onTakeAction={() => {
              setShowReportDetails(false);
              setShowActionModal(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Action Modal */}
      <AnimatePresence>
        {showActionModal && selectedReport && (
          <ActionModal
            report={selectedReport}
            onClose={() => setShowActionModal(false)}
            onSubmit={handleTakeAction}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Report Details Modal Component
interface ReportDetailsModalProps {
  report: ModerationReport;
  onClose: () => void;
  onAssign: () => void;
  onResolve: (reportId: string, resolution: any) => void;
  onTakeAction: () => void;
}

const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({ 
  report, 
  onClose, 
  onAssign, 
  onResolve, 
  onTakeAction 
}) => {
  const [resolution, setResolution] = useState({
    action: 'no-action' as const,
    reason: ''
  });

  const handleResolve = () => {
    onResolve(report.id, resolution);
    onClose();
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
            <h2 className="heading text-2xl font-bold text-gray-900">Report Details</h2>
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
              {/* Report Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">{getTypeIcon(report.type)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                        {report.severity}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">{report.reason}</p>
              </div>

              {/* Content */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Reported Content</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">{report.content.title || 'Content'}</h5>
                  <p className="text-gray-700">{report.content.content}</p>
                  {report.content.url && (
                    <a
                      href={report.content.url}
                      className="text-primary hover:text-primary-dark text-sm mt-2 inline-block"
                    >
                      View Original Content
                    </a>
                  )}
                </div>
              </div>

              {/* Evidence */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Evidence</h4>
                <div className="space-y-2">
                  {report.evidence.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                      <div className="w-1 h-1 bg-primary rounded-full" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {report.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Report Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Report Info</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reported By</span>
                    <span className="text-sm font-medium">{report.reportedBy.displayName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm font-medium">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Priority</span>
                    <span className="text-sm font-medium">{report.priority}</span>
                  </div>
                  {report.assignedTo && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Assigned To</span>
                      <span className="text-sm font-medium">You</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Resolution */}
              {report.status === 'investigating' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Resolution</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Action
                      </label>
                      <select
                        value={resolution.action}
                        onChange={(e) => setResolution(prev => ({ ...prev, action: e.target.value as any }))}
                        className="w-full p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="no-action">No Action</option>
                        <option value="warning">Warning</option>
                        <option value="content-removal">Remove Content</option>
                        <option value="user-suspension">Suspend User</option>
                        <option value="user-ban">Ban User</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason
                      </label>
                      <textarea
                        rows={3}
                        value={resolution.reason}
                        onChange={(e) => setResolution(prev => ({ ...prev, reason: e.target.value }))}
                        className="w-full p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Explain your decision..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                {!report.assignedTo && (
                  <button
                    onClick={onAssign}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Assign to Me
                  </button>
                )}
                
                {report.status === 'investigating' && (
                  <button
                    onClick={handleResolve}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    Resolve Report
                  </button>
                )}
                
                <button
                  onClick={onTakeAction}
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Take Action
                </button>
                
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

// Action Modal Component
interface ActionModalProps {
  report: ModerationReport;
  onClose: () => void;
  onSubmit: (actionData: any) => void;
}

const ActionModal: React.FC<ActionModalProps> = ({ report, onClose, onSubmit }) => {
  const [actionData, setActionData] = useState({
    type: 'warning' as const,
    target: {
      type: 'user' as const,
      id: report.reportedUser?.id || '',
      name: report.reportedUser?.displayName || ''
    },
    reason: '',
    duration: 1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(actionData);
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
            <h2 className="heading text-2xl font-bold text-gray-900">Take Moderation Action</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Type
              </label>
              <select
                value={actionData.type}
                onChange={(e) => setActionData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="warning">Warning</option>
                <option value="content-removal">Remove Content</option>
                <option value="user-suspension">Suspend User</option>
                <option value="user-ban">Ban User</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <textarea
                required
                rows={3}
                value={actionData.reason}
                onChange={(e) => setActionData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Explain the reason for this action..."
              />
            </div>

            {(actionData.type === 'user-suspension' || actionData.type === 'user-ban') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={actionData.duration}
                  onChange={(e) => setActionData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

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
                Take Action
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};
