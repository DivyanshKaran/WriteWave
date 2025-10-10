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
import { 
  Skeleton, 
  SkeletonText, 
  SkeletonButton, 
  SkeletonCard, 
  SkeletonTable,
  ProgressBar,
  LinearProgress,
  EmptyState,
  EmptyStateIcons,
  ErrorState,
  NetworkError,
  NotFoundError,
  ServerError
} from '@/components/loading';
import { useState } from 'react';

const navigation: TopNavigationItem[] = [
  { id: 'learn', label: 'Learn', href: '/learn' },
  { id: 'progress', label: 'Progress', href: '/progress' },
  { id: 'community', label: 'Community', href: '/community' },
  { id: 'profile', label: 'Profile', href: '/profile' },
];

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Loading Demo', current: true },
];

const sidebarSections: SidebarSection[] = [
  {
    id: 'demo',
    title: 'Demo',
    items: [
      { id: 'loading', label: 'Loading States', href: '/loading-demo', icon: SidebarIcons.settings, active: true },
    ],
  },
];

export default function LoadingDemoPage() {
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  const simulateProgress = () => {
    setProgress(0);
    setShowProgress(true);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowProgress(false);
          return 0;
        }
        return prev + 10;
      });
    }, 200);
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
                <h1 className="heading text-3xl font-bold">Loading & Empty States</h1>
                <p className="body text-base text-gray-600">Minimalist loading patterns and state management components.</p>
              </div>
              
              <div className="space-y-12">
                {/* Skeleton Loading */}
                <div className="space-y-6">
                  <h2 className="heading text-xl font-semibold">Skeleton Loading</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="heading text-lg font-medium">Text Skeleton</h3>
                      <SkeletonText lines={4} />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="heading text-lg font-medium">Button Skeleton</h3>
                      <div className="flex gap-4">
                        <SkeletonButton />
                        <SkeletonButton />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="heading text-lg font-medium">Card Skeleton</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SkeletonCard />
                      <SkeletonCard />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="heading text-lg font-medium">Table Skeleton</h3>
                    <SkeletonTable rows={5} columns={4} />
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-6">
                  <h2 className="heading text-xl font-semibold">Progress Indicators</h2>
                  
                  <div className="space-y-4">
                    <h3 className="heading text-lg font-medium">Linear Progress</h3>
                    <div className="space-y-4">
                      <LinearProgress value={75} />
                      <LinearProgress indeterminate />
                      {showProgress && <LinearProgress value={progress} />}
                      <button 
                        onClick={simulateProgress}
                        className="h-12 px-4 bg-white text-black border-base hover:border-strong"
                      >
                        Simulate Progress
                      </button>
                    </div>
                  </div>
                </div>

                {/* Empty States */}
                <div className="space-y-6">
                  <h2 className="heading text-xl font-semibold">Empty States</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <EmptyState
                      icon={EmptyStateIcons.document}
                      title="No documents yet"
                      description="Start by creating your first document to get organized."
                      action={{ label: "Create Document", onClick: () => console.log('Create') }}
                    />
                    
                    <EmptyState
                      icon={EmptyStateIcons.search}
                      title="No results found"
                      description="Try adjusting your search terms or filters."
                    />
                    
                    <EmptyState
                      icon={EmptyStateIcons.users}
                      title="No team members"
                      description="Invite your colleagues to collaborate on this project."
                      action={{ label: "Invite Members", onClick: () => console.log('Invite') }}
                    />
                    
                    <EmptyState
                      icon={EmptyStateIcons.chart}
                      title="No data available"
                      description="Data will appear here once you start using the application."
                    />
                  </div>
                </div>

                {/* Error States */}
                <div className="space-y-6">
                  <h2 className="heading text-xl font-semibold">Error States</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ErrorState
                      title="Something went wrong"
                      message="We encountered an error while loading this content. Please try again."
                      onRetry={() => console.log('Retry')}
                      onContactSupport={() => console.log('Support')}
                    />
                    
                    <NetworkError onRetry={() => console.log('Retry network')} />
                    
                    <NotFoundError onRetry={() => console.log('Retry not found')} />
                    
                    <ServerError 
                      onRetry={() => console.log('Retry server')}
                      onContactSupport={() => console.log('Support server')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </MainContentArea>
      </div>
    </AppShell>
  );
}
