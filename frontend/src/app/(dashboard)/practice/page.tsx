"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { CleanPageLayout, CleanCard, CleanButton } from '@/components/layout';
import { Pen, BookOpen, ArrowRight } from 'lucide-react';

export default function PracticePage() {
  const router = useRouter();

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Practice', href: '/practice' }
  ];

  const writingScripts = [
    { id: 'kanji', label: 'Kanji', href: '/practice/writing?script=kanji' },
    { id: 'hiragana', label: 'Hiragana', href: '/practice/writing?script=hiragana' },
    { id: 'katakana', label: 'Katakana', href: '/practice/writing?script=katakana' },
  ];

  const vocabCategories = [
    { id: 'jlpt-n5', label: 'JLPT N5', description: 'Core beginner vocabulary' },
    { id: 'daily-life', label: 'Daily Life', description: 'Everyday words and phrases' },
    { id: 'travel', label: 'Travel', description: 'Directions, transport, and places' },
  ];

  return (
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

          {/* Script Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {writingScripts.map((s) => (
              <CleanCard key={s.id} className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{s.label}</h3>
                <p className="text-gray-600 mb-4">Practice {s.label} characters by levels.</p>
                <CleanButton variant="primary" fullWidth onClick={() => router.push(s.href)}>
                  Start {s.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </CleanButton>
              </CleanCard>
            ))}
          </div>

          {/* Vocabulary Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vocabulary Practice</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vocabCategories.map((c) => (
                <CleanCard key={c.id} className="text-center">
                  <h4 className="text-base font-semibold text-gray-900 mb-2">{c.label}</h4>
                  <p className="text-gray-600 mb-4">{c.description}</p>
                  <CleanButton variant="outline" fullWidth onClick={() => router.push(`/practice/vocabulary?category=${c.id}`)}>
                    Start {c.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </CleanButton>
                </CleanCard>
              ))}
            </div>
          </div>
        </div>
      </CleanPageLayout>
  );
}
