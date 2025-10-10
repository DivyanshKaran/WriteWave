"use client";

import { 
  AppShell, 
  Sidebar, 
  MainContentArea, 
  Section,
  SidebarIcons,
  type SidebarSection 
} from '@/components/layout';
import { Breadcrumb, type TopNavigationItem, type BreadcrumbItem } from '@/components/navigation';
import { DataTable, Badge } from '@/components/table';
import type { BadgeTone } from '@/components/table';
import type { ColumnDef } from '@tanstack/react-table';
import { Settings, User } from 'lucide-react';

const navigation: TopNavigationItem[] = [
  { id: 'learn', label: 'Learn', href: '/learn' },
  { id: 'progress', label: 'Progress', href: '/progress' },
  { id: 'community', label: 'Community', href: '/community' },
  { id: 'profile', label: 'Profile', href: '/profile' },
];

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Tables Demo', current: true },
];

const sidebarSections: SidebarSection[] = [
  {
    id: 'demo',
    title: 'Demo',
    items: [
      { id: 'tables', label: 'Tables', href: '/tables-demo', icon: SidebarIcons.settings, active: true },
    ],
  },
];

type LeaderboardRow = { rank: number; name: string; xp: number; status: string };

const leaderboardData: LeaderboardRow[] = Array.from({ length: 25 }).map((_, i) => ({
  rank: i + 1,
  name: `User ${i + 1}`,
  xp: 3000 - i * 37,
  status: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Idle' : 'New',
}));

const columns: ColumnDef<LeaderboardRow, unknown>[] = [
  {
    accessorKey: 'rank',
    header: () => 'RANK',
    cell: ({ getValue }) => (
      <div className="heading text-base font-bold text-center w-12">{getValue<number>()}</div>
    ),
    enableSorting: true,
    size: 48,
  },
  {
    accessorKey: 'name',
    header: () => 'NAME',
    cell: ({ getValue }) => (
      <div className="body text-base truncate">{getValue<string>()}</div>
    ),
    enableSorting: true,
  },
    {
    accessorKey: 'xp',
    header: () => 'XP',
    cell: ({ getValue }) => (
      <div className="body text-base tabular-nums text-right">{getValue<number>().toLocaleString()}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    header: () => 'STATUS',
    cell: ({ getValue }) => {
      const v = getValue<string>();
      const tone: BadgeTone = v === 'Active' ? 'success' : v === 'Idle' ? 'warning' : 'primary';
      return <Badge tone={tone}>{v}</Badge>;
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    header: () => 'ACTIONS',
    cell: () => (
      <div className="flex items-center justify-end gap-2">
        <button className="w-8 h-8 border-base hover:border-strong flex items-center justify-center" aria-label="View user">
          <User className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 border-base hover:border-strong flex items-center justify-center" aria-label="Manage user">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    ),
    enableSorting: false,
  },
];

export default function TablesDemoPage() {
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
                <h1 className="heading text-3xl font-bold">Data Tables</h1>
                <p className="body text-base text-gray-600">Analytics and leaderboard patterns built with custom styling.</p>
              </div>
              
              <div className="space-y-6">
                <h2 className="heading text-xl font-semibold">Leaderboard Table</h2>
                <DataTable columns={columns} data={leaderboardData} pageSize={10} />
              </div>
            </div>
          </Section>
        </MainContentArea>
      </div>
    </AppShell>
  );
}


