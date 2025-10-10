"use client";

import { 
  AppShell, 
  Sidebar, 
  MainContentArea, 
  Section,
  SidebarIcons,
  type SidebarSection 
} from '@/components/layout';
import { Breadcrumb, type TopNavigationItem, type BreadcrumbItem } from '@/components/layout';
import { DiscussionList, StudyGroups } from '@/components/community';
import { useRouter } from 'next/navigation';

const navigation: TopNavigationItem[] = [
  { id: 'learn', label: 'Learn', href: '/learn' },
  { id: 'progress', label: 'Progress', href: '/progress' },
  { id: 'community', label: 'Community', href: '/community', active: true },
  { id: 'profile', label: 'Profile', href: '/profile' },
];

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Community', current: true },
];

const sidebarSections: SidebarSection[] = [
  {
    id: 'community',
    title: 'Community',
    items: [
      { id: 'discussions', label: 'Discussions', href: '/community', icon: SidebarIcons.learn, active: true },
      { id: 'groups', label: 'Study Groups', href: '/community#groups', icon: SidebarIcons.learn },
    ],
  },
];

const sampleDiscussions = [
  { id: 'p1', title: 'Best mnemonics for Kanji radicals?', author: 'Aiko', timestamp: '2h', replies: 12, tags: [{ id: 't1', label: 'Kanji' }, { id: 't2', label: 'Tips' }] },
  { id: 'p2', title: 'Daily writing routine thread', author: 'Kenji', timestamp: '5h', replies: 34, tags: [{ id: 't3', label: 'Practice' }] },
  { id: 'p3', title: 'Share your favorite pens/paper', author: 'Mina', timestamp: '1d', replies: 8, tags: [{ id: 't4', label: 'Gear' }] },
];

const sampleGroups = [
  { 
    id: 'g1', 
    name: 'JLPT N4 Sprint', 
    description: 'Study group for JLPT N4 preparation',
    category: 'exam',
    difficulty: 'intermediate' as const,
    maxMembers: 200,
    currentMembers: 128,
    isPublic: true,
    createdBy: { id: 'u1', name: 'Aiko', avatar: '' },
    createdAt: '2024-01-01',
    updatedAt: '3 new posts today',
    joined: false 
  },
  { 
    id: 'g2', 
    name: 'Kanji 500 Club', 
    description: 'Master 500 essential Kanji characters',
    category: 'kanji',
    difficulty: 'advanced' as const,
    maxMembers: 300,
    currentMembers: 256,
    isPublic: true,
    createdBy: { id: 'u2', name: 'Kenji', avatar: '' },
    createdAt: '2024-01-01',
    updatedAt: 'Last practice session 2h ago',
    joined: true 
  },
  { 
    id: 'g3', 
    name: 'Handwriting Masters', 
    description: 'Perfect your Japanese handwriting',
    category: 'practice',
    difficulty: 'beginner' as const,
    maxMembers: 100,
    currentMembers: 89,
    isPublic: true,
    createdBy: { id: 'u3', name: 'Mina', avatar: '' },
    createdAt: '2024-01-01',
    updatedAt: 'Planning Saturday meetup',
    joined: false 
  },
  { 
    id: 'g4', 
    name: 'Beginner Writers', 
    description: 'Start your Japanese writing journey',
    category: 'beginner',
    difficulty: 'beginner' as const,
    maxMembers: 500,
    currentMembers: 342,
    isPublic: true,
    createdBy: { id: 'u4', name: 'Sato', avatar: '' },
    createdAt: '2024-01-01',
    updatedAt: 'Welcome new members!',
    joined: false 
  },
];

export default function CommunityPage() {
  const router = useRouter();

  return (
    <AppShell 
      navigation={navigation}
      user={{ streak: 4, notifications: 1 }}
    >
      <div className="flex">
        <Sidebar sections={sidebarSections} />
        
        <MainContentArea hasSidebar>
          <Section>
            <div className="space-y-8">
              <Breadcrumb items={breadcrumbs} />

              {/* Discussion List */}
              <div>
                <div className="body text-base font-medium mb-4">Discussions</div>
                <DiscussionList 
                  items={sampleDiscussions}
                  onNavigate={(id) => router.push(`/community/${id}`)}
                />
              </div>

              {/* Study Groups */}
              <div id="groups">
                <div className="body text-base font-medium mb-4">Study Groups</div>
                <StudyGroups 
                  groups={sampleGroups}
                  onJoin={async () => new Promise((res) => setTimeout(res, 500))}
                />
              </div>
            </div>
          </Section>
        </MainContentArea>
      </div>
    </AppShell>
  );
}
