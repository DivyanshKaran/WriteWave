"use client";

import React, { useState } from 'react';
import { 
  AppShell, 
  Sidebar, 
  MainContentArea, 
  Section,
  SidebarIcons,
  type SidebarSection 
} from '@/components/layout';
import { Breadcrumb, type TopNavigationItem, type BreadcrumbItem } from '@/components/layout';
import {
  SwipeCard,
  LongPress,
  PinchZoom,
  PullToRefresh,
  TouchTarget,
  BottomSheet,
  ActionSheet,
  FloatingActionButton,
  CanvasDrawing,
  MobileNavigation,
  PerformanceOptimizer,
  TouchAccessibility,
  usePerformanceMonitor,
  useScreenReaderAnnouncement,
} from '@/components/touch';

const navigation: TopNavigationItem[] = [
  { id: 'learn', label: 'Learn', href: '/learn' },
  { id: 'progress', label: 'Progress', href: '/progress' },
  { id: 'community', label: 'Community', href: '/community' },
  { id: 'profile', label: 'Profile', href: '/profile' },
];

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Touch Demo', current: true },
];

const sidebarSections: SidebarSection[] = [
  {
    id: 'demo',
    title: 'Demo',
    items: [
      { id: 'touch', label: 'Touch Interactions', href: '/touch-demo', icon: SidebarIcons.settings, active: true },
    ],
  },
];

const mobileNavItems = [
  { id: 'home', label: 'Home', icon: '🏠', href: '/' },
  { id: 'learn', label: 'Learn', icon: '📚', href: '/learn' },
  { id: 'progress', label: 'Progress', icon: '📊', href: '/progress' },
  { id: 'community', label: 'Community', icon: '👥', href: '/community' },
  { id: 'profile', label: 'Profile', icon: '👤', href: '/profile' },
];

