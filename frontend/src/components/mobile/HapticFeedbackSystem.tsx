"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Settings, Volume2, VolumeX, Vibrate, Smartphone, Tablet, Monitor, Play, Pause, RotateCcw, Save, Download, Share2, Bell, AlertCircle, CheckCircle, Info, Star, Heart, Target, Award, Trophy, Flame, Rocket, Sparkles, Coffee, Sun, Moon, Palette, Brush, Pen, Pencil, Eraser, MousePointer, Hand, Touch, Fingerprint, Scan, QrCode, Camera, Video, Mic, Headphones, Speaker, Radio, Tv, Laptop, Computer, Printer, Scanner, Keyboard, Mouse, Gamepad2, Controller, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Play as PlayIcon, Pause as PauseIcon, SkipBack, SkipForward, FastForward, Rewind, Shuffle, Repeat, Repeat1, Volume1, Volume3, Battery, Wifi, Bluetooth, Signal, Phone, Mail, MessageCircle, Send, Reply, Forward, Edit, Save as SaveIcon, Check, X, AlertTriangle, HelpCircle, ExternalLink, Link, Unlink, Lock, Unlock, Shield, Key, UserCheck, UserX, UserPlus, Users, UserMinus, Crown, Medal, Award as AwardIcon, Gift, Present, Box, Package, ShoppingCart, CreditCard, DollarSign, Coins, Banknote, TrendingUp, TrendingDown, BarChart, PieChart, LineChart, Activity, Pulse, Brain, Lightbulb, Eye, EyeOff, Grid, Layers, Undo, Redo, Trash2, Copy, Paste, Cut, Scissors, Crop, FlipHorizontal, FlipVertical, RotateLeft, RotateRight, Maximize, Minimize, Move, GripVertical, MoreVertical, Filter, Sort, List, AlignLeft, AlignRight, AlignCenter, Justify, Text, Image, File, Folder, Upload, Archive, Bookmark, Flag, Tag, Label, Pin, MapPin, Clock, Calendar, Timer, Stopwatch, Coffee as CoffeeIcon, Bed, Sun as SunIcon, Moon as MoonIcon, Palette as PaletteIcon, Layout, Columns, Rows, Sidebar, PanelTop, PanelBottom, PanelLeft, PanelRight, Center, Search, Bell as BellIcon, User, Home, BookOpen, Target as TargetIcon, Users as UsersIcon, Settings as SettingsIcon, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Plus, Minus, RefreshCw, Menu, X as XIcon } from 'lucide-react';

interface HapticFeedbackSystemProps {
  userId: string;
  className?: string;
}

interface HapticPattern {
  id: string;
  name: string;
  description: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'custom';
  intensity: 'light' | 'medium' | 'heavy';
  duration: number;
  pattern: number[];
  frequency: number;
  amplitude: number;
  useCase: string;
  trigger: string;
}

interface HapticSettings {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
  patterns: {
    success: string;
    error: string;
    warning: string;
    info: string;
    drawing: string;
    completion: string;
    navigation: string;
    interaction: string;
  };
  triggers: {
    onTouch: boolean;
    onDraw: boolean;
    onComplete: boolean;
    onError: boolean;
    onSuccess: boolean;
    onNavigation: boolean;
    onInteraction: boolean;
  };
  deviceSupport: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
}

interface HapticEvent {
  id: string;
  type: string;
  pattern: string;
  timestamp: string;
  device: 'mobile' | 'tablet' | 'desktop';
  intensity: number;
  duration: number;
  success: boolean;
  userFeedback: 'positive' | 'negative' | 'neutral';
}

