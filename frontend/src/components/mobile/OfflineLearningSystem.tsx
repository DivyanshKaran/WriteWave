"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Download, Cloud, HardDrive, Clock, BarChart, Activity } from 'lucide-react';

interface OfflineLearningSystemProps {
  userId: string;
  className?: string;
}

interface OfflineContent {
  id: string;
  title: string;
  description: string;
  type: 'character' | 'lesson' | 'exercise' | 'vocabulary' | 'audio' | 'image';
  size: number;
  downloaded: boolean;
  downloadProgress: number;
  lastAccessed: string;
  accessCount: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  tags: string[];
  metadata: {
    difficulty: number;
    estimatedTime: number;
    language: string;
    format: string;
  };
}

interface OfflineSession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  content: string[];
  progress: number;
  completed: boolean;
  synced: boolean;
  device: 'mobile' | 'tablet' | 'desktop';
  networkStatus: 'online' | 'offline' | 'limited';
}

interface SyncStatus {
  lastSync: string;
  nextSync: string;
  pendingItems: number;
  failedItems: number;
  totalItems: number;
  progress: number;
  status: 'idle' | 'syncing' | 'error' | 'completed';
  errors: string[];
}

interface StorageInfo {
  total: number;
  used: number;
  available: number;
  offlineContent: number;
  cachedData: number;
  temporaryFiles: number;
  breakdown: {
    characters: number;
    lessons: number;
    exercises: number;
    audio: number;
    images: number;
    other: number;
  };
}

