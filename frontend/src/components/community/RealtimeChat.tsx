"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Phone, Video, MoreHorizontal, Search, Users, Bell, BellOff, Settings, Paperclip, Smile, Image, File, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface RealtimeChatProps {
  userId: string;
  className?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    level: number;
    isOnline: boolean;
  };
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'system';
  timestamp: string;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  reactions: Array<{
    emoji: string;
    users: string[];
  }>;
  replyTo?: {
    id: string;
    content: string;
    sender: string;
  };
  attachments?: Array<{
    id: string;
    type: 'image' | 'file' | 'audio';
    url: string;
    name: string;
    size: number;
  }>;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'study-group' | 'challenge';
  description?: string;
  avatar?: string;
  participants: Array<{
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    level: number;
    isOnline: boolean;
    role?: 'admin' | 'moderator' | 'member';
    joinedAt: string;
  }>;
  lastMessage?: ChatMessage;
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Notification {
  id: string;
  type: 'message' | 'mention' | 'friend-request' | 'achievement' | 'challenge' | 'system';
  title: string;
  message: string;
  sender?: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  chatRoomId?: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

interface ChatSettings {
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    mentions: boolean;
    directMessages: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    showReadReceipts: boolean;
    allowDirectMessages: 'everyone' | 'friends' | 'none';
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    showTimestamps: boolean;
    showAvatars: boolean;
  };
}