export const HapticFeedbackSystem: React.FC<HapticFeedbackSystemProps> = ({
  userId,
  className = ''
}) => {
  const [settings, setSettings] = useState<HapticSettings>({
    enabled: true,
    intensity: 'medium',
    patterns: {
      success: 'pattern-success',
      error: 'pattern-error',
      warning: 'pattern-warning',
      info: 'pattern-info',
      drawing: 'pattern-drawing',
      completion: 'pattern-completion',
      navigation: 'pattern-navigation',
      interaction: 'pattern-interaction'
    },
    triggers: {
      onTouch: true,
      onDraw: true,
      onComplete: true,
      onError: true,
      onSuccess: true,
      onNavigation: true,
      onInteraction: true
    },
    deviceSupport: {
      mobile: true,
      tablet: true,
      desktop: false
    }
  });
  
  const [patterns, setPatterns] = useState<HapticPattern[]>([]);
  const [events, setEvents] = useState<HapticEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'patterns' | 'settings' | 'events' | 'test'>('overview');
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [hapticSupported, setHapticSupported] = useState(false);

  // Mock haptic patterns
  const mockPatterns: HapticPattern[] = [
    {
      id: 'pattern-success',
      name: 'Success Feedback',
      description: 'Gentle vibration for successful actions',
      type: 'success',
      intensity: 'light',
      duration: 100,
      pattern: [50, 50, 50],
      frequency: 200,
      amplitude: 0.3,
      useCase: 'Character completion, correct answers',
      trigger: 'onSuccess'
    },
    {
      id: 'pattern-error',
      name: 'Error Feedback',
      description: 'Strong vibration for errors',
      type: 'error',
      intensity: 'heavy',
      duration: 200,
      pattern: [100, 50, 100],
      frequency: 100,
      amplitude: 0.8,
      useCase: 'Incorrect answers, system errors',
      trigger: 'onError'
    },
    {
      id: 'pattern-drawing',
      name: 'Drawing Feedback',
      description: 'Subtle vibration while drawing',
      type: 'custom',
      intensity: 'light',
      duration: 50,
      pattern: [25],
      frequency: 300,
      amplitude: 0.2,
      useCase: 'Touch drawing, stroke completion',
      trigger: 'onDraw'
    }
  ];

  useEffect(() => {
    const loadHapticData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Detect device type
      const detectDevice = () => {
        const width = window.innerWidth;
        if (width < 768) {
          setDeviceType('mobile');
        } else if (width < 1024) {
          setDeviceType('tablet');
        } else {
          setDeviceType('desktop');
        }
      };

      // Check haptic support
      const checkHapticSupport = () => {
        if ('vibrate' in navigator) {
          setHapticSupported(true);
        } else {
          setHapticSupported(false);
        }
      };

      detectDevice();
      checkHapticSupport();
      setPatterns(mockPatterns);
      setIsLoading(false);
    };

    loadHapticData();
  }, []);

  const triggerHaptic = (patternId: string) => {
    if (!settings.enabled || !hapticSupported) return;

    const pattern = patterns.find(p => p.id === patternId);
    if (!pattern) return;

    try {
      if (navigator.vibrate) {
        navigator.vibrate(pattern.pattern);
      }
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }

    // Log event
    const event: HapticEvent = {
      id: `event-${Date.now()}`,
      type: pattern.type,
      pattern: patternId,
      timestamp: new Date().toISOString(),
      device: deviceType,
      intensity: pattern.intensity === 'light' ? 1 : pattern.intensity === 'medium' ? 2 : 3,
      duration: pattern.duration,
      success: true,
      userFeedback: 'neutral'
    };

    setEvents(prev => [event, ...prev.slice(0, 9)]);
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      case 'custom': return <Zap className="w-5 h-5 text-purple-500" />;
      default: return <Vibrate className="w-5 h-5 text-gray-500" />;
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'light': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'heavy': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="w-4 h-4 text-blue-500" />;
      case 'tablet': return <Tablet className="w-4 h-4 text-green-500" />;
      case 'desktop': return <Monitor className="w-4 h-4 text-purple-500" />;
      default: return <Monitor className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading haptic system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Haptic Feedback System</h2>
          <p className="body text-gray-600">
            Enhanced touch interactions with haptic feedback
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getDeviceIcon(deviceType)}
            <span className="text-sm font-medium capitalize">{deviceType}</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            hapticSupported ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
          }`}>
            {hapticSupported ? 'Supported' : 'Not Supported'}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart },
          { id: 'patterns', label: 'Patterns', icon: Zap },
          { id: 'settings', label: 'Settings', icon: Settings },
          { id: 'events', label: 'Events', icon: Activity },
          { id: 'test', label: 'Test', icon: Play }
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
                <Vibrate className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-500">Status</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {settings.enabled ? 'Enabled' : 'Disabled'}
              </div>
              <div className="text-xs text-gray-600">Haptic feedback</div>
            </div>
            
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-xs text-gray-500">Intensity</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 capitalize">
                {settings.intensity}
              </div>
              <div className="text-xs text-gray-600">Feedback level</div>
            </div>
            
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-500">Events</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {events.length}
              </div>
              <div className="text-xs text-gray-600">Today</div>
            </div>
            
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                {getDeviceIcon(deviceType)}
                <span className="text-xs text-gray-500">Device</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 capitalize">
                {deviceType}
              </div>
              <div className="text-xs text-gray-600">Current device</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => triggerHaptic('pattern-success')}
                className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-green-700">Success</span>
              </button>
              
              <button
                onClick={() => triggerHaptic('pattern-error')}
                className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-red-700">Error</span>
              </button>
              
              <button
                onClick={() => triggerHaptic('pattern-drawing')}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Pen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-blue-700">Drawing</span>
              </button>
              
              <button
                onClick={() => triggerHaptic('pattern-warning')}
                className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <AlertTriangle className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-yellow-700">Warning</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patterns Tab */}
      {selectedView === 'patterns' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Haptic Patterns</h3>
            <div className="space-y-4">
              {patterns.map((pattern, index) => (
                <motion.div
                  key={pattern.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getPatternIcon(pattern.type)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{pattern.name}</h4>
                        <p className="text-sm text-gray-600">{pattern.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-sm ${getIntensityColor(pattern.intensity)}`}>
                        {pattern.intensity}
                      </span>
                      <button
                        onClick={() => triggerHaptic(pattern.id)}
                        className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary-dark transition-colors"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Duration</span>
                      <div className="font-medium">{pattern.duration}ms</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Frequency</span>
                      <div className="font-medium">{pattern.frequency}Hz</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Amplitude</span>
                      <div className="font-medium">{pattern.amplitude}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Use Case</span>
                      <div className="font-medium text-sm">{pattern.useCase}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {selectedView === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Haptic Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="font-medium">Enable Haptic Feedback</span>
                </label>
                <p className="text-sm text-gray-600 ml-6">Enable haptic feedback for touch interactions</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intensity Level
                </label>
                <select
                  value={settings.intensity}
                  onChange={(e) => setSettings(prev => ({ ...prev, intensity: e.target.value as any }))}
                  className="w-full px-3 py-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="heavy">Heavy</option>
                </select>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Trigger Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(settings.triggers).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          triggers: { ...prev.triggers, [key]: e.target.checked }
                        }))}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{key.replace('on', '')}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Device Support</h4>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(settings.deviceSupport).map(([device, supported]) => (
                    <div key={device} className="flex items-center justify-between p-3 border-base rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(device)}
                        <span className="text-sm font-medium capitalize">{device}</span>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={supported}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            deviceSupport: { ...prev.deviceSupport, [device]: e.target.checked }
                          }))}
                          className="rounded"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {selectedView === 'events' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Haptic Events</h3>
            <div className="space-y-3">
              {events.map((event, index) => (
                <div key={event.id} className="flex items-center justify-between p-3 border-base rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getPatternIcon(event.type)}
                    <div>
                      <h4 className="font-medium text-gray-900 capitalize">{event.type}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getDeviceIcon(event.device)}
                    <span className="text-sm text-gray-600">{event.duration}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Test Tab */}
      {selectedView === 'test' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Test Haptic Feedback</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {patterns.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => triggerHaptic(pattern.id)}
                  className="p-6 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center"
                >
                  {getPatternIcon(pattern.type)}
                  <h4 className="font-medium text-gray-900 mt-2">{pattern.name}</h4>
                  <p className="text-sm text-gray-600">{pattern.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
