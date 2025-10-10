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
  ResponsiveCard, 
  ResponsiveGrid, 
  MobileModal, 
  TouchFriendlyButton 
} from '@/components/ui';

const navigation: TopNavigationItem[] = [
  { id: 'learn', label: 'Learn', href: '/learn' },
  { id: 'progress', label: 'Progress', href: '/progress' },
  { id: 'community', label: 'Community', href: '/community' },
  { id: 'profile', label: 'Profile', href: '/profile' },
];

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Responsive Demo', current: true },
];

const sidebarSections: SidebarSection[] = [
  {
    id: 'demo',
    title: 'Demo',
    items: [
      { id: 'responsive', label: 'Responsive System', href: '/responsive-demo', icon: SidebarIcons.settings, active: true },
    ],
  },
];

export default function ResponsiveDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
                <h1 className="heading text-3xl font-bold">Responsive System Demo</h1>
                <p className="body text-base text-gray-600">Mobile-first responsive design patterns and components.</p>
              </div>
              
              <div className="space-y-12">
                {/* Breakpoint Indicators */}
                <div className="space-y-6">
                  <h2 className="heading text-xl font-semibold">Breakpoint Indicators</h2>
                  
                  <div className="space-y-4">
                    <div className="mobile:block tablet:hidden desktop:hidden p-4 bg-blue-50 border-base">
                      <p className="text-sm font-medium text-blue-800">📱 Mobile View (&lt; 640px)</p>
                    </div>
                    <div className="mobile:hidden tablet:block desktop:hidden p-4 bg-green-50 border-base">
                      <p className="text-sm font-medium text-green-800">📱 Tablet View (640px - 1024px)</p>
                    </div>
                    <div className="mobile:hidden tablet:hidden desktop:block p-4 bg-purple-50 border-base">
                      <p className="text-sm font-medium text-purple-800">🖥️ Desktop View (&gt; 1024px)</p>
                    </div>
                  </div>
                </div>

                {/* Responsive Grid */}
                <div className="space-y-6">
                  <h2 className="heading text-xl font-semibold">Responsive Grid</h2>
                  
                  <ResponsiveGrid
                    columns={{ mobile: 1, tablet: 2, desktop: 3 }}
                    gap={{ mobile: 'gap-4', tablet: 'gap-6', desktop: 'gap-6' }}
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <ResponsiveCard key={i}>
                        <div className="space-y-3">
                          <h3 className="heading text-lg font-semibold">Card {i + 1}</h3>
                          <p className="body text-sm text-gray-600">
                            This card demonstrates responsive behavior across different screen sizes.
                          </p>
                          <TouchFriendlyButton size="sm">
                            Action
                          </TouchFriendlyButton>
                        </div>
                      </ResponsiveCard>
                    ))}
                  </ResponsiveGrid>
                </div>

                {/* Touch-Friendly Buttons */}
                <div className="space-y-6">
                  <h2 className="heading text-xl font-semibold">Touch-Friendly Buttons</h2>
                  
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                      <TouchFriendlyButton variant="primary" size="sm">
                        Small
                      </TouchFriendlyButton>
                      <TouchFriendlyButton variant="primary" size="md">
                        Medium
                      </TouchFriendlyButton>
                      <TouchFriendlyButton variant="primary" size="lg">
                        Large
                      </TouchFriendlyButton>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <TouchFriendlyButton variant="secondary">
                        Secondary
                      </TouchFriendlyButton>
                      <TouchFriendlyButton variant="tertiary">
                        Tertiary
                      </TouchFriendlyButton>
                      <TouchFriendlyButton variant="destructive">
                        Destructive
                      </TouchFriendlyButton>
                    </div>
                  </div>
                </div>

                {/* Mobile Modal */}
                <div className="space-y-6">
                  <h2 className="heading text-xl font-semibold">Mobile Modal</h2>
                  
                  <TouchFriendlyButton onClick={() => setIsModalOpen(true)}>
                    Open Mobile Modal
                  </TouchFriendlyButton>
                  
                  <MobileModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Mobile Modal Demo"
                  >
                    <div className="p-4 space-y-4">
                      <p className="body text-base text-gray-600">
                        This modal slides up from the bottom on mobile devices and behaves like a standard modal on desktop.
                      </p>
                      <div className="space-y-3">
                        <TouchFriendlyButton className="w-full">
                          Primary Action
                        </TouchFriendlyButton>
                        <TouchFriendlyButton variant="secondary" className="w-full">
                          Secondary Action
                        </TouchFriendlyButton>
                      </div>
                    </div>
                  </MobileModal>
                </div>

                {/* Responsive Typography */}
                <div className="space-y-6">
                  <h2 className="heading text-xl font-semibold">Responsive Typography</h2>
                  
                  <div className="space-y-4">
                    <h1 className="heading text-2xl mobile:text-xl tablet:text-2xl desktop:text-3xl font-bold">
                      Responsive Heading
                    </h1>
                    <p className="body text-base mobile:text-sm tablet:text-base desktop:text-lg text-gray-600">
                      This text scales appropriately across different screen sizes for optimal readability.
                    </p>
                  </div>
                </div>

                {/* Spacing Examples */}
                <div className="space-y-6">
                  <h2 className="heading text-xl font-semibold">Responsive Spacing</h2>
                  
                  <div className="space-y-4">
                    <div className="mobile:p-4 tablet:p-6 desktop:p-8 bg-gray-50 border-base">
                      <p className="text-sm font-medium">Responsive Padding</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Mobile: 16px, Tablet: 24px, Desktop: 32px
                      </p>
                    </div>
                    
                    <div className="mobile:space-y-2 tablet:space-y-4 desktop:space-y-6">
                      <div className="mobile:h-8 tablet:h-12 desktop:h-16 bg-gray-200 border-base"></div>
                      <div className="mobile:h-8 tablet:h-12 desktop:h-16 bg-gray-200 border-base"></div>
                      <div className="mobile:h-8 tablet:h-12 desktop:h-16 bg-gray-200 border-base"></div>
                    </div>
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
