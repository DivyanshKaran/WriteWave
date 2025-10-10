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
  WelcomeScreen,
  GoalSelection,
  LevelAssessment,
  PaceSelection,
  AccountCreation,
  CharacterTutorial,
  FeatureTour,
  CelebrationAnimations,
  RecoveryOnboarding,
} from '@/components/onboarding';

const navigation: TopNavigationItem[] = [
  { id: 'learn', label: 'Learn', href: '/learn' },
  { id: 'progress', label: 'Progress', href: '/progress' },
  { id: 'community', label: 'Community', href: '/community' },
  { id: 'profile', label: 'Profile', href: '/profile' },
];

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Onboarding Demo', current: true },
];

const sidebarSections: SidebarSection[] = [
  {
    id: 'demo',
    title: 'Demo',
    items: [
      { id: 'onboarding', label: 'Onboarding', href: '/onboarding-demo', icon: SidebarIcons.settings, active: true },
    ],
  },
];

interface OnboardingData {
  goal?: { id: string; title: string; description: string; icon: string; jlptLevel?: string };
  level?: { id: string; title: string; description: string; icon: string; curriculum: string[] };
  pace?: { id: string; title: string; description: string; dailyTime: string; weeklyDays: string; dailyGoal: number; icon: string; recommended?: boolean };
  account?: { name: string; email: string; password: string; method: 'email' | 'google' | 'apple' | 'guest' };
}

