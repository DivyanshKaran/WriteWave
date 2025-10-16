"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Heart, MessageCircle, Clock, MapPin, Star, Target, Zap, Calendar, CheckCircle, X, Filter, Search, Settings, Trophy, Flame, BookOpen } from 'lucide-react';

interface StudyBuddyMatchingProps {
  userId: string;
  className?: string;
}

interface StudyBuddy {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  level: number;
  location: string;
  timezone: string;
  learningGoals: string[];
  characterTypes: ('hiragana' | 'katakana' | 'kanji')[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  studySchedule: {
    days: string[];
    timeSlots: string[];
    timezone: string;
  };
  studyPreferences: {
    sessionLength: number; // minutes
    frequency: 'daily' | 'weekly' | 'flexible';
    communicationStyle: 'chat' | 'video' | 'both';
    motivationLevel: 'casual' | 'moderate' | 'intensive';
  };
  personality: {
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    communicationStyle: 'quiet' | 'talkative' | 'balanced';
    motivationType: 'self-driven' | 'peer-supported' | 'competitive';
  };
  compatibility: {
    score: number; // 0-100
    factors: {
      schedule: number;
      goals: number;
      level: number;
      personality: number;
      location: number;
    };
    reasons: string[];
  };
  lastActive: string;
  isOnline: boolean;
  mutualConnections: number;
  sharedInterests: string[];
  achievements: string[];
  streak: number;
  totalStudyTime: number; // minutes
}

interface MatchingPreferences {
  characterTypes: ('hiragana' | 'katakana' | 'kanji')[];
  skillLevel: ('beginner' | 'intermediate' | 'advanced')[];
  studySchedule: {
    days: string[];
    timeSlots: string[];
  };
  studyPreferences: {
    sessionLength: number[];
    frequency: ('daily' | 'weekly' | 'flexible')[];
    communicationStyle: ('chat' | 'video' | 'both')[];
    motivationLevel: ('casual' | 'moderate' | 'intensive')[];
  };
  personality: {
    learningStyle: ('visual' | 'auditory' | 'kinesthetic' | 'mixed')[];
    communicationStyle: ('quiet' | 'talkative' | 'balanced')[];
    motivationType: ('self-driven' | 'peer-supported' | 'competitive')[];
  };
  location: {
    sameTimezone: boolean;
    sameCountry: boolean;
    maxDistance: number; // km
  };
  levelRange: {
    min: number;
    max: number;
  };
}

interface MatchRequest {
  id: string;
  fromUser: string;
  toUser: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  respondedAt?: string;
}

export const StudyBuddyMatching: React.FC<StudyBuddyMatchingProps> = ({
  userId,
  className = ''
}) => {
  const [studyBuddies, setStudyBuddies] = useState<StudyBuddy[]>([]);
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showMatchRequestModal, setShowMatchRequestModal] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState<StudyBuddy | null>(null);
  const [filters, setFilters] = useState({
    skillLevel: 'all' as 'all' | StudyBuddy['skillLevel'],
    characterTypes: [] as StudyBuddy['characterTypes'],
    location: 'all' as 'all' | 'same-timezone' | 'same-country',
    onlineOnly: false,
    minCompatibility: 70
  });
  const [sortBy, setSortBy] = useState<'compatibility' | 'recent' | 'level'>('compatibility');
  const [viewMode, setViewMode] = useState<'discover' | 'matches' | 'requests'>('discover');