export const RealtimeChat: React.FC<RealtimeChatProps> = ({
  userId,
  className = ''
}) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock data - in real app, this would come from community service
  useEffect(() => {
    const loadChatData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock chat rooms
      const mockChatRooms: ChatRoom[] = [
        {
          id: 'room-1',
          name: 'Hiragana Heroes',
          type: 'study-group',
          description: 'Study group for Hiragana learners',
          avatar: '🌸',
          participants: [
            {
              id: 'user-1',
              username: 'SakuraSensei',
              displayName: 'Sakura Sensei',
              avatar: '🌸',
              level: 12,
              isOnline: true,
              role: 'admin',
              joinedAt: '2024-01-01T10:00:00Z'
            },
            {
              id: userId,
              username: 'WriteWaveUser',
              displayName: 'WriteWave User',
              avatar: '🚀',
              level: 8,
              isOnline: true,
              role: 'member',
              joinedAt: '2024-01-15T14:30:00Z'
            },
            {
              id: 'user-2',
              username: 'HiraganaHero',
              displayName: 'Hiragana Hero',
              avatar: '⚡',
              level: 8,
              isOnline: false,
              role: 'member',
              joinedAt: '2024-01-10T09:15:00Z'
            }
          ],
          lastMessage: {
            id: 'msg-1',
            senderId: 'user-1',
            sender: {
              id: 'user-1',
              username: 'SakuraSensei',
              displayName: 'Sakura Sensei',
              avatar: '🌸',
              level: 12,
              isOnline: true
            },
            content: 'Great job everyone! Keep up the practice! 🌸',
            type: 'text',
            timestamp: '2024-01-21T19:30:00Z',
            isEdited: false,
            isDeleted: false,
            reactions: []
          },
          unreadCount: 2,
          isMuted: false,
          isPinned: true,
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-21T19:30:00Z'
        },
        {
          id: 'room-2',
          name: 'Kanji Master',
          type: 'direct',
          participants: [
            {
              id: 'user-3',
              username: 'KanjiMaster',
              displayName: 'Kanji Master',
              avatar: '🎌',
              level: 15,
              isOnline: false,
              joinedAt: '2024-01-05T16:00:00Z'
            },
            {
              id: userId,
              username: 'WriteWaveUser',
              displayName: 'WriteWave User',
              avatar: '🚀',
              level: 8,
              isOnline: true,
              joinedAt: '2024-01-05T16:00:00Z'
            }
          ],
          lastMessage: {
            id: 'msg-2',
            senderId: 'user-3',
            sender: {
              id: 'user-3',
              username: 'KanjiMaster',
              displayName: 'Kanji Master',
              avatar: '🎌',
              level: 15,
              isOnline: false
            },
            content: 'Thanks for the feedback on my handwriting! It really helped.',
            type: 'text',
            timestamp: '2024-01-21T18:45:00Z',
            isEdited: false,
            isDeleted: false,
            reactions: []
          },
          unreadCount: 0,
          isMuted: false,
          isPinned: false,
          createdAt: '2024-01-05T16:00:00Z',
          updatedAt: '2024-01-21T18:45:00Z'
        },
        {
          id: 'room-3',
          name: 'Speed Writing Challenge',
          type: 'challenge',
          description: 'Chat for the Speed Writing Championship',
          avatar: '⚡',
          participants: [
            {
              id: 'user-4',
              username: 'SpeedDemon',
              displayName: 'Speed Demon',
              avatar: '💨',
              level: 10,
              isOnline: true,
              role: 'admin',
              joinedAt: '2024-01-20T10:00:00Z'
            },
            {
              id: userId,
              username: 'WriteWaveUser',
              displayName: 'WriteWave User',
              avatar: '🚀',
              level: 8,
              isOnline: true,
              role: 'member',
              joinedAt: '2024-01-20T10:00:00Z'
            }
          ],
          lastMessage: {
            id: 'msg-3',
            senderId: 'user-4',
            sender: {
              id: 'user-4',
              username: 'SpeedDemon',
              displayName: 'Speed Demon',
              avatar: '💨',
              level: 10,
              isOnline: true
            },
            content: 'Challenge starts in 2 hours! Are you ready?',
            type: 'text',
            timestamp: '2024-01-21T17:20:00Z',
            isEdited: false,
            isDeleted: false,
            reactions: []
          },
          unreadCount: 1,
          isMuted: false,
          isPinned: false,
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-21T17:20:00Z'
        }
      ];

      // Mock messages for selected room
      const mockMessages: ChatMessage[] = [
        {
          id: 'msg-1',
          senderId: 'user-1',
          sender: {
            id: 'user-1',
            username: 'SakuraSensei',
            displayName: 'Sakura Sensei',
            avatar: '🌸',
            level: 12,
            isOnline: true
          },
          content: 'Welcome to the Hiragana Heroes study group! 🌸',
          type: 'text',
          timestamp: '2024-01-21T19:00:00Z',
          isEdited: false,
          isDeleted: false,
          reactions: [
            { emoji: '👋', users: [userId, 'user-2'] },
            { emoji: '🌸', users: [userId] }
          ]
        },
        {
          id: 'msg-2',
          senderId: userId,
          sender: {
            id: userId,
            username: 'WriteWaveUser',
            displayName: 'WriteWave User',
            avatar: '🚀',
            level: 8,
            isOnline: true
          },
          content: 'Thanks for having me! I\'m excited to learn with everyone.',
          type: 'text',
          timestamp: '2024-01-21T19:05:00Z',
          isEdited: false,
          isDeleted: false,
          reactions: []
        },
        {
          id: 'msg-3',
          senderId: 'user-2',
          sender: {
            id: 'user-2',
            username: 'HiraganaHero',
            displayName: 'Hiragana Hero',
            avatar: '⚡',
            level: 8,
            isOnline: false
          },
          content: 'Same here! I\'ve been struggling with あ and い. Any tips?',
          type: 'text',
          timestamp: '2024-01-21T19:10:00Z',
          isEdited: false,
          isDeleted: false,
          reactions: []
        },
        {
          id: 'msg-4',
          senderId: 'user-1',
          sender: {
            id: 'user-1',
            username: 'SakuraSensei',
            displayName: 'Sakura Sensei',
            avatar: '🌸',
            level: 12,
            isOnline: true
          },
          content: 'Great question! For あ, think of it as a person with arms up. For い, it\'s like two people standing side by side.',
          type: 'text',
          timestamp: '2024-01-21T19:15:00Z',
          isEdited: false,
          isDeleted: false,
          reactions: [
            { emoji: '💡', users: [userId, 'user-2'] },
            { emoji: '👍', users: [userId] }
          ],
          replyTo: {
            id: 'msg-3',
            content: 'Same here! I\'ve been struggling with あ and い. Any tips?',
            sender: 'Hiragana Hero'
          }
        },
        {
          id: 'msg-5',
          senderId: userId,
          sender: {
            id: userId,
            username: 'WriteWaveUser',
            displayName: 'WriteWave User',
            avatar: '🚀',
            level: 8,
            isOnline: true
          },
          content: 'That\'s a great mnemonic! I\'ll try that approach.',
          type: 'text',
          timestamp: '2024-01-21T19:20:00Z',
          isEdited: false,
          isDeleted: false,
          reactions: []
        },
        {
          id: 'msg-6',
          senderId: 'user-1',
          sender: {
            id: 'user-1',
            username: 'SakuraSensei',
            displayName: 'Sakura Sensei',
            avatar: '🌸',
            level: 12,
            isOnline: true
          },
          content: 'Great job everyone! Keep up the practice! 🌸',
          type: 'text',
          timestamp: '2024-01-21T19:30:00Z',
          isEdited: false,
          isDeleted: false,
          reactions: []
        }
      ];

      // Mock notifications
      const mockNotifications: Notification[] = [
        {
          id: 'notif-1',
          type: 'message',
          title: 'New message from Sakura Sensei',
          message: 'Great job everyone! Keep up the practice! 🌸',
          sender: {
            id: 'user-1',
            username: 'SakuraSensei',
            displayName: 'Sakura Sensei',
            avatar: '🌸'
          },
          chatRoomId: 'room-1',
          isRead: false,
          createdAt: '2024-01-21T19:30:00Z',
          priority: 'medium'
        },
        {
          id: 'notif-2',
          type: 'achievement',
          title: 'Achievement unlocked!',
          message: 'You\'ve unlocked the "First 50 Characters" achievement!',
          isRead: false,
          createdAt: '2024-01-21T18:00:00Z',
          actionUrl: '/progress/achievements',
          priority: 'high'
        },
        {
          id: 'notif-3',
          type: 'friend-request',
          title: 'Friend request',
          message: 'Kanji Master sent you a friend request',
          sender: {
            id: 'user-3',
            username: 'KanjiMaster',
            displayName: 'Kanji Master',
            avatar: '🎌'
          },
          isRead: true,
          createdAt: '2024-01-21T15:30:00Z',
          priority: 'medium'
        }
      ];

      setChatRooms(mockChatRooms);
      setMessages(mockMessages);
      setNotifications(mockNotifications);
      setSelectedRoom(mockChatRooms[0]);
      setIsLoading(false);
    };

    loadChatData();
  }, [userId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;
    
    if (isTyping) {
      typingTimeout = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [isTyping]);

  const filteredRooms = useMemo(() => {
    if (!searchQuery) return chatRooms;
    
    const query = searchQuery.toLowerCase();
    return chatRooms.filter(room =>
      room.name.toLowerCase().includes(query) ||
      room.participants.some(p => p.displayName.toLowerCase().includes(query))
    );
  }, [chatRooms, searchQuery]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !selectedRoom) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: userId,
      sender: {
        id: userId,
        username: 'WriteWaveUser',
        displayName: 'WriteWave User',
        avatar: '🚀',
        level: 8,
        isOnline: true
      },
      content: content.trim(),
      type: 'text',
      timestamp: new Date().toISOString(),
      isEdited: false,
      isDeleted: false,
      reactions: []
    };

    setMessages(prev => [...prev, newMessage]);
    setNewMessage('');
    setIsTyping(false);

    // Update last message in chat room
    setChatRooms(prev => prev.map(room =>
      room.id === selectedRoom.id
        ? { ...room, lastMessage: newMessage, updatedAt: new Date().toISOString() }
        : room
    ));
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (value.trim() && !isTyping) {
      setIsTyping(true);
    } else if (!value.trim()) {
      setIsTyping(false);
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(message => {
      if (message.id === messageId) {
        const existingReaction = message.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          if (existingReaction.users.includes(userId)) {
            // Remove reaction
            return {
              ...message,
              reactions: message.reactions.map(r =>
                r.emoji === emoji
                  ? { ...r, users: r.users.filter(u => u !== userId) }
                  : r
              ).filter(r => r.users.length > 0)
            };
          } else {
            // Add reaction
            return {
              ...message,
              reactions: message.reactions.map(r =>
                r.emoji === emoji
                  ? { ...r, users: [...r.users, userId] }
                  : r
              )
            };
          }
        } else {
          // Add new reaction
          return {
            ...message,
            reactions: [...message.reactions, { emoji, users: [userId] }]
          };
        }
      }
      return message;
    }));
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === notificationId
        ? { ...notif, isRead: true }
        : notif
    ));
  };

  const handleMuteRoom = (roomId: string) => {
    setChatRooms(prev => prev.map(room =>
      room.id === roomId
        ? { ...room, isMuted: !room.isMuted }
        : room
    ));
  };

  const getRoomTypeIcon = (type: string) => {
    switch (type) {
      case 'direct': return '💬';
      case 'group': return '👥';
      case 'study-group': return '📚';
      case 'challenge': return '🏆';
      default: return '💬';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageCircle className="w-4 h-4" />;
      case 'mention': return <MessageCircle className="w-4 h-4" />;
      case 'friend-request': return <Users className="w-4 h-4" />;
      case 'achievement': return <Trophy className="w-4 h-4" />;
      case 'challenge': return <Target className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
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

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-[600px] bg-white border-base rounded-lg shadow-sm ${className}`}>
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading text-lg font-semibold text-gray-900">Chat</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                    {notifications.filter(n => !n.isRead).length}
                  </div>
                )}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat Rooms List */}
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-gray-200">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRoom?.id === room.id ? 'bg-primary/5 border-r-2 border-primary' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{room.avatar || getRoomTypeIcon(room.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {room.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {room.isPinned && (
                          <div className="w-1 h-1 bg-yellow-500 rounded-full" />
                        )}
                        {room.isMuted && (
                          <BellOff className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {room.lastMessage && (
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {room.lastMessage.senderId === userId ? 'You: ' : ''}
                        {room.lastMessage.content}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {room.lastMessage && new Date(room.lastMessage.timestamp).toLocaleTimeString()}
                      </div>
                      {room.unreadCount > 0 && (
                        <div className="w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center">
                          {room.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{selectedRoom.avatar || getRoomTypeIcon(selectedRoom.type)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedRoom.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{selectedRoom.participants.length} participants</span>
                      <div className="flex items-center space-x-1">
                        {selectedRoom.participants.filter(p => p.isOnline).slice(0, 3).map((participant) => (
                          <div key={participant.id} className="w-2 h-2 bg-green-500 rounded-full" />
                        ))}
                        {selectedRoom.participants.filter(p => p.isOnline).length > 3 && (
                          <span className="text-xs">+{selectedRoom.participants.filter(p => p.isOnline).length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMuteRoom(selectedRoom.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedRoom.isMuted
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {selectedRoom.isMuted ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`flex items-start space-x-3 ${
                      message.senderId === userId ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className="text-2xl">{message.sender.avatar}</div>
                    <div className={`flex-1 max-w-xs lg:max-w-md ${
                      message.senderId === userId ? 'text-right' : ''
                    }`}>
                      <div className={`inline-block p-3 rounded-lg ${
                        message.senderId === userId
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {message.replyTo && (
                          <div className="mb-2 p-2 bg-black/10 rounded text-sm">
                            <div className="font-medium">{message.replyTo.sender}</div>
                            <div className="opacity-75">{message.replyTo.content}</div>
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                      </div>
                      
                      <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 ${
                        message.senderId === userId ? 'justify-end' : ''
                      }`}>
                        <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                        {message.isEdited && (
                          <span className="italic">(edited)</span>
                        )}
                      </div>
                      
                      {/* Reactions */}
                      {message.reactions.length > 0 && (
                        <div className={`flex flex-wrap gap-1 mt-2 ${
                          message.senderId === userId ? 'justify-end' : ''
                        }`}>
                          {message.reactions.map((reaction, i) => (
                            <button
                              key={i}
                              onClick={() => handleReaction(message.id, reaction.emoji)}
                              className="flex items-center space-x-1 px-2 py-1 bg-white border border-gray-200 rounded-full text-xs hover:bg-gray-50 transition-colors"
                            >
                              <span>{reaction.emoji}</span>
                              <span>{reaction.users.length}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span>{typingUsers.join(', ')} is typing...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Image className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <File className="w-5 h-5" />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(newMessage);
                      }
                    }}
                    placeholder="Type a message..."
                    className="w-full p-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-2 rounded-lg transition-colors ${
                    isRecording
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={() => handleSendMessage(newMessage)}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="heading text-xl font-semibold text-gray-900 mb-2">Select a chat</h3>
              <p className="body text-gray-600">
                Choose a conversation to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            className="w-80 border-l border-gray-200 bg-white"
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleMarkAsRead(notification.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">
                        {notification.sender?.avatar || '🔔'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getNotificationIcon(notification.type)}
                          <h4 className="font-medium text-gray-900 text-sm">
                            {notification.title}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="w-80 border-l border-gray-200 bg-white"
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Chat Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Notifications */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Notifications</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="w-4 h-4 text-primary border-base rounded focus:ring-primary" />
                    <span className="text-sm text-gray-700">Enable notifications</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="w-4 h-4 text-primary border-base rounded focus:ring-primary" />
                    <span className="text-sm text-gray-700">Sound notifications</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="w-4 h-4 text-primary border-base rounded focus:ring-primary" />
                    <span className="text-sm text-gray-700">Desktop notifications</span>
                  </label>
                </div>
              </div>

              {/* Privacy */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Privacy</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="w-4 h-4 text-primary border-base rounded focus:ring-primary" />
                    <span className="text-sm text-gray-700">Show online status</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="w-4 h-4 text-primary border-base rounded focus:ring-primary" />
                    <span className="text-sm text-gray-700">Show read receipts</span>
                  </label>
                </div>
              </div>

              {/* Appearance */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Appearance</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <select className="w-full p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Size
                    </label>
                    <select className="w-full p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
