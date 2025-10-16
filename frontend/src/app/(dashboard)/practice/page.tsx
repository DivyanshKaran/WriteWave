"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { CleanAppShell, CleanPageLayout, CleanCard, CleanButton } from '@/components/layout';
import { Pen, BookOpen, ArrowRight, Target, Clock, Star } from 'lucide-react';

export default function PracticePage() {
  const router = useRouter();

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Practice', href: '/practice' }
  ];

  const practiceModes = [
    {
      id: 'writing',
      title: 'Writing Practice',
      description: 'Practice writing Japanese characters with stroke order guidance and OCR feedback',
      icon: <Pen className="w-8 h-8 text-gray-700" />,
      features: [
        'Interactive stroke order guidance',
        'Real-time OCR feedback',
        'Character recognition accuracy',
        'Progress tracking'
      ],
      stats: [
        { label: 'Characters Available', value: '2,000+' },
        { label: 'Average Accuracy', value: '94%' },
        { label: 'Practice Sessions', value: '1,250+' }
      ],
      href: '/practice/writing'
    },
    {
      id: 'vocabulary',
      title: 'Vocabulary Practice',
      description: 'Learn and practice Japanese vocabulary with context, pronunciation, and usage examples',
      icon: <BookOpen className="w-8 h-8 text-gray-700" />,
      features: [
        'Contextual learning with sentences',
        'Audio pronunciation guides',
        'Usage examples and grammar',
        'Spaced repetition system'
      ],
      stats: [
        { label: 'Words Available', value: '5,000+' },
        { label: 'Success Rate', value: '89%' },
        { label: 'Learned Words', value: '850+' }
      ],
      href: '/practice/vocabulary'
    }
  ];

  const recentActivity = [
    { type: 'writing', character: '漢', accuracy: 95, time: '2 hours ago' },
    { type: 'vocabulary', word: '勉強', meaning: 'study', accuracy: 88, time: '1 day ago' },
    { type: 'writing', character: '水', accuracy: 92, time: '2 days ago' },
    { type: 'vocabulary', word: '友達', meaning: 'friend', accuracy: 91, time: '3 days ago' }
  ];

  return (
    <CleanAppShell currentPage="practice" user={{ streak: 12, notifications: 3 }}>
      <CleanPageLayout
        title="Start Practice"
        description="Choose your practice mode and begin your Japanese learning journey"
        breadcrumbs={breadcrumbs}
        actions={
          <CleanButton variant="outline" onClick={() => router.push('/learn')}>
            Back to Learn
          </CleanButton>
        }
      >
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Choose Your Practice Mode
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select whether you want to practice writing Japanese characters or learn vocabulary. 
              Both modes are designed to help you master Japanese effectively.
            </p>
          </div>

          {/* Practice Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {practiceModes.map((mode) => (
              <CleanCard
                key={mode.id}
                className="cursor-pointer transition-all duration-200 hover:bg-gray-50 border-gray-300 hover:border-gray-400"
                onClick={() => router.push(mode.href)}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    {mode.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {mode.title}
                  </h3>
                  <p className="text-gray-600">
                    {mode.description}
                  </p>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {mode.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  {mode.stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-600">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Start Button */}
                <div className="mt-6">
                  <CleanButton variant="primary" fullWidth onClick={() => router.push(mode.href)}>
                    Start {mode.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </CleanButton>
                </div>
              </CleanCard>
            ))}
          </div>

          {/* Recent Activity */}
          <CleanCard title="Recent Activity" description="Your latest practice sessions">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                      {activity.type === 'writing' ? (
                        <Pen className="w-5 h-5 text-gray-700" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-gray-700" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {activity.type === 'writing' ? activity.character : activity.word}
                      </div>
                      {activity.type === 'vocabulary' && (
                        <div className="text-sm text-gray-600">
                          {activity.meaning}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {activity.accuracy}% accuracy
                    </div>
                    <div className="text-xs text-gray-500">
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CleanCard>
        </div>
      </CleanPageLayout>
    </CleanAppShell>
  );
}
