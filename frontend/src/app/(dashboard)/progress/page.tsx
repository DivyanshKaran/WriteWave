"use client";

import React, { useEffect } from 'react';
import { 
  AppShell, 
  Sidebar, 
  MainContentArea, 
  Section,
  SidebarIcons,
  type SidebarSection 
} from '@/components/layout';
import { Breadcrumb, type TopNavigationItem, type BreadcrumbItem } from '@/components/layout';
import { XPCard, StreakCard, AchievementsGrid, Leaderboard } from '@/components/progress';
import { useProgressStore } from '@/stores';

const navigation: TopNavigationItem[] = [
  { id: 'learn', label: 'Learn', href: '/learn' },
  { id: 'progress', label: 'Progress', href: '/progress', active: true },
  { id: 'community', label: 'Community', href: '/community' },
  { id: 'profile', label: 'Profile', href: '/profile' },
];

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Progress', current: true },
];

const sidebarSections: SidebarSection[] = [
  {
    id: 'progress',
    title: 'Progress',
    items: [
      { id: 'overview', label: 'Overview', href: '/progress', icon: SidebarIcons.progress, active: true },
      { id: 'achievements', label: 'Achievements', href: '/progress/achievements', icon: SidebarIcons.progress },
      { id: 'leaderboard', label: 'Leaderboard', href: '/progress/leaderboard', icon: SidebarIcons.progress },
    ],
  },
];

const weeklyData = [
  { day: 'M', xp: 120 },
  { day: 'T', xp: 80 },
  { day: 'W', xp: 150 },
  { day: 'T', xp: 60 },
  { day: 'F', xp: 200 },
  { day: 'S', xp: 90 },
  { day: 'S', xp: 140 },
];

const achievements = [
  { id: 'a1', title: 'First Steps', progressText: '1/1', unlocked: true, icon: <div className="w-12 h-12 border-base" /> },
  { id: 'a2', title: 'Consistency', progressText: '8/10', unlocked: false, icon: <div className="w-12 h-12 border-base" /> },
  { id: 'a3', title: 'Speed Writer', progressText: '2/5', unlocked: false, icon: <div className="w-12 h-12 border-base" /> },
  { id: 'a4', title: 'Perfectionist', progressText: '0/10', unlocked: false, icon: <div className="w-12 h-12 border-base" /> },
  { id: 'a5', title: 'Dedicated', progressText: '3/7', unlocked: true, icon: <div className="w-12 h-12 border-base" /> },
  { id: 'a6', title: 'Marathon', progressText: '12/30', unlocked: false, icon: <div className="w-12 h-12 border-base" /> },
];

const leaderboardEntries = [
  { id: 'u1', name: 'Alice', xp: 3250 },
  { id: 'u2', name: 'Bob', xp: 3010 },
  { id: 'u3', name: 'Chen', xp: 2980 },
  { id: 'u4', name: 'You', xp: 2847 },
  { id: 'u5', name: 'Dae', xp: 2600 },
];

export default function ProgressPage() {
  const { 
    totalXp, 
    level, 
    streak, 
    weeklyXpData, 
    weekCompletion, 
    leaderboard,
    loadProgress,
    loadLeaderboard 
  } = useProgressStore();

  useEffect(() => {
    loadProgress();
    loadLeaderboard();
  }, [loadProgress, loadLeaderboard]);

  return (
    <AppShell 
      navigation={navigation}
      user={{ streak: 12, notifications: 2 }}
    >
      <div className="flex">
        <Sidebar sections={sidebarSections} />
        
        <MainContentArea hasSidebar>
          <Section>
            <div className="space-y-8">
              <Breadcrumb items={breadcrumbs} />

              {/* Hero section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Main column (8) */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="border-base bg-white p-6 flex items-center justify-between">
                    <div>
                      <div className="heading text-4xl font-bold">{totalXp.toLocaleString()} XP</div>
                      <div className="body text-sm text-gray-600">Level {level}</div>
                    </div>
                    <div className="body text-base">🔥 {streak}</div>
                  </div>

                  <XPCard
                    totalXp={totalXp}
                    level={level}
                    toNextLevelXp={1000 - (totalXp % 1000)}
                    weeklyData={weeklyXpData.map((xp, index) => ({ day: `Day ${index + 1}`, xp }))}
                    levelProgress={(totalXp % 1000) / 1000}
                  />
                </div>

                {/* Side column (4) */}
                <div className="lg:col-span-4 space-y-6">
                  <StreakCard streak={streak} weekCompletion={weekCompletion} />
                  <Leaderboard entries={leaderboard} currentUserId="u4" />
                </div>
              </div>

              {/* Achievements */}
              <div>
                <div className="body text-base font-medium mb-4">Achievements</div>
                <AchievementsGrid achievements={achievements} />
              </div>
            </div>
          </Section>
        </MainContentArea>
      </div>
    </AppShell>
  );
}
