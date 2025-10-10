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
  PageTransition,
  FadeTransition,
  StaggerTransition,
  StaggerItem,
  ModalAnimation,
  DrawerAnimation,
  DropdownAnimation,
  ButtonAnimation,
  CopyButton,
  ToastAnimation,
  ToastContainer,
  Toast,
  TabAnimation,
  TabSwitcher,
  ShimmerEffect,
  SkeletonShimmer,
  TextShimmer,
  LinkHover,
  CardHover,
  ImageHover,
  ButtonHover,
  RippleEffect,
  InputFocus,
  SuccessCheckmark,
  ErrorShake,
  LoadingSpinner,
  PulseAnimation,
  BounceAnimation,
  ScaleAnimation,
  ProgressBar,
  ScrollFadeIn,
  ScrollSlideLeft,
  ScrollSlideRight,
  ScrollScaleIn,
  StaggeredScroll,
  StaggeredItem,
  smoothScrollTo
} from '@/components/motion';

const navigation: TopNavigationItem[] = [
  { id: 'learn', label: 'Learn', href: '/learn' },
  { id: 'progress', label: 'Progress', href: '/progress' },
  { id: 'community', label: 'Community', href: '/community' },
  { id: 'profile', label: 'Profile', href: '/profile' },
];

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Motion Demo', current: true },
];

const sidebarSections: SidebarSection[] = [
  {
    id: 'demo',
    title: 'Demo',
    items: [
      { id: 'motion', label: 'Motion System', href: '/motion-demo', icon: SidebarIcons.settings, active: true },
    ],
  },
];