export default function TouchDemoPage() {
  const [currentDemo, setCurrentDemo] = useState('gestures');
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [swipeCount, setSwipeCount] = useState(0);
  const [longPressCount, setLongPressCount] = useState(0);
  const [refreshCount, setRefreshCount] = useState(0);

  const { announce } = useScreenReaderAnnouncement();
  const performanceMetrics = usePerformanceMonitor();

  const handleSwipeRight = () => {
    setSwipeCount(prev => prev + 1);
    announce('Card swiped right - marked as known');
  };

  const handleSwipeLeft = () => {
    setSwipeCount(prev => prev + 1);
    announce('Card swiped left - marked for review');
  };

  const handleSwipeUp = () => {
    setSwipeCount(prev => prev + 1);
    announce('Card swiped up - showing info');
  };

  const handleLongPress = () => {
    setLongPressCount(prev => prev + 1);
    announce('Long press detected');
  };

  const handleRefresh = async () => {
    setRefreshCount(prev => prev + 1);
    announce('Content refreshed');
    
    // Simulate async refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleActionSheetAction = (actionId: string) => {
    announce(`Action ${actionId} selected`);
    console.log('Action selected:', actionId);
  };

  const actionSheetActions = [
    { id: 'edit', label: 'Edit', icon: '✏️' },
    { id: 'share', label: 'Share', icon: '📤' },
    { id: 'delete', label: 'Delete', icon: '🗑️', destructive: true },
  ];

  const renderDemoContent = () => {
    switch (currentDemo) {
      case 'gestures':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="heading text-2xl font-bold">Gesture Library</h2>
              <p className="body text-base text-gray-600">
                Interactive gestures for mobile devices
              </p>
            </div>

            {/* Swipe Card Demo */}
            <div className="space-y-4">
              <h3 className="heading text-lg font-semibold">Swipe Card</h3>
              <p className="text-sm text-gray-600">
                Swipe right: &quot;I know this&quot; • Swipe left: &quot;Need review&quot; • Swipe up: &quot;Show info&quot;
              </p>
              <div className="flex justify-center">
                <SwipeCard
                  onSwipeRight={handleSwipeRight}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeUp={handleSwipeUp}
                  className="w-80 h-48"
                >
                  <div className="p-6 h-full flex flex-col justify-center items-center">
                    <div className="text-4xl font-bold mb-2">あ</div>
                    <p className="text-sm text-gray-600">Hiragana A</p>
                    <p className="text-xs text-gray-500 mt-2">Swipe me!</p>
                  </div>
                </SwipeCard>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Swipes: {swipeCount}
              </p>
            </div>

            {/* Long Press Demo */}
            <div className="space-y-4">
              <h3 className="heading text-lg font-semibold">Long Press</h3>
              <p className="text-sm text-gray-600">
                Hold for 500ms to trigger long press
              </p>
              <div className="flex justify-center">
                <LongPress
                  onLongPress={handleLongPress}
                  className="w-32 h-32"
                >
                  <div className="w-full h-full border-base flex items-center justify-center cursor-pointer hover:border-strong">
                    <span className="text-2xl">📱</span>
                  </div>
                </LongPress>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Long presses: {longPressCount}
              </p>
            </div>

            {/* Pinch Zoom Demo */}
            <div className="space-y-4">
              <h3 className="heading text-lg font-semibold">Pinch to Zoom</h3>
              <p className="text-sm text-gray-600">
                Pinch to zoom • Double-tap to reset
              </p>
              <div className="flex justify-center">
                <PinchZoom className="w-80 h-48">
                  <div className="w-full h-full border-base flex items-center justify-center">
                    <div className="text-6xl font-bold">🔍</div>
                  </div>
                </PinchZoom>
              </div>
            </div>

            {/* Pull to Refresh Demo */}
            <div className="space-y-4">
              <h3 className="heading text-lg font-semibold">Pull to Refresh</h3>
              <p className="text-sm text-gray-600">
                Pull down to refresh content
              </p>
              <PullToRefresh onRefresh={handleRefresh} className="h-48">
                <div className="p-6 border-base bg-gray-50">
                  <p className="text-sm text-gray-600">
                    Pull down to refresh this content
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Refreshes: {refreshCount}
                  </p>
                </div>
              </PullToRefresh>
            </div>
          </div>
        );

      case 'touch-targets':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="heading text-2xl font-bold">Touch Target Optimization</h2>
              <p className="body text-base text-gray-600">
                Proper sizing and feedback for touch interactions
              </p>
            </div>

            {/* Button Sizes */}
            <div className="space-y-4">
              <h3 className="heading text-lg font-semibold">Button Sizes</h3>
              <div className="flex gap-4 items-center">
                <TouchTarget size="small" variant="button">
                  Small (40px)
                </TouchTarget>
                <TouchTarget size="medium" variant="button">
                  Medium (44px)
                </TouchTarget>
                <TouchTarget size="large" variant="button">
                  Large (56px)
                </TouchTarget>
              </div>
            </div>

            {/* List Items */}
            <div className="space-y-4">
              <h3 className="heading text-lg font-semibold">List Items</h3>
              <div className="border-base rounded-sm">
                <TouchTarget variant="list-item">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📚</span>
                    <div>
                      <p className="font-medium">Learn Hiragana</p>
                      <p className="text-sm text-gray-600">46 characters</p>
                    </div>
                  </div>
                </TouchTarget>
                <TouchTarget variant="list-item">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <p className="font-medium">Progress Dashboard</p>
                      <p className="text-sm text-gray-600">Track your learning</p>
                    </div>
                  </div>
                </TouchTarget>
                <TouchTarget variant="list-item">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👥</span>
                    <div>
                      <p className="font-medium">Community</p>
                      <p className="text-sm text-gray-600">Connect with learners</p>
                    </div>
                  </div>
                </TouchTarget>
              </div>
            </div>

            {/* Icon Buttons */}
            <div className="space-y-4">
              <h3 className="heading text-lg font-semibold">Icon Buttons</h3>
              <div className="flex gap-4">
                <TouchTarget variant="icon">
                  <span className="text-xl">⚙️</span>
                </TouchTarget>
                <TouchTarget variant="icon">
                  <span className="text-xl">🔔</span>
                </TouchTarget>
                <TouchTarget variant="icon">
                  <span className="text-xl">❤️</span>
                </TouchTarget>
                <TouchTarget variant="icon" disabled>
                  <span className="text-xl">🚫</span>
                </TouchTarget>
              </div>
            </div>
          </div>
        );

      case 'mobile-patterns':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="heading text-2xl font-bold">Mobile-Specific Patterns</h2>
              <p className="body text-base text-gray-600">
                Native mobile UI patterns and interactions
              </p>
            </div>

            {/* Bottom Sheet Demo */}
            <div className="space-y-4">
              <h3 className="heading text-lg font-semibold">Bottom Sheet</h3>
              <p className="text-sm text-gray-600">
                Slide up from bottom instead of dropdowns
              </p>
              <TouchTarget onClick={() => setShowBottomSheet(true)}>
                Open Bottom Sheet
              </TouchTarget>
            </div>

            {/* Action Sheet Demo */}
            <div className="space-y-4">
              <h3 className="heading text-lg font-semibold">Action Sheet</h3>
              <p className="text-sm text-gray-600">
                Contextual actions with destructive options
              </p>
              <TouchTarget onClick={() => setShowActionSheet(true)}>
                Show Action Sheet
              </TouchTarget>
            </div>

            {/* Floating Action Button Demo */}
            <div className="space-y-4">
              <h3 className="heading text-lg font-semibold">Floating Action Button</h3>
              <p className="text-sm text-gray-600">
                Primary action button that floats above content
              </p>
              <div className="h-32 border-base bg-gray-50 flex items-center justify-center">
                <p className="text-sm text-gray-600">FAB appears in bottom-right</p>
              </div>
            </div>

            {/* Mobile Navigation Demo */}
            <div className="space-y-4">
              <h3 className="heading text-lg font-semibold">Mobile Navigation</h3>
              <p className="text-sm text-gray-600">
                Bottom tab bar with badges and active states
              </p>
              <div className="border-base rounded-sm p-4 bg-gray-50">
                <p className="text-sm text-gray-600 mb-4">
                  Mobile navigation appears at bottom of screen
                </p>
                <div className="flex justify-around">
                  {mobileNavItems.map(item => (
                    <TouchTarget
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex flex-col items-center p-2 ${
                        activeTab === item.id ? 'text-black' : 'text-gray-500'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-xs mt-1">{item.label}</span>
                    </TouchTarget>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'drawing':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="heading text-2xl font-bold">Drawing Interactions</h2>
              <p className="body text-base text-gray-600">
                Canvas drawing with touch optimization
              </p>
            </div>

            {/* Canvas Drawing Demo */}
            <div className="space-y-4">
              <h3 className="heading text-lg font-semibold">Canvas Drawing</h3>
              <p className="text-sm text-gray-600">
                Smooth strokes with Catmull-Rom spline interpolation
              </p>
              <div className="flex justify-center">
                <CanvasDrawing
                  width={320}
                  height={320}
                  strokeColor="#000000"
                  strokeWidth={3}
                  onStrokeComplete={(strokes) => {
                    console.log('Strokes completed:', strokes.length);
                    announce(`Drawing completed with ${strokes.length} strokes`);
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="heading text-2xl font-bold">Performance Optimization</h2>
              <p className="body text-base text-gray-600">
                Mobile performance monitoring and optimization
              </p>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4">
              <h3 className="heading text-lg font-semibold">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border-base p-4 rounded-sm">
                  <h4 className="font-semibold mb-2">Touch Latency</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {performanceMetrics.touchLatency.toFixed(1)}ms
                  </p>
                  <p className="text-xs text-gray-500">Target: &lt; 100ms</p>
                </div>
                <div className="border-base p-4 rounded-sm">
                  <h4 className="font-semibold mb-2">Scroll FPS</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {performanceMetrics.scrollFPS}
                  </p>
                  <p className="text-xs text-gray-500">Target: 60 FPS</p>
                </div>
                <div className="border-base p-4 rounded-sm">
                  <h4 className="font-semibold mb-2">Memory Usage</h4>
                  <p className="text-2xl font-bold text-orange-600">
                    {performanceMetrics.memoryUsage.toFixed(1)}MB
                  </p>
                  <p className="text-xs text-gray-500">JavaScript heap</p>
                </div>
              </div>
            </div>

            {/* Performance Optimizations */}
            <div className="space-y-4">
              <h3 className="heading text-lg font-semibold">Optimizations</h3>
              <div className="space-y-3">
                <div className="border-base p-4 rounded-sm">
                  <h4 className="font-semibold mb-2">Passive Event Listeners</h4>
                  <p className="text-sm text-gray-600">
                    All scroll and touch events use passive listeners for better performance
                  </p>
                </div>
                <div className="border-base p-4 rounded-sm">
                  <h4 className="font-semibold mb-2">Throttled Callbacks</h4>
                  <p className="text-sm text-gray-600">
                    Touch events are throttled to prevent excessive function calls
                  </p>
                </div>
                <div className="border-base p-4 rounded-sm">
                  <h4 className="font-semibold mb-2">Battery Optimization</h4>
                  <p className="text-sm text-gray-600">
                    Reduces animation complexity on low battery mode
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="heading text-2xl font-bold">Touch Accessibility</h2>
              <p className="body text-base text-gray-600">
                Accessibility features for touch interactions
              </p>
            </div>

            {/* Screen Reader Support */}
            <div className="space-y-4">
              <h3 className="heading text-lg font-semibold">Screen Reader Support</h3>
              <div className="space-y-3">
                <div className="border-base p-4 rounded-sm">
                  <h4 className="font-semibold mb-2">VoiceOver (iOS)</h4>
                  <p className="text-sm text-gray-600">
                    Full support for VoiceOver with proper ARIA labels and hints
                  </p>
                </div>
                <div className="border-base p-4 rounded-sm">
                  <h4 className="font-semibold mb-2">TalkBack (Android)</h4>
                  <p className="text-sm text-gray-600">
                    Complete TalkBack integration with touch target descriptions
                  </p>
                </div>
              </div>
            </div>

            {/* System Preferences */}
            <div className="space-y-4">
              <h3 className="heading text-lg font-semibold">System Preferences</h3>
              <div className="space-y-3">
                <div className="border-base p-4 rounded-sm">
                  <h4 className="font-semibold mb-2">High Contrast Mode</h4>
                  <p className="text-sm text-gray-600">
                    Automatically adjusts colors for high contrast preferences
                  </p>
                </div>
                <div className="border-base p-4 rounded-sm">
                  <h4 className="font-semibold mb-2">Reduced Motion</h4>
                  <p className="text-sm text-gray-600">
                    Respects user preference for reduced motion animations
                  </p>
                </div>
                <div className="border-base p-4 rounded-sm">
                  <h4 className="font-semibold mb-2">Font Size</h4>
                  <p className="text-sm text-gray-600">
                    Adapts to system font size settings
                  </p>
                </div>
              </div>
            </div>

            {/* Touch Accommodations */}
            <div className="space-y-4">
              <h3 className="heading text-lg font-semibold">Touch Accommodations</h3>
              <div className="space-y-3">
                <div className="border-base p-4 rounded-sm">
                  <h4 className="font-semibold mb-2">Thumb Zone</h4>
                  <p className="text-sm text-gray-600">
                    Primary actions placed in easy-to-reach thumb zones
                  </p>
                </div>
                <div className="border-base p-4 rounded-sm">
                  <h4 className="font-semibold mb-2">One-Handed Use</h4>
                  <p className="text-sm text-gray-600">
                    Support for one-handed operation with reachability
                  </p>
                </div>
                <div className="border-base p-4 rounded-sm">
                  <h4 className="font-semibold mb-2">Haptic Feedback</h4>
                  <p className="text-sm text-gray-600">
                    Subtle haptic feedback for touch interactions
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <TouchAccessibility>
      <PerformanceOptimizer>
        <AppShell 
          navigation={navigation}
          user={{ streak: 7, notifications: 3 }}
        >
          <div className="flex">
            <Sidebar sections={sidebarSections} />
            
            <MainContentArea hasSidebar>
              <Section>
                <div className="space-y-8">
                  <Breadcrumb items={breadcrumbs} />
                  
                  <div className="space-y-4">
                    <h1 className="heading text-3xl font-bold">Touch Interactions Demo</h1>
                    <p className="body text-base text-gray-600">
                      Native mobile touch interactions with gesture support
                    </p>
                  </div>
                  
                  {/* Demo Navigation */}
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'gestures', label: 'Gestures' },
                        { id: 'touch-targets', label: 'Touch Targets' },
                        { id: 'mobile-patterns', label: 'Mobile Patterns' },
                        { id: 'drawing', label: 'Drawing' },
                        { id: 'performance', label: 'Performance' },
                        { id: 'accessibility', label: 'Accessibility' },
                      ].map(demo => (
                        <TouchTarget
                          key={demo.id}
                          onClick={() => setCurrentDemo(demo.id)}
                          className={`px-4 py-2 text-sm border-base transition-colors ${
                            currentDemo === demo.id
                              ? 'bg-black text-white'
                              : 'bg-white text-black hover:border-strong'
                          }`}
                        >
                          {demo.label}
                        </TouchTarget>
                      ))}
                    </div>

                    {/* Demo Content */}
                    <div className="border-base rounded-sm p-6">
                      {renderDemoContent()}
                    </div>
                  </div>

                  {/* Features Overview */}
                  <div className="space-y-6">
                    <h2 className="heading text-xl font-semibold">Touch Interaction Features</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <h3 className="heading text-lg font-semibold">Gesture Library</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Swipe gestures (left, right, up)</li>
                          <li>• Long press interactions</li>
                          <li>• Pinch to zoom</li>
                          <li>• Pull to refresh</li>
                          <li>• Haptic feedback</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="heading text-lg font-semibold">Touch Targets</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• 44px minimum size (Apple guideline)</li>
                          <li>• Proper spacing between targets</li>
                          <li>• Thumb zone optimization</li>
                          <li>• Visual feedback on press</li>
                          <li>• Disabled state handling</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="heading text-lg font-semibold">Mobile Patterns</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Bottom sheet modals</li>
                          <li>• Action sheets</li>
                          <li>• Floating action buttons</li>
                          <li>• Mobile navigation</li>
                          <li>• Hamburger menus</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="heading text-lg font-semibold">Drawing Interactions</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Canvas optimization</li>
                          <li>• Smooth stroke rendering</li>
                          <li>• Palm rejection</li>
                          <li>• Stroke guides</li>
                          <li>• Undo/redo support</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="heading text-lg font-semibold">Performance</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• &lt; 100ms touch latency</li>
                          <li>• Passive event listeners</li>
                          <li>• Throttled callbacks</li>
                          <li>• Battery optimization</li>
                          <li>• Background handling</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="heading text-lg font-semibold">Accessibility</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Screen reader support</li>
                          <li>• System preferences</li>
                          <li>• Touch accommodations</li>
                          <li>• Haptic feedback</li>
                          <li>• Focus management</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="space-y-6">
                    <h2 className="heading text-xl font-semibold">Technical Implementation</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h3 className="heading text-lg font-semibold">Libraries Used</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• <strong>@use-gesture/react</strong> - Gesture recognition</li>
                          <li>• <strong>@react-spring/web</strong> - Smooth animations</li>
                          <li>• <strong>Framer Motion</strong> - Complex animations</li>
                          <li>• <strong>Hammer.js</strong> - Touch patterns</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="heading text-lg font-semibold">Features</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• <strong>Native Feel</strong> - iOS/Android patterns</li>
                          <li>• <strong>Performance</strong> - Optimized for mobile</li>
                          <li>• <strong>Accessibility</strong> - Screen reader support</li>
                          <li>• <strong>Responsive</strong> - Works on all devices</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Section>
            </MainContentArea>
          </div>

          {/* Mobile Navigation */}
          <MobileNavigation
            items={mobileNavItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Floating Action Button */}
          <FloatingActionButton
            onClick={() => announce('Floating action button pressed')}
            icon="+"
            label="Add new"
            hideOnScroll={true}
          />

          {/* Bottom Sheet */}
          <BottomSheet
            isOpen={showBottomSheet}
            onClose={() => setShowBottomSheet(false)}
            title="Filter Options"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort by</label>
                <select className="w-full p-2 border-base rounded-sm">
                  <option>Recent</option>
                  <option>Popular</option>
                  <option>Alphabetical</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select className="w-full p-2 border-base rounded-sm">
                  <option>All</option>
                  <option>Hiragana</option>
                  <option>Katakana</option>
                  <option>Kanji</option>
                </select>
              </div>
              <TouchTarget
                onClick={() => setShowBottomSheet(false)}
                className="w-full"
              >
                Apply Filters
              </TouchTarget>
            </div>
          </BottomSheet>

          {/* Action Sheet */}
          <ActionSheet
            isOpen={showActionSheet}
            onClose={() => setShowActionSheet(false)}
            onAction={handleActionSheetAction}
            title="Choose Action"
            actions={actionSheetActions}
          />
        </AppShell>
      </PerformanceOptimizer>
    </TouchAccessibility>
  );
}
