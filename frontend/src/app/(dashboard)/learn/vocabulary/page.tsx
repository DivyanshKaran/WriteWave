"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { CleanPageLayout, CleanCard, CleanButton } from "@/components/layout";

export default function LearnVocabularyPage() {
  const router = useRouter();
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Learn', href: '/learn' },
    { label: 'Vocabulary', href: '/learn/vocabulary' },
  ];

  const categories = [
    { id: 'jlpt-n5', label: 'JLPT N5' },
    { id: 'jlpt-n4', label: 'JLPT N4' },
    { id: 'daily-life', label: 'Daily Life' },
    { id: 'travel', label: 'Travel' },
  ];

  return (
    <CleanPageLayout title="Learn Vocabulary" description="Focused word lists" breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {categories.map(c => (
            <CleanCard key={c.id} title={c.label}>
              <CleanButton variant="outline" onClick={() => router.push(`/practice/vocabulary?category=${c.id}`)}>Start</CleanButton>
            </CleanCard>
          ))}
        </div>
        <CleanCard title="How to learn" description="Retention tips">
          <ul className="list-disc pl-6 space-y-2">
            <li>Prefer sentences over isolated words; learn in context.</li>
            <li>Use SRS daily but keep new items limited to avoid burnout.</li>
            <li>Read and listen extensively; add unknowns you actually encounter.</li>
          </ul>
        </CleanCard>
      </div>
    </CleanPageLayout>
  );
}