export default function MotionDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tab1');
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string; isVisible: boolean }>>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [progress, setProgress] = useState(0);

  const tabs = [
    { id: 'tab1', label: 'Tab 1', content: <div className="p-4">Content for Tab 1</div> },
    { id: 'tab2', label: 'Tab 2', content: <div className="p-4">Content for Tab 2</div> },
    { id: 'tab3', label: 'Tab 3', content: <div className="p-4">Content for Tab 3</div> },
  ];

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message, isVisible: true }]);
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, isVisible: false } : toast
    ));
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
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
          <PageTransition>
            <Section>
              <div className="space-y-8">
                <Breadcrumb items={breadcrumbs} />
                
                <div className="space-y-4">
                  <h1 className="heading text-3xl font-bold">Motion System Demo</h1>
                  <p className="body text-base text-gray-600">Surgical precision animations for clarity and purpose.</p>
                </div>
                
                <div className="space-y-12">
                  {/* Page Transitions */}
                  <div className="space-y-6">
                    <h2 className="heading text-xl font-semibold">Page Transitions</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FadeTransition>
                        <div className="p-6 border-base bg-gray-50">
                          <h3 className="heading text-lg font-semibold mb-2">Fade Transition</h3>
                          <p className="body text-sm text-gray-600">Simple fade in/out animation</p>
                        </div>
                      </FadeTransition>
                      
                      <StaggerTransition>
                        <div className="space-y-2">
                          <StaggerItem>
                            <div className="p-4 border-base bg-white">Item 1</div>
                          </StaggerItem>
                          <StaggerItem>
                            <div className="p-4 border-base bg-white">Item 2</div>
                          </StaggerItem>
                          <StaggerItem>
                            <div className="p-4 border-base bg-white">Item 3</div>
                          </StaggerItem>
                        </div>
                      </StaggerTransition>
                    </div>
                  </div>

                  {/* Modal & Drawer */}
                  <div className="space-y-6">
                    <h2 className="heading text-xl font-semibold">Modal & Drawer</h2>
                    
                    <div className="flex gap-4">
                      <ButtonAnimation onClick={() => setIsModalOpen(true)}>
                        Open Modal
                      </ButtonAnimation>
                      <ButtonAnimation onClick={() => setIsDrawerOpen(true)}>
                        Open Drawer
                      </ButtonAnimation>
                    </div>
                    
                    <ModalAnimation
                      isOpen={isModalOpen}
                      onClose={() => setIsModalOpen(false)}
                    >
                      <div className="p-6">
                        <h3 className="heading text-lg font-semibold mb-4">Modal Demo</h3>
                        <p className="body text-base text-gray-600 mb-6">
                          This modal scales from 0.95 to 1 with opacity transition.
                        </p>
                        <ButtonAnimation onClick={() => setIsModalOpen(false)}>
                          Close
                        </ButtonAnimation>
                      </div>
                    </ModalAnimation>
                    
                    <DrawerAnimation
                      isOpen={isDrawerOpen}
                      onClose={() => setIsDrawerOpen(false)}
                    >
                      <div className="p-6">
                        <h3 className="heading text-lg font-semibold mb-4">Drawer Demo</h3>
                        <p className="body text-base text-gray-600 mb-6">
                          This drawer slides in from the right.
                        </p>
                        <ButtonAnimation onClick={() => setIsDrawerOpen(false)}>
                          Close
                        </ButtonAnimation>
                      </div>
                    </DrawerAnimation>
                  </div>

                  {/* Dropdown */}
                  <div className="space-y-6">
                    <h2 className="heading text-xl font-semibold">Dropdown</h2>
                    
                    <div className="relative">
                      <ButtonAnimation onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                        Toggle Dropdown
                      </ButtonAnimation>
                      
                      <DropdownAnimation isOpen={isDropdownOpen}>
                        <div className="p-4 space-y-2">
                          <div className="p-2 hover:bg-gray-50 cursor-pointer">Option 1</div>
                          <div className="p-2 hover:bg-gray-50 cursor-pointer">Option 2</div>
                          <div className="p-2 hover:bg-gray-50 cursor-pointer">Option 3</div>
                        </div>
                      </DropdownAnimation>
                    </div>
                  </div>

                  {/* Button Animations */}
                  <div className="space-y-6">
                    <h2 className="heading text-xl font-semibold">Button Animations</h2>
                    
                    <div className="flex flex-wrap gap-4">
                      <ButtonAnimation variant="primary">
                        Primary Button
                      </ButtonAnimation>
                      <ButtonAnimation variant="secondary">
                        Secondary Button
                      </ButtonAnimation>
                      <ButtonAnimation variant="tertiary">
                        Tertiary Button
                      </ButtonAnimation>
                      <ButtonAnimation variant="destructive">
                        Destructive Button
                      </ButtonAnimation>
                    </div>
                    
                    <div className="flex gap-4">
                      <CopyButton text="Hello, World!" className="mr-4">
                        Copy Text
                      </CopyButton>
                      <ButtonHover>
                        <div className="px-4 py-2 border-base">Hover Button</div>
                      </ButtonHover>
                      <RippleEffect>
                        <div className="px-4 py-2 bg-primary text-white">Ripple Effect</div>
                      </RippleEffect>
                    </div>
                  </div>

                  {/* Toast Notifications */}
                  <div className="space-y-6">
                    <h2 className="heading text-xl font-semibold">Toast Notifications</h2>
                    
                    <div className="flex gap-4">
                      <ButtonAnimation onClick={() => showToast('success', 'Success message!')}>
                        Success Toast
                      </ButtonAnimation>
                      <ButtonAnimation onClick={() => showToast('error', 'Error message!')}>
                        Error Toast
                      </ButtonAnimation>
                      <ButtonAnimation onClick={() => showToast('info', 'Info message!')}>
                        Info Toast
                      </ButtonAnimation>
                      <ButtonAnimation onClick={() => showToast('warning', 'Warning message!')}>
                        Warning Toast
                      </ButtonAnimation>
                    </div>
                    
                    <ToastContainer>
                      {toasts.map(toast => (
                        <Toast
                          key={toast.id}
                          type={toast.type}
                          message={toast.message}
                          isVisible={toast.isVisible}
                          onClose={() => hideToast(toast.id)}
                        />
                      ))}
                    </ToastContainer>
                  </div>

                  {/* Tab Animations */}
                  <div className="space-y-6">
                    <h2 className="heading text-xl font-semibold">Tab Animations</h2>
                    
                    <TabAnimation
                      activeTab={activeTab}
                      tabs={tabs}
                      onTabChange={setActiveTab}
                    />
                  </div>

                  {/* Shimmer Effects */}
                  <div className="space-y-6">
                    <h2 className="heading text-xl font-semibold">Shimmer Effects</h2>
                    
                    <div className="space-y-4">
                      <SkeletonShimmer width="100%" height="20px" />
                      <SkeletonShimmer width="80%" height="16px" />
                      <SkeletonShimmer width="60%" height="16px" />
                    </div>
                    
                    <div className="space-y-2">
                      <TextShimmer text="This text has a shimmer effect" isLoading={true} />
                      <TextShimmer text="This text is normal" isLoading={false} />
                    </div>
                  </div>

                  {/* Hover Effects */}
                  <div className="space-y-6">
                    <h2 className="heading text-xl font-semibold">Hover Effects</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <LinkHover>Hover over this link</LinkHover>
                        <CardHover>
                          <div className="p-4 border-base bg-white">
                            <h3 className="font-semibold">Card with hover lift</h3>
                            <p className="text-sm text-gray-600">Hover to see the effect</p>
                          </div>
                        </CardHover>
                      </div>
                      
                      <div className="space-y-4">
                        <ImageHover>
                          <div className="w-32 h-32 bg-gray-200 border-base flex items-center justify-center">
                            Image
                          </div>
                        </ImageHover>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Feedback */}
                  <div className="space-y-6">
                    <h2 className="heading text-xl font-semibold">Interactive Feedback</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <SuccessCheckmark isVisible={showSuccess} />
                          <ButtonAnimation onClick={() => setShowSuccess(!showSuccess)}>
                            Toggle Success
                          </ButtonAnimation>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <ErrorShake>
                            <div className="p-2 border-base bg-error bg-opacity-10 text-error">
                              Error State
                            </div>
                          </ErrorShake>
                          <ButtonAnimation onClick={() => setShowError(!showError)}>
                            Toggle Error
                          </ButtonAnimation>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <LoadingSpinner size={24} />
                        <PulseAnimation>
                          <div className="p-4 border-base bg-gray-100">Pulsing element</div>
                        </PulseAnimation>
                        <BounceAnimation>
                          <div className="p-4 border-base bg-gray-100">Bouncing element</div>
                        </BounceAnimation>
                        <ScaleAnimation>
                          <div className="p-4 border-base bg-gray-100">Scaling element</div>
                        </ScaleAnimation>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <ProgressBar progress={progress} />
                      <ButtonAnimation onClick={simulateProgress}>
                        Simulate Progress
                      </ButtonAnimation>
                    </div>
                  </div>

                  {/* Scroll Behaviors */}
                  <div className="space-y-6">
                    <h2 className="heading text-xl font-semibold">Scroll Behaviors</h2>
                    
                    <ScrollFadeIn>
                      <div className="p-6 border-base bg-gray-50">
                        <h3 className="heading text-lg font-semibold mb-2">Fade In on Scroll</h3>
                        <p className="body text-sm text-gray-600">This element fades in when 20% visible</p>
                      </div>
                    </ScrollFadeIn>
                    
                    <ScrollSlideLeft>
                      <div className="p-6 border-base bg-gray-50">
                        <h3 className="heading text-lg font-semibold mb-2">Slide Left on Scroll</h3>
                        <p className="body text-sm text-gray-600">This element slides in from the left</p>
                      </div>
                    </ScrollSlideLeft>
                    
                    <ScrollSlideRight>
                      <div className="p-6 border-base bg-gray-50">
                        <h3 className="heading text-lg font-semibold mb-2">Slide Right on Scroll</h3>
                        <p className="body text-sm text-gray-600">This element slides in from the right</p>
                      </div>
                    </ScrollSlideRight>
                    
                    <ScrollScaleIn>
                      <div className="p-6 border-base bg-gray-50">
                        <h3 className="heading text-lg font-semibold mb-2">Scale In on Scroll</h3>
                        <p className="body text-sm text-gray-600">This element scales in when visible</p>
                      </div>
                    </ScrollScaleIn>
                    
                    <StaggeredScroll>
                      <div className="space-y-2">
                        <StaggeredItem>
                          <div className="p-4 border-base bg-white">Staggered Item 1</div>
                        </StaggeredItem>
                        <StaggeredItem>
                          <div className="p-4 border-base bg-white">Staggered Item 2</div>
                        </StaggeredItem>
                        <StaggeredItem>
                          <div className="p-4 border-base bg-white">Staggered Item 3</div>
                        </StaggeredItem>
                      </div>
                    </StaggeredScroll>
                  </div>
                </div>
              </div>
            </Section>
          </PageTransition>
        </MainContentArea>
      </div>
    </AppShell>
  );
}
