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
  SkipLinks,
  FocusManager,
  LiveRegion,
  Announcement,
  ScreenReaderToast,
  LoadingAnnouncement,
  FormAnnouncement,
  NavigationAnnouncement,
  AccessibleForm,
  AccessibleField,
  AccessibleInput,
  AccessibleTextarea,
  AccessibleSelect,
  AccessibleCheckbox,
  AccessibleButton,
  AccessibleImage,
  DecorativeImage,
  IconImage,
  AvatarImage,
  HeroImage,
} from '@/components/accessibility';
import { useI18n } from '@/lib/hooks';
import { A11Y_CONSTANTS } from '@/lib/constants';

const navigation: TopNavigationItem[] = [
  { id: 'learn', label: 'Learn', href: '/learn' },
  { id: 'progress', label: 'Progress', href: '/progress' },
  { id: 'community', label: 'Community', href: '/community' },
  { id: 'profile', label: 'Profile', href: '/profile' },
];

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Accessibility Demo', current: true },
];

const sidebarSections: SidebarSection[] = [
  {
    id: 'demo',
    title: 'Demo',
    items: [
      { id: 'accessibility', label: 'Accessibility', href: '/accessibility-demo', icon: SidebarIcons.settings, active: true },
    ],
  },
];

export default function AccessibilityDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(5);
  const [announcement, setAnnouncement] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [showToast, setShowToast] = useState(false);
  const { locale, formatDate, formatNumber, formatCurrency, formatPercentage } = useI18n();

  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setFormErrors([]);
    
    // Simulate form validation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    if (!email || !password) {
      setFormErrors(['Email and password are required']);
    } else if (email === 'error@example.com') {
      setFormErrors(['Invalid email address']);
    } else {
      setAnnouncement('Form submitted successfully!');
      setToastMessage('Form submitted successfully!');
      setToastType('success');
      setShowToast(true);
    }
    
    setIsLoading(false);
  };

  const showAnnouncement = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setAnnouncement(message);
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true },
  ];

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
                <h1 className="heading text-3xl font-bold">Accessibility Demo</h1>
                <p className="body text-base text-gray-600">Comprehensive accessibility features and best practices.</p>
              </div>
              
              <div className="space-y-12">
                {/* Skip Links */}
                <div className="space-y-6">
                  <h2 className="heading text-xl font-semibold">Skip Links</h2>
                  <p className="body text-base text-gray-600">
                    Press Tab to see skip links. These allow keyboard users to quickly navigate to main content areas.
                  </p>
                  <SkipLinks />
                </div>

                {/* Focus Management */}
                <div className="space-y-6">
                  <h2 className="heading text-xl font-semibold">Focus Management</h2>
                  <p className="body text-base text-gray-600">
                    All interactive elements have visible focus rings and logical tab order.
                  </p>
                  
                  <FocusManager>
                    <div className="space-y-4">
                      <AccessibleButton onClick={() => showAnnouncement('Button clicked!', 'success')}>
                        Focusable Button
                      </AccessibleButton>
                      <AccessibleInput
                        label="Focusable Input"
                        placeholder="Type here..."
                        className="w-full"
                      />
                      <AccessibleSelect
                        label="Focusable Select"
                        options={selectOptions}
                        className="w-full"
                      />
                    </div>
                  </FocusManager>
                </div>

                {/* Live Regions */}
                <div className="space-y-6">
                  <h2 className="heading text-xl font-semibold">Live Regions</h2>
                  <p className="body text-base text-gray-600">
                    Dynamic content announcements for screen readers.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <AccessibleButton onClick={() => showAnnouncement('Success message!', 'success')}>
                        Success Announcement
                      </AccessibleButton>
                      <AccessibleButton onClick={() => showAnnouncement('Error message!', 'error')}>
                        Error Announcement
                      </AccessibleButton>
                      <AccessibleButton onClick={() => showAnnouncement('Info message!', 'info')}>
                        Info Announcement
                      </AccessibleButton>
                    </div>
                    
                    <LoadingAnnouncement isLoading={isLoading} />
                    <FormAnnouncement errors={formErrors} />
                    <NavigationAnnouncement currentPage={currentPage.toString()} totalPages={totalPages} />
                    
                    {announcement && (
                      <Announcement message={announcement} politeness="polite" />
                    )}
                  </div>
                </div>

                {/* Accessible Forms */}
                <div className="space-y-6">
                  <h2 className="heading text-xl font-semibold">Accessible Forms</h2>
                  <p className="body text-base text-gray-600">
                    Forms with proper labels, error handling, and validation.
                  </p>
                  
                  <AccessibleForm onSubmit={handleFormSubmit} aria-label="Demo form">
                    <div className="space-y-6">
                      <AccessibleInput
                        label="Email"
                        name="email"
                        type="email"
                        required
                        error={formErrors.includes('Email and password are required') ? 'Email is required' : undefined}
                        helpText="Enter your email address"
                      />
                      
                      <AccessibleInput
                        label="Password"
                        name="password"
                        type="password"
                        required
                        error={formErrors.includes('Email and password are required') ? 'Password is required' : undefined}
                        helpText="Enter your password"
                      />
                      
                      <AccessibleTextarea
                        label="Message"
                        name="message"
                        rows={4}
                        helpText="Optional message"
                      />
                      
                      <AccessibleSelect
                        label="Country"
                        name="country"
                        options={selectOptions}
                      />
                      
                      <AccessibleCheckbox
                        label="I agree to the terms and conditions"
                        name="terms"
                        required
                      />
                      
                      <div className="flex gap-4">
                        <AccessibleButton type="submit" loading={isLoading}>
                          Submit Form
                        </AccessibleButton>
                        <AccessibleButton type="button" variant="secondary">
                          Cancel
                        </AccessibleButton>
                      </div>
                    </div>
                  </AccessibleForm>
                </div>

                {/* Accessible Images */}
                <div className="space-y-6">
                  <h2 className="heading text-xl font-semibold">Accessible Images</h2>
                  <p className="body text-base text-gray-600">
                    Images with proper alt text and decorative image handling.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="heading text-lg font-semibold">Meaningful Images</h3>
                      <AccessibleImage
                        src="/placeholder.svg"
                        alt="Sample image with descriptive alt text"
                        width={200}
                        height={150}
                        className="border-base"
                      />
                      
                      <AvatarImage
                        src="/placeholder.svg"
                        alt="User profile"
                        size={64}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="heading text-lg font-semibold">Decorative Images</h3>
                      <DecorativeImage
                        src="/placeholder.svg"
                        width={200}
                        height={150}
                        className="border-base"
                      />
                      
                      <IconImage
                        src="/placeholder.svg"
                        alt="Settings icon"
                        size={32}
                      />
                    </div>
                  </div>
                </div>

                {/* Internationalization */}
                <div className="space-y-6">
                  <h2 className="heading text-xl font-semibold">Internationalization</h2>
                  <p className="body text-base text-gray-600">
                    Locale-aware formatting and Japanese text support.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="heading text-lg font-semibold">Date Formatting</h3>
                        <p className="body text-sm text-gray-600">
                          Current locale: {locale}
                        </p>
                        <p className="body text-sm">
                          {formatDate(new Date(), { dateStyle: 'full' })}
                        </p>
                        <p className="body text-sm">
                          {formatDate(new Date(), { dateStyle: 'short' })}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="heading text-lg font-semibold">Number Formatting</h3>
                        <p className="body text-sm">
                          Number: {formatNumber(1234567.89)}
                        </p>
                        <p className="body text-sm">
                          Currency: {formatCurrency(1234.56, 'USD')}
                        </p>
                        <p className="body text-sm">
                          Percentage: {formatPercentage(0.1234)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="heading text-lg font-semibold">Japanese Text</h3>
                      <p className="body text-base" style={{ fontFamily: 'Noto Sans JP', lineHeight: 1.8 }}>
                        これは日本語のテキストです。適切なフォントと行間で表示されます。
                      </p>
                    </div>
                  </div>
                </div>

                {/* Keyboard Navigation */}
                <div className="space-y-6">
                  <h2 className="heading text-xl font-semibold">Keyboard Navigation</h2>
                  <p className="body text-base text-gray-600">
                    Test keyboard navigation with these interactive elements.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <AccessibleButton onClick={() => showAnnouncement('Tab navigation works!', 'info')}>
                        Tab to Focus
                      </AccessibleButton>
                      <AccessibleButton onClick={() => showAnnouncement('Enter key pressed!', 'info')}>
                        Press Enter
                      </AccessibleButton>
                      <AccessibleButton onClick={() => showAnnouncement('Space key pressed!', 'info')}>
                        Press Space
                      </AccessibleButton>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="heading text-lg font-semibold">Keyboard Shortcuts</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        <li>Tab: Navigate between elements</li>
                        <li>Enter/Space: Activate buttons</li>
                        <li>Escape: Close modals/dropdowns</li>
                        <li>Arrow keys: Navigate lists</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Color Contrast */}
                <div className="space-y-6">
                  <h2 className="heading text-xl font-semibold">Color Contrast</h2>
                  <p className="body text-base text-gray-600">
                    All text meets WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text).
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="heading text-lg font-semibold">Normal Text</h3>
                        <p className="body text-base text-black">
                          Black text on white background (21:1 contrast ratio)
                        </p>
                        <p className="body text-base text-gray-600">
                          Gray text on white background (5.7:1 contrast ratio)
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="heading text-lg font-semibold">Large Text</h3>
                        <p className="heading text-2xl font-bold text-black">
                          Large black text (21:1 contrast ratio)
                        </p>
                        <p className="heading text-2xl font-bold text-gray-600">
                          Large gray text (5.7:1 contrast ratio)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Screen Reader Testing */}
                <div className="space-y-6">
                  <h2 className="heading text-xl font-semibold">Screen Reader Testing</h2>
                  <p className="body text-base text-gray-600">
                    This content is optimized for screen readers with proper semantic markup and ARIA labels.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="heading text-lg font-semibold">Semantic HTML</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          <li>Proper heading hierarchy (h1-h6)</li>
                          <li>Semantic elements (nav, main, article)</li>
                          <li>ARIA labels and roles</li>
                          <li>Live regions for dynamic content</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="heading text-lg font-semibold">ARIA Attributes</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          <li>aria-label for icon buttons</li>
                          <li>aria-hidden for decorative elements</li>
                          <li>aria-expanded for collapsible content</li>
                          <li>aria-describedby for form help</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </MainContentArea>
      </div>
      
      {/* Toast Container */}
      {showToast && (
        <ScreenReaderToast
          message={toastMessage}
          type={toastType}
        />
      )}
    </AppShell>
  );
}
