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
import { PostDetail, type Reply } from '@/components/community/PostDetail';
import { useParams, useRouter } from 'next/navigation';

const navigation: TopNavigationItem[] = [
  { id: 'learn', label: 'Learn', href: '/learn' },
  { id: 'progress', label: 'Progress', href: '/progress' },
  { id: 'community', label: 'Community', href: '/community', active: true },
  { id: 'profile', label: 'Profile', href: '/profile' },
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

export default function CommunityPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Community', href: '/community' },
    { label: 'Post', current: true },
  ];

  const post = {
    id,
    title: 'Best mnemonics for Kanji radicals?',
    author: 'Aiko',
    timestamp: '2h',
    content: 'Share your best mnemonics for remembering tricky radicals. I\'ll start with a few that helped me...\n\nLooking forward to your tips!',
  };

  const replies: Reply[] = [
    {
      id: 'r1',
      author: 'Kenji',
      timestamp: '1h',
      content: 'I like building small stories around radicals. For example...'
    },
    {
      id: 'r2',
      author: 'Mina',
      timestamp: '45m',
      content: 'Drawing them a few times while saying the hint out loud helps me.'
    }
  ];

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
              <PostDetail 
                post={post} 
                replies={replies} 
                onReply={async () => new Promise((res) => setTimeout(res, 400))} 
              />
            </div>
          </Section>
        </MainContentArea>
      </div>
    </AppShell>
  );
}