  // Mock data - in real app, this would come from community service
  useEffect(() => {
    const loadMatchingData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock study buddies
      const mockBuddies: StudyBuddy[] = [
        {
          id: 'buddy-1',
          username: 'SakuraSensei',
          displayName: 'Sakura Sensei',
          avatar: '🌸',
          level: 12,
          location: 'Tokyo, Japan',
          timezone: 'Asia/Tokyo',
          learningGoals: ['JLPT N3', 'Business Japanese', 'Calligraphy'],
          characterTypes: ['hiragana', 'katakana', 'kanji'],
          skillLevel: 'intermediate',
          studySchedule: {
            days: ['Monday', 'Wednesday', 'Friday'],
            timeSlots: ['19:00-20:00', '20:00-21:00'],
            timezone: 'Asia/Tokyo'
          },
          studyPreferences: {
            sessionLength: 60,
            frequency: 'weekly',
            communicationStyle: 'both',
            motivationLevel: 'moderate'
          },
          personality: {
            learningStyle: 'visual',
            communicationStyle: 'balanced',
            motivationType: 'peer-supported'
          },
          compatibility: {
            score: 92,
            factors: {
              schedule: 95,
              goals: 88,
              level: 85,
              personality: 98,
              location: 90
            },
            reasons: [
              'Similar study schedule',
              'Compatible learning styles',
              'Same timezone',
              'Matching motivation levels'
            ]
          },
          lastActive: '2024-01-21T19:30:00Z',
          isOnline: true,
          mutualConnections: 3,
          sharedInterests: ['Calligraphy', 'Japanese Culture', 'Anime'],
          achievements: ['100 Day Streak', 'Kanji Master', 'Helpful Mentor'],
          streak: 45,
          totalStudyTime: 1250
        },
        {
          id: 'buddy-2',
          username: 'KanjiMaster',
          displayName: 'Kanji Master',
          avatar: '🎌',
          level: 15,
          location: 'Osaka, Japan',
          timezone: 'Asia/Tokyo',
          learningGoals: ['JLPT N1', 'Advanced Kanji', 'Classical Japanese'],
          characterTypes: ['kanji'],
          skillLevel: 'advanced',
          studySchedule: {
            days: ['Tuesday', 'Thursday', 'Saturday'],
            timeSlots: ['18:00-19:00', '19:00-20:00'],
            timezone: 'Asia/Tokyo'
          },
          studyPreferences: {
            sessionLength: 90,
            frequency: 'daily',
            communicationStyle: 'video',
            motivationLevel: 'intensive'
          },
          personality: {
            learningStyle: 'kinesthetic',
            communicationStyle: 'talkative',
            motivationType: 'competitive'
          },
          compatibility: {
            score: 78,
            factors: {
              schedule: 70,
              goals: 85,
              level: 60,
              personality: 80,
              location: 95
            },
            reasons: [
              'Same timezone',
              'Advanced level difference',
              'Different study schedules',
              'Compatible communication style'
            ]
          },
          lastActive: '2024-01-21T18:45:00Z',
          isOnline: false,
          mutualConnections: 1,
          sharedInterests: ['Kanji', 'Japanese History'],
          achievements: ['Kanji Expert', '2000 Characters', 'Study Leader'],
          streak: 120,
          totalStudyTime: 2100
        },
        {
          id: 'buddy-3',
          username: 'HiraganaHero',
          displayName: 'Hiragana Hero',
          avatar: '⚡',
          level: 8,
          location: 'Seoul, South Korea',
          timezone: 'Asia/Seoul',
          learningGoals: ['Basic Japanese', 'Travel Japanese', 'Hiragana Mastery'],
          characterTypes: ['hiragana', 'katakana'],
          skillLevel: 'beginner',
          studySchedule: {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            timeSlots: ['20:00-21:00'],
            timezone: 'Asia/Seoul'
          },
          studyPreferences: {
            sessionLength: 30,
            frequency: 'daily',
            communicationStyle: 'chat',
            motivationLevel: 'casual'
          },
          personality: {
            learningStyle: 'auditory',
            communicationStyle: 'quiet',
            motivationType: 'self-driven'
          },
          compatibility: {
            score: 85,
            factors: {
              schedule: 80,
              goals: 90,
              level: 95,
              personality: 75,
              location: 85
            },
            reasons: [
              'Similar skill level',
              'Compatible study goals',
              'Good schedule overlap',
              'Similar motivation style'
            ]
          },
          lastActive: '2024-01-21T17:20:00Z',
          isOnline: true,
          mutualConnections: 2,
          sharedInterests: ['Travel', 'Language Learning', 'Korean Culture'],
          achievements: ['First 50 Characters', 'Daily Learner'],
          streak: 25,
          totalStudyTime: 450
        }
      ];

      // Mock match requests
      const mockRequests: MatchRequest[] = [
        {
          id: 'request-1',
          fromUser: 'user-1',
          toUser: userId,
          message: 'Hi! I saw we have similar study goals and schedules. Would you like to be study buddies?',
          status: 'pending',
          createdAt: '2024-01-21T15:30:00Z'
        },
        {
          id: 'request-2',
          fromUser: userId,
          toUser: 'user-2',
          message: 'Your progress is amazing! I\'d love to learn from you. Study buddies?',
          status: 'accepted',
          createdAt: '2024-01-20T10:15:00Z',
          respondedAt: '2024-01-20T14:30:00Z'
        }
      ];

      setStudyBuddies(mockBuddies);
      setMatchRequests(mockRequests);
      setIsLoading(false);
    };

    loadMatchingData();
  }, [userId]);

  const filteredBuddies = useMemo(() => {
    let filtered = studyBuddies;

    // Filter by skill level
    if (filters.skillLevel !== 'all') {
      filtered = filtered.filter(buddy => buddy.skillLevel === filters.skillLevel);
    }

    // Filter by character types
    if (filters.characterTypes.length > 0) {
      filtered = filtered.filter(buddy =>
        filters.characterTypes.some(type => buddy.characterTypes.includes(type))
      );
    }

    // Filter by location
    if (filters.location !== 'all') {
      filtered = filtered.filter(buddy => {
        if (filters.location === 'same-timezone') {
          return buddy.timezone === 'Asia/Tokyo'; // User's timezone
        }
        if (filters.location === 'same-country') {
          return buddy.location.includes('Japan');
        }
        return true;
      });
    }

    // Filter by online status
    if (filters.onlineOnly) {
      filtered = filtered.filter(buddy => buddy.isOnline);
    }

    // Filter by minimum compatibility
    filtered = filtered.filter(buddy => buddy.compatibility.score >= filters.minCompatibility);

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'compatibility':
          return b.compatibility.score - a.compatibility.score;
        case 'recent':
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        case 'level':
          return b.level - a.level;
        default:
          return 0;
      }
    });

    return filtered;
  }, [studyBuddies, filters, sortBy]);

  const handleSendMatchRequest = (buddy: StudyBuddy, message: string) => {
    const newRequest: MatchRequest = {
      id: `request-${Date.now()}`,
      fromUser: userId,
      toUser: buddy.id,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setMatchRequests(prev => [newRequest, ...prev]);
    setShowMatchRequestModal(false);
    setSelectedBuddy(null);
  };

  const handleRespondToRequest = (requestId: string, response: 'accepted' | 'declined') => {
    setMatchRequests(prev => prev.map(request =>
      request.id === requestId
        ? { ...request, status: response, respondedAt: new Date().toISOString() }
        : request
    ));
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    if (score >= 50) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getMotivationColor = (motivation: string) => {
    switch (motivation) {
      case 'casual': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'intensive': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading study buddies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Study Buddy Matching</h2>
          <p className="body text-gray-600">
            Find the perfect study partner to learn Japanese together
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPreferencesModal(true)}
            className="flex items-center space-x-2 px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Preferences</span>
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center border-base rounded-lg p-1 w-fit">
        {(['discover', 'matches', 'requests'] as const).map((mode) => (
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
             mode === 'matches' ? 'My Matches' : 'Requests'}
          </button>
        ))}
      </div>

      {/* Content based on view mode */}
      {viewMode === 'discover' && (
        <>
          {/* Filters */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
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

              {/* Character Types Filter */}
              <select
                multiple
                value={filters.characterTypes}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFilters(prev => ({ ...prev, characterTypes: values as any }));
                }}
                className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="hiragana">Hiragana</option>
                <option value="katakana">Katakana</option>
                <option value="kanji">Kanji</option>
              </select>

              {/* Location Filter */}
              <select
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value as any }))}
                className="p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Locations</option>
                <option value="same-timezone">Same Timezone</option>
                <option value="same-country">Same Country</option>
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

              {/* Min Compatibility Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Min Compatibility:</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minCompatibility}
                  onChange={(e) => setFilters(prev => ({ ...prev, minCompatibility: parseInt(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600">{filters.minCompatibility}%</span>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <div className="flex items-center space-x-2">
                {(['compatibility', 'recent', 'level'] as const).map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setSortBy(sort)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      sortBy === sort
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {sort === 'compatibility' ? 'Compatibility' : 
                     sort === 'recent' ? 'Recently Active' : 'Level'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Study Buddies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredBuddies.map((buddy, index) => (
                <motion.div
                  key={buddy.id}
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
                        <div className="text-3xl">{buddy.avatar}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{buddy.displayName}</h3>
                          <p className="text-sm text-gray-600">@{buddy.username}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-gray-600">Level {buddy.level}</span>
                            {buddy.isOnline && (
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCompatibilityColor(buddy.compatibility.score)}`}>
                          {buddy.compatibility.score}% match
                        </div>
                      </div>
                    </div>

                    {/* Compatibility Factors */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900">Compatibility</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>Schedule:</span>
                          <span>{buddy.compatibility.factors.schedule}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Goals:</span>
                          <span>{buddy.compatibility.factors.goals}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Level:</span>
                          <span>{buddy.compatibility.factors.level}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Personality:</span>
                          <span>{buddy.compatibility.factors.personality}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Study Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(buddy.skillLevel)}`}>
                          {buddy.skillLevel}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMotivationColor(buddy.studyPreferences.motivationLevel)}`}>
                          {buddy.studyPreferences.motivationLevel}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{buddy.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{buddy.studySchedule.days.join(', ')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Flame className="w-3 h-3" />
                          <span>{buddy.streak} day streak</span>
                        </div>
                      </div>
                    </div>

                    {/* Character Types */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Learning</h4>
                      <div className="flex flex-wrap gap-1">
                        {buddy.characterTypes.map((type) => (
                          <span
                            key={type}
                            className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Shared Interests */}
                    {buddy.sharedInterests.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Shared Interests</h4>
                        <div className="flex flex-wrap gap-1">
                          {buddy.sharedInterests.slice(0, 3).map((interest) => (
                            <span
                              key={interest}
                              className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBuddy(buddy);
                          setShowMatchRequestModal(true);
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span>Send Request</span>
                      </button>
                      <button className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {viewMode === 'requests' && (
        <div className="space-y-4">
          <AnimatePresence>
            {matchRequests.map((request, index) => (
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
                    <div className="text-3xl">🌸</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Study Buddy Request</h3>
                      <p className="text-sm text-gray-600">
                        {request.fromUser === userId ? 'You sent this request' : 'You received this request'}
                      </p>
                      <p className="text-sm text-gray-700 mt-2">{request.message}</p>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {request.status === 'pending' && request.fromUser !== userId && (
                      <>
                        <button
                          onClick={() => handleRespondToRequest(request.id, 'accepted')}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleRespondToRequest(request.id, 'declined')}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </>
                    )}
                    
                    {request.status === 'pending' && request.fromUser === userId && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm font-medium">
                        Pending
                      </span>
                    )}
                    
                    {request.status === 'accepted' && (
                      <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                        Accepted
                      </span>
                    )}
                    
                    {request.status === 'declined' && (
                      <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                        Declined
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {viewMode === 'matches' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤝</div>
          <h3 className="heading text-xl font-semibold text-gray-900 mb-2">Your Study Matches</h3>
          <p className="body text-gray-600 mb-4">
            Your accepted study buddy requests will appear here
          </p>
        </div>
      )}

      {/* Empty State */}
      {viewMode === 'discover' && filteredBuddies.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="heading text-xl font-semibold text-gray-900 mb-2">No study buddies found</h3>
          <p className="body text-gray-600 mb-4">
            Try adjusting your filters or preferences
          </p>
          <button
            onClick={() => setShowPreferencesModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Update Preferences
          </button>
        </div>
      )}

      {/* Match Request Modal */}
      <AnimatePresence>
        {showMatchRequestModal && selectedBuddy && (
          <MatchRequestModal
            buddy={selectedBuddy}
            onClose={() => setShowMatchRequestModal(false)}
            onSubmit={handleSendMatchRequest}
          />
        )}
      </AnimatePresence>

      {/* Preferences Modal */}
      <AnimatePresence>
        {showPreferencesModal && (
          <PreferencesModal
            onClose={() => setShowPreferencesModal(false)}
            onSubmit={(preferences) => {
              // Handle preferences update
              console.log('Update preferences:', preferences);
              setShowPreferencesModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Match Request Modal Component
interface MatchRequestModalProps {
  buddy: StudyBuddy;
  onClose: () => void;
  onSubmit: (buddy: StudyBuddy, message: string) => void;
}

const MatchRequestModal: React.FC<MatchRequestModalProps> = ({ buddy, onClose, onSubmit }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(buddy, message);
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
            <h2 className="heading text-2xl font-bold text-gray-900">Send Study Buddy Request</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-4xl">{buddy.avatar}</div>
            <div>
              <h3 className="font-semibold text-gray-900">{buddy.displayName}</h3>
              <p className="text-sm text-gray-600">@{buddy.username}</p>
              <div className="text-sm text-gray-600">
                {buddy.compatibility.score}% compatibility match
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Introduce yourself and explain why you'd like to be study buddies..."
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

// Preferences Modal Component
interface PreferencesModalProps {
  onClose: () => void;
  onSubmit: (preferences: MatchingPreferences) => void;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({ onClose, onSubmit }) => {
  const [preferences, setPreferences] = useState<MatchingPreferences>({
    characterTypes: ['hiragana', 'katakana'],
    skillLevel: ['beginner', 'intermediate'],
    studySchedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: ['19:00-20:00', '20:00-21:00']
    },
    studyPreferences: {
      sessionLength: [30, 60],
      frequency: ['daily', 'weekly'],
      communicationStyle: ['chat', 'both'],
      motivationLevel: ['moderate', 'intensive']
    },
    personality: {
      learningStyle: ['visual', 'mixed'],
      communicationStyle: ['balanced', 'talkative'],
      motivationType: ['peer-supported', 'competitive']
    },
    location: {
      sameTimezone: true,
      sameCountry: false,
      maxDistance: 1000
    },
    levelRange: {
      min: 5,
      max: 15
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(preferences);
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
            <h2 className="heading text-2xl font-bold text-gray-900">Matching Preferences</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Character Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Character Types
              </label>
              <div className="flex flex-wrap gap-2">
                {(['hiragana', 'katakana', 'kanji'] as const).map((type) => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.characterTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreferences(prev => ({
                            ...prev,
                            characterTypes: [...prev.characterTypes, type]
                          }));
                        } else {
                          setPreferences(prev => ({
                            ...prev,
                            characterTypes: prev.characterTypes.filter(t => t !== type)
                          }));
                        }
                      }}
                      className="w-4 h-4 text-primary border-base rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Skill Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill Level
              </label>
              <div className="flex flex-wrap gap-2">
                {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                  <label key={level} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.skillLevel.includes(level)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreferences(prev => ({
                            ...prev,
                            skillLevel: [...prev.skillLevel, level]
                          }));
                        } else {
                          setPreferences(prev => ({
                            ...prev,
                            skillLevel: prev.skillLevel.filter(l => l !== level)
                          }));
                        }
                      }}
                      className="w-4 h-4 text-primary border-base rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700 capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Level Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level Range
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Min:</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={preferences.levelRange.min}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      levelRange: { ...prev.levelRange, min: parseInt(e.target.value) }
                    }))}
                    className="w-16 p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Max:</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={preferences.levelRange.max}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      levelRange: { ...prev.levelRange, max: parseInt(e.target.value) }
                    }))}
                    className="w-16 p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Study Schedule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Study Days
              </label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <label key={day} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.studySchedule.days.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreferences(prev => ({
                            ...prev,
                            studySchedule: {
                              ...prev.studySchedule,
                              days: [...prev.studySchedule.days, day]
                            }
                          }));
                        } else {
                          setPreferences(prev => ({
                            ...prev,
                            studySchedule: {
                              ...prev.studySchedule,
                              days: prev.studySchedule.days.filter(d => d !== day)
                            }
                          }));
                        }
                      }}
                      className="w-4 h-4 text-primary border-base rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Communication Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Communication Style
              </label>
              <div className="flex flex-wrap gap-2">
                {(['chat', 'video', 'both'] as const).map((style) => (
                  <label key={style} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.studyPreferences.communicationStyle.includes(style)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreferences(prev => ({
                            ...prev,
                            studyPreferences: {
                              ...prev.studyPreferences,
                              communicationStyle: [...prev.studyPreferences.communicationStyle, style]
                            }
                          }));
                        } else {
                          setPreferences(prev => ({
                            ...prev,
                            studyPreferences: {
                              ...prev.studyPreferences,
                              communicationStyle: prev.studyPreferences.communicationStyle.filter(s => s !== style)
                            }
                          }));
                        }
                      }}
                      className="w-4 h-4 text-primary border-base rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700 capitalize">{style}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Preferences
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.location.sameTimezone}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      location: { ...prev.location, sameTimezone: e.target.checked }
                    }))}
                    className="w-4 h-4 text-primary border-base rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Same timezone preferred</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.location.sameCountry}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      location: { ...prev.location, sameCountry: e.target.checked }
                    }))}
                    className="w-4 h-4 text-primary border-base rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Same country preferred</span>
                </label>
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
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};