export const OfflineLearningSystem: React.FC<OfflineLearningSystemProps> = ({
  userId,
  className = ''
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineContent, setOfflineContent] = useState<OfflineContent[]>([]);
  const [offlineSessions, setOfflineSessions] = useState<OfflineSession[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: '',
    nextSync: '',
    pendingItems: 0,
    failedItems: 0,
    totalItems: 0,
    progress: 0,
    status: 'idle',
    errors: []
  });
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    total: 0,
    used: 0,
    available: 0,
    offlineContent: 0,
    cachedData: 0,
    temporaryFiles: 0,
    breakdown: {
      characters: 0,
      lessons: 0,
      exercises: 0,
      audio: 0,
      images: 0,
      other: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'content' | 'sessions' | 'sync' | 'storage' | 'settings'>('overview');
  const [selectedContent, setSelectedContent] = useState<OfflineContent | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Mock offline content
  const mockOfflineContent: OfflineContent[] = [
    {
      id: 'content-1',
      title: 'Hiragana Characters',
      description: 'Complete set of Hiragana characters with stroke order',
      type: 'character',
      size: 2.5,
      downloaded: true,
      downloadProgress: 100,
      lastAccessed: '2024-01-14T10:30:00Z',
      accessCount: 15,
      priority: 'high',
      category: 'Basics',
      tags: ['hiragana', 'characters', 'stroke-order'],
      metadata: {
        difficulty: 1,
        estimatedTime: 30,
        language: 'ja',
        format: 'interactive'
      }
    },
    {
      id: 'content-2',
      title: 'Basic Vocabulary',
      description: 'Essential Japanese vocabulary for beginners',
      type: 'vocabulary',
      size: 1.8,
      downloaded: true,
      downloadProgress: 100,
      lastAccessed: '2024-01-14T09:15:00Z',
      accessCount: 8,
      priority: 'high',
      category: 'Vocabulary',
      tags: ['vocabulary', 'basic', 'words'],
      metadata: {
        difficulty: 1,
        estimatedTime: 20,
        language: 'ja',
        format: 'flashcards'
      }
    },
    {
      id: 'content-3',
      title: 'Pronunciation Guide',
      description: 'Audio pronunciation guide for Japanese sounds',
      type: 'audio',
      size: 5.2,
      downloaded: false,
      downloadProgress: 0,
      lastAccessed: '',
      accessCount: 0,
      priority: 'medium',
      category: 'Pronunciation',
      tags: ['audio', 'pronunciation', 'sounds'],
      metadata: {
        difficulty: 2,
        estimatedTime: 15,
        language: 'ja',
        format: 'audio'
      }
    }
  ];

  // Mock offline sessions
  const mockOfflineSessions: OfflineSession[] = [
    {
      id: 'session-1',
      startTime: '2024-01-14T08:00:00Z',
      endTime: '2024-01-14T08:30:00Z',
      duration: 30,
      content: ['content-1', 'content-2'],
      progress: 85,
      completed: false,
      synced: false,
      device: 'mobile',
      networkStatus: 'offline'
    },
    {
      id: 'session-2',
      startTime: '2024-01-13T19:00:00Z',
      endTime: '2024-01-13T19:45:00Z',
      duration: 45,
      content: ['content-1'],
      progress: 100,
      completed: true,
      synced: true,
      device: 'tablet',
      networkStatus: 'online'
    }
  ];

  useEffect(() => {
    const loadOfflineData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock storage info
      const mockStorageInfo: StorageInfo = {
        total: 64 * 1024, // 64GB
        used: 32 * 1024, // 32GB
        available: 32 * 1024, // 32GB
        offlineContent: 8.5,
        cachedData: 2.3,
        temporaryFiles: 1.2,
        breakdown: {
          characters: 2.5,
          lessons: 3.2,
          exercises: 1.8,
          audio: 5.2,
          images: 0.8,
          other: 0.5
        }
      };

      setOfflineContent(mockOfflineContent);
      setOfflineSessions(mockOfflineSessions);
      setStorageInfo(mockStorageInfo);
      setIsLoading(false);
    };

    loadOfflineData();
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const downloadContent = async (contentId: string) => {
    setIsDownloading(true);
    const content = offlineContent.find(c => c.id === contentId);
    if (!content) return;

    // Simulate download progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setOfflineContent(prev => prev.map(c => 
        c.id === contentId 
          ? { ...c, downloadProgress: progress }
          : c
      ));
    }

    setOfflineContent(prev => prev.map(c => 
      c.id === contentId 
        ? { ...c, downloaded: true, downloadProgress: 100 }
        : c
    ));

    setIsDownloading(false);
  };

  const deleteContent = (contentId: string) => {
    setOfflineContent(prev => prev.map(c => 
      c.id === contentId 
        ? { ...c, downloaded: false, downloadProgress: 0 }
        : c
    ));
  };

  const syncData = async () => {
    setSyncStatus(prev => ({ ...prev, status: 'syncing', progress: 0 }));
    
    // Simulate sync progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setSyncStatus(prev => ({ ...prev, progress }));
    }

    setSyncStatus(prev => ({ 
      ...prev, 
      status: 'completed', 
      progress: 100,
      lastSync: new Date().toISOString()
    }));
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'character': return <Pen className="w-5 h-5 text-blue-500" />;
      case 'lesson': return <BookOpen className="w-5 h-5 text-green-500" />;
      case 'exercise': return <Target className="w-5 h-5 text-purple-500" />;
      case 'vocabulary': return <File className="w-5 h-5 text-orange-500" />;
      case 'audio': return <Mic className="w-5 h-5 text-red-500" />;
      case 'image': return <Image className="w-5 h-5 text-yellow-500" />;
      default: return <File className="w-5 h-5 text-gray-500" />;
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

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'text-gray-600 bg-gray-50';
      case 'syncing': return 'text-blue-600 bg-blue-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'completed': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading offline system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Offline Learning System</h2>
          <p className="body text-gray-600">
            Learn anywhere, anytime with offline content and sync capabilities
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            isOnline ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
          }`}>
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <button
            onClick={syncData}
            disabled={!isOnline || syncStatus.status === 'syncing'}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart },
          { id: 'content', label: 'Content', icon: Download },
          { id: 'sessions', label: 'Sessions', icon: Clock },
          { id: 'sync', label: 'Sync', icon: Cloud },
          { id: 'storage', label: 'Storage', icon: HardDrive },
          { id: 'settings', label: 'Settings', icon: Settings }
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
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Status Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Download className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-500">Downloaded</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {offlineContent.filter(c => c.downloaded).length}
              </div>
              <div className="text-xs text-gray-600">Content items</div>
            </div>
            
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <HardDrive className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-500">Storage</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatBytes(storageInfo.offlineContent * 1024 * 1024)}
              </div>
              <div className="text-xs text-gray-600">Offline content</div>
            </div>
            
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-purple-500" />
                <span className="text-xs text-gray-500">Sessions</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {offlineSessions.length}
              </div>
              <div className="text-xs text-gray-600">Offline sessions</div>
            </div>
            
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Cloud className="w-5 h-5 text-orange-500" />
                <span className="text-xs text-gray-500">Sync</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {syncStatus.pendingItems}
              </div>
              <div className="text-xs text-gray-600">Pending items</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setSelectedView('content')}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-center"
              >
                <Download className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-blue-700">Download Content</span>
              </button>
              
              <button
                onClick={syncData}
                disabled={!isOnline || syncStatus.status === 'syncing'}
                className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-center disabled:opacity-50"
              >
                <Cloud className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-green-700">Sync Data</span>
              </button>
              
              <button
                onClick={() => setSelectedView('storage')}
                className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-center"
              >
                <HardDrive className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-purple-700">Manage Storage</span>
              </button>
              
              <button
                onClick={() => setSelectedView('sessions')}
                className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-center"
              >
                <Clock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-orange-700">View Sessions</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Tab */}
      {selectedView === 'content' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Offline Content</h3>
            <div className="space-y-4">
              {offlineContent.map((content, index) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getContentIcon(content.type)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{content.title}</h4>
                        <p className="text-sm text-gray-600">{content.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-sm ${getPriorityColor(content.priority)}`}>
                        {content.priority}
                      </span>
                      <span className="text-sm text-gray-600">{formatBytes(content.size * 1024 * 1024)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        Category: {content.category}
                      </span>
                      <span className="text-sm text-gray-600">
                        Difficulty: {content.metadata.difficulty}/5
                      </span>
                      <span className="text-sm text-gray-600">
                        Time: {content.metadata.estimatedTime}min
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {content.downloaded ? (
                        <button
                          onClick={() => deleteContent(content.id)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          onClick={() => downloadContent(content.id)}
                          disabled={isDownloading}
                          className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
                        >
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {!content.downloaded && content.downloadProgress > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Downloading...</span>
                        <span className="text-sm text-gray-600">{content.downloadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${content.downloadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {selectedView === 'sessions' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Offline Sessions</h3>
            <div className="space-y-4">
              {offlineSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Session {new Date(session.startTime).toLocaleDateString()}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(session.startTime).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        session.synced ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'
                      }`}>
                        {session.synced ? 'Synced' : 'Pending'}
                      </span>
                      <span className="text-sm text-gray-600">{session.duration}min</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        Progress: {session.progress}%
                      </span>
                      <span className="text-sm text-gray-600">
                        Content: {session.content.length} items
                      </span>
                      <span className="text-sm text-gray-600 capitalize">
                        Device: {session.device}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {session.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sync Tab */}
      {selectedView === 'sync' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Sync Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded text-sm ${getSyncStatusColor(syncStatus.status)}`}>
                  {syncStatus.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Sync</span>
                <span className="text-sm text-gray-900">
                  {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : 'Never'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Items</span>
                <span className="text-sm text-gray-900">{syncStatus.pendingItems}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Failed Items</span>
                <span className="text-sm text-gray-900">{syncStatus.failedItems}</span>
              </div>
              
              {syncStatus.status === 'syncing' && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Syncing...</span>
                    <span className="text-sm text-gray-600">{syncStatus.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${syncStatus.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Storage Tab */}
      {selectedView === 'storage' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Storage Information</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Storage</span>
                <span className="text-sm text-gray-900">{formatBytes(storageInfo.total * 1024 * 1024)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Used Storage</span>
                <span className="text-sm text-gray-900">{formatBytes(storageInfo.used * 1024 * 1024)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available Storage</span>
                <span className="text-sm text-gray-900">{formatBytes(storageInfo.available * 1024 * 1024)}</span>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Storage Usage</span>
                  <span className="text-sm text-gray-600">
                    {Math.round((storageInfo.used / storageInfo.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(storageInfo.used / storageInfo.total) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Storage Breakdown</h4>
                <div className="space-y-2">
                  {Object.entries(storageInfo.breakdown).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{key}</span>
                      <span className="text-sm text-gray-900">{formatBytes(value * 1024 * 1024)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