export default function OnboardingDemoPage() {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'goal' | 'level' | 'pace' | 'account' | 'tutorial' | 'tour' | 'celebration' | 'recovery'>('welcome');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType] = useState<'first-character' | 'first-lesson' | 'first-streak' | 'first-week'>('first-character');

  const handleWelcomeStart = () => {
    setCurrentStep('goal');
  };

  const handleGoalNext = (goal: OnboardingData['goal']) => {
    setOnboardingData(prev => ({ ...prev, goal }));
    setCurrentStep('level');
  };

  const handleLevelNext = (level: OnboardingData['level']) => {
    setOnboardingData(prev => ({ ...prev, level }));
    setCurrentStep('pace');
  };

  const handlePaceNext = (pace: OnboardingData['pace']) => {
    setOnboardingData(prev => ({ ...prev, pace }));
    setCurrentStep('account');
  };

  const handleAccountNext = (account: OnboardingData['account']) => {
    setOnboardingData(prev => ({ ...prev, account }));
    setCurrentStep('tutorial');
  };

  const handleTutorialComplete = () => {
    setCurrentStep('tour');
  };

  const handleTourComplete = () => {
    setCurrentStep('celebration');
    setShowCelebration(true);
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setCurrentStep('recovery');
  };

  const handleRecoveryComplete = () => {
    setCurrentStep('welcome');
  };

  const handleSkip = () => {
    // Skip to next step
    switch (currentStep) {
      case 'goal':
        setCurrentStep('level');
        break;
      case 'level':
        setCurrentStep('pace');
        break;
      case 'pace':
        setCurrentStep('account');
        break;
      case 'account':
        setCurrentStep('tutorial');
        break;
      case 'tutorial':
        setCurrentStep('tour');
        break;
      case 'tour':
        setCurrentStep('celebration');
        setShowCelebration(true);
        break;
      default:
        setCurrentStep('welcome');
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeScreen onStart={handleWelcomeStart} />;
      case 'goal':
        return <GoalSelection onNext={handleGoalNext} onSkip={handleSkip} />;
      case 'level':
        return <LevelAssessment onNext={handleLevelNext} onSkip={handleSkip} />;
      case 'pace':
        return <PaceSelection onNext={handlePaceNext} onSkip={handleSkip} />;
      case 'account':
        return <AccountCreation onNext={handleAccountNext} onSkip={handleSkip} />;
      case 'tutorial':
        return <CharacterTutorial onComplete={handleTutorialComplete} />;
      case 'tour':
        return <FeatureTour onComplete={handleTourComplete} />;
      case 'recovery':
        return <RecoveryOnboarding onComplete={handleRecoveryComplete} />;
      default:
        return <WelcomeScreen onStart={handleWelcomeStart} />;
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
                <h1 className="heading text-3xl font-bold">Onboarding Demo</h1>
                <p className="body text-base text-gray-600">
                  Progressive onboarding flow that gets users to value quickly
                </p>
              </div>
              
              {/* Step Navigation */}
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'welcome', label: 'Welcome' },
                    { id: 'goal', label: 'Goal Selection' },
                    { id: 'level', label: 'Level Assessment' },
                    { id: 'pace', label: 'Pace Selection' },
                    { id: 'account', label: 'Account Creation' },
                    { id: 'tutorial', label: 'Character Tutorial' },
                    { id: 'tour', label: 'Feature Tour' },
                    { id: 'celebration', label: 'Celebration' },
                    { id: 'recovery', label: 'Recovery' },
                  ].map(step => (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(step.id as typeof currentStep)}
                      className={`px-3 py-1 text-sm border-base transition-colors ${
                        currentStep === step.id
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:border-strong'
                      }`}
                    >
                      {step.label}
                    </button>
                  ))}
                </div>

                {/* Current Step Display */}
                <div className="bg-gray-50 border-base p-4 rounded-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="heading text-lg font-semibold">
                      Current Step: {currentStep.charAt(0).toUpperCase() + currentStep.slice(1)}
                    </h3>
                    <div className="text-sm text-gray-500">
                      Step {Object.keys({
                        welcome: 0, goal: 1, level: 2, pace: 3, account: 4, 
                        tutorial: 5, tour: 6, celebration: 7, recovery: 8
                      }).indexOf(currentStep) + 1} of 9
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 h-2">
                    <div 
                      className="bg-black h-2 transition-all duration-300"
                      style={{ 
                        width: `${((Object.keys({
                          welcome: 0, goal: 1, level: 2, pace: 3, account: 4, 
                          tutorial: 5, tour: 6, celebration: 7, recovery: 8
                        }).indexOf(currentStep) + 1) / 9) * 100}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Onboarding Data */}
                <div className="bg-gray-50 border-base p-4 rounded-sm">
                  <h3 className="heading text-lg font-semibold mb-2">Onboarding Data</h3>
                  <pre className="text-sm text-gray-600 overflow-x-auto">
                    {JSON.stringify(onboardingData, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Features Overview */}
              <div className="space-y-6">
                <h2 className="heading text-xl font-semibold">Onboarding Features</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h3 className="heading text-lg font-semibold">Progressive Flow</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Show, don&apos;t tell approach</li>
                      <li>• Just-in-time feature teaching</li>
                      <li>• Skippable for expert users</li>
                      <li>• Value-first experience</li>
                      <li>• Quick &quot;aha moment&quot;</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="heading text-lg font-semibold">Interactive Tutorial</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Character introduction</li>
                      <li>• Guided practice</li>
                      <li>• Real-time feedback</li>
                      <li>• Stroke order animation</li>
                      <li>• Recognition exercises</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="heading text-lg font-semibold">Feature Discovery</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Tooltip tour with Joyride</li>
                      <li>• Contextual tips</li>
                      <li>• Progressive feature introduction</li>
                      <li>• Spotlight effects</li>
                      <li>• Minimalist tooltips</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="heading text-lg font-semibold">Celebration Moments</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• First character completion</li>
                      <li>• First lesson mastery</li>
                      <li>• Streak achievements</li>
                      <li>• Weekly milestones</li>
                      <li>• Confetti animations</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="heading text-lg font-semibold">Recovery Onboarding</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Welcome back messages</li>
                      <li>• Streak status updates</li>
                      <li>• Quick refresher lessons</li>
                      <li>• Progress summaries</li>
                      <li>• Encouragement system</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="heading text-lg font-semibold">Activation Milestones</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• First character (5 min)</li>
                      <li>• First lesson (20 min)</li>
                      <li>• First streak (2 days)</li>
                      <li>• First week (7 days)</li>
                      <li>• Critical path optimization</li>
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
                      <li>• <strong>React Joyride</strong> - Guided tours</li>
                      <li>• <strong>Framer Motion</strong> - Animations</li>
                      <li>• <strong>Canvas API</strong> - Drawing practice</li>
                      <li>• <strong>TypeScript</strong> - Type safety</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="heading text-lg font-semibold">Features</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <strong>Progressive Disclosure</strong> - Step-by-step</li>
                      <li>• <strong>Interactive Demos</strong> - Hands-on learning</li>
                      <li>• <strong>Celebration System</strong> - Achievement moments</li>
                      <li>• <strong>Recovery Flow</strong> - Returning users</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </MainContentArea>
      </div>

      {/* Celebration Overlay */}
      {showCelebration && (
        <CelebrationAnimations
          type={celebrationType}
          onComplete={handleCelebrationComplete}
        />
      )}

      {/* Onboarding Flow */}
      <div className="fixed inset-0 z-50">
        {renderCurrentStep()}
      </div>
    </AppShell>
  );
}
