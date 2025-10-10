"use client";

import React, { useState, useEffect } from 'react';
import { 
  AppShell, 
  Sidebar, 
  MainContentArea, 
  Section,
  SidebarIcons,
  type SidebarSection 
} from '@/components/layout';
import { Breadcrumb, type TopNavigationItem, type BreadcrumbItem } from '@/components/navigation';
import {
  XPChart,
  SkillBreakdown,
  LearningHeatmap,
  AchievementTimeline,
  PredictiveInsights,
  ComparativeAnalytics,
  ChartSkeleton,
} from '@/components/visualizations';

const navigation: TopNavigationItem[] = [
  { id: 'learn', label: 'Learn', href: '/learn' },
  { id: 'progress', label: 'Progress', href: '/progress' },
  { id: 'community', label: 'Community', href: '/community' },
  { id: 'profile', label: 'Profile', href: '/profile' },
];

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Visualizations Demo', current: true },
];

const sidebarSections: SidebarSection[] = [
  {
    id: 'demo',
    title: 'Demo',
    items: [
      { id: 'visualizations', label: 'Visualizations', href: '/visualizations-demo', icon: SidebarIcons.settings, active: true },
    ],
  },
];

export default function VisualizationsDemoPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<string>('xp');

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Sample data
  const xpData = [
    { date: '2024-01-01', xp: 45, goal: 50 },
    { date: '2024-01-02', xp: 52, goal: 50 },
    { date: '2024-01-03', xp: 38, goal: 50 },
    { date: '2024-01-04', xp: 67, goal: 50 },
    { date: '2024-01-05', xp: 43, goal: 50 },
    { date: '2024-01-06', xp: 89, goal: 50 },
    { date: '2024-01-07', xp: 56, goal: 50 },
    { date: '2024-01-08', xp: 72, goal: 50 },
    { date: '2024-01-09', xp: 48, goal: 50 },
    { date: '2024-01-10', xp: 91, goal: 50 },
    { date: '2024-01-11', xp: 63, goal: 50 },
    { date: '2024-01-12', xp: 77, goal: 50 },
    { date: '2024-01-13', xp: 54, goal: 50 },
    { date: '2024-01-14', xp: 82, goal: 50 },
    { date: '2024-01-15', xp: 69, goal: 50 },
  ];

  const heatmapData = Array.from({ length: 365 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      date: date.toISOString().split('T')[0],
      xp: Math.floor(Math.random() * 100),
    };
  });

  const charts = [
    { id: 'xp', label: 'XP Chart', component: 'XPChart' },
    { id: 'skills', label: 'Skill Breakdown', component: 'SkillBreakdown' },
    { id: 'heatmap', label: 'Learning Heatmap', component: 'LearningHeatmap' },
    { id: 'timeline', label: 'Achievement Timeline', component: 'AchievementTimeline' },
    { id: 'insights', label: 'Predictive Insights', component: 'PredictiveInsights' },
    { id: 'comparative', label: 'Comparative Analytics', component: 'ComparativeAnalytics' },
  ];

  const renderChart = () => {
    if (isLoading) {
      return <ChartSkeleton type={activeChart as 'line' | 'bar' | 'radar' | 'heatmap' | 'timeline' | 'insights' | 'comparative'} />;
    }

    switch (activeChart) {
      case 'xp':
        return <XPChart data={xpData} />;
      case 'skills':
        return <SkillBreakdown data={[]} />;
      case 'heatmap':
        return <LearningHeatmap data={heatmapData} />;
      case 'timeline':
        return <AchievementTimeline achievements={[]} />;
      case 'insights':
        return <PredictiveInsights insights={[]} />;
      case 'comparative':
        return <ComparativeAnalytics data={[]} />;
      default:
        return <ChartSkeleton type="line" />;
    }
  };

  return (
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
                <h1 className="heading text-3xl font-bold">Data Visualizations</h1>
                <p className="body text-base text-gray-600">
                  Compelling stories about learning progress through interactive charts and insights.
                </p>
              </div>
              
              {/* Chart Navigation */}
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {charts.map(chart => (
                    <button
                      key={chart.id}
                      onClick={() => setActiveChart(chart.id)}
                      className={`px-4 py-2 text-sm border-base transition-colors ${
                        activeChart === chart.id
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:border-strong'
                      }`}
                    >
                      {chart.label}
                    </button>
                  ))}
                </div>

                {/* Loading Toggle */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsLoading(!isLoading)}
                    className="px-4 py-2 text-sm border-base bg-white text-black hover:border-strong"
                  >
                    {isLoading ? 'Show Chart' : 'Show Loading'}
                  </button>
                  <span className="text-sm text-gray-600">
                    Current: {charts.find(c => c.id === activeChart)?.label}
                  </span>
                </div>

                {/* Chart Container */}
                <div className="bg-white border-base p-6 rounded-sm">
                  {renderChart()}
                </div>
              </div>

              {/* Features Overview */}
              <div className="space-y-6">
                <h2 className="heading text-xl font-semibold">Visualization Features</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h3 className="heading text-lg font-semibold">XP Chart</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Multi-layer visualization</li>
                      <li>• Daily XP bars + moving average</li>
                      <li>• Goal line comparison</li>
                      <li>• Interactive tooltips</li>
                      <li>• Time range selection</li>
                      <li>• Compare mode toggle</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="heading text-lg font-semibold">Skill Breakdown</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Radar/spider chart view</li>
                      <li>• Horizontal bar alternative</li>
                      <li>• Mastery percentages</li>
                      <li>• Items learned tracking</li>
                      <li>• Color-coded categories</li>
                      <li>• Hover interactions</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="heading text-lg font-semibold">Learning Heatmap</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• GitHub-style contribution graph</li>
                      <li>• 52 weeks × 7 days grid</li>
                      <li>• Color intensity mapping</li>
                      <li>• Hover tooltips</li>
                      <li>• Click to navigate</li>
                      <li>• Month labels</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="heading text-lg font-semibold">Achievement Timeline</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Vertical timeline layout</li>
                      <li>• Achievement nodes</li>
                      <li>• Expandable descriptions</li>
                      <li>• Scroll-triggered animations</li>
                      <li>• Type categorization</li>
                      <li>• Date formatting</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="heading text-lg font-semibold">Predictive Insights</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• AI-powered recommendations</li>
                      <li>• Confidence indicators</li>
                      <li>• Actionable insights</li>
                      <li>• Dismissible cards</li>
                      <li>• Privacy notices</li>
                      <li>• Type categorization</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="heading text-lg font-semibold">Comparative Analytics</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Percentile ranking</li>
                      <li>• Bell curve visualization</li>
                      <li>• vs. Average comparisons</li>
                      <li>• Privacy opt-in</li>
                      <li>• Multiple metrics</li>
                      <li>• Progress indicators</li>
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
                      <li>• <strong>D3.js</strong> - Custom visualizations</li>
                      <li>• <strong>Framer Motion</strong> - Animations</li>
                      <li>• <strong>Recharts</strong> - Chart components</li>
                      <li>• <strong>TypeScript</strong> - Type safety</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="heading text-lg font-semibold">Features</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <strong>Loading Skeletons</strong> - Smooth transitions</li>
                      <li>• <strong>Responsive Design</strong> - Mobile-friendly</li>
                      <li>• <strong>Accessibility</strong> - Screen reader support</li>
                      <li>• <strong>Performance</strong> - Optimized rendering</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Usage Examples */}
              <div className="space-y-6">
                <h2 className="heading text-xl font-semibold">Usage Examples</h2>
                
                <div className="bg-gray-50 border-base p-4 rounded-sm">
                  <pre className="text-sm text-gray-700 overflow-x-auto">
{`// XP Chart with sample data
const xpData = [
  { date: '2024-01-01', xp: 45, goal: 50 },
  { date: '2024-01-02', xp: 52, goal: 50 },
  // ... more data
];

<XPChart data={xpData} className="w-full" />

// Skill Breakdown with custom data
const skillData = [
  { name: 'Hiragana', mastery: 85, itemsMastered: 68, totalItems: 80, color: '#0066FF' },
  // ... more skills
];

<SkillBreakdown data={skillData} />

// Learning Heatmap
const heatmapData = Array.from({ length: 365 }, (_, i) => ({
  date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  xp: Math.floor(Math.random() * 100),
}));

<LearningHeatmap data={heatmapData} />`}
                  </pre>
                </div>
              </div>
            </div>
          </Section>
        </MainContentArea>
      </div>
    </AppShell>
  );
}
