"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { CleanPageLayout, CleanCard, CleanButton } from "@/components/layout";

export default function LearnKatakanaPage() {
  const router = useRouter();
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Learn', href: '/learn' },
    { label: 'Katakana', href: '/learn/katakana' },
  ];

  return (
    <CleanPageLayout title="Learn Katakana" description="Master the basic sets" breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-8">
        <CleanCard>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {['Basic','Digraphs','Diacritics'].map(l => (
              <CleanButton key={l} onClick={() => router.push(`/practice/writing?script=katakana&level=${l.toLowerCase()}`)}>
                {l}
              </CleanButton>
            ))}
          </div>
        </CleanCard>

        <CleanCard title="Tips" description="Focus">
          <ul className="list-disc pl-6 space-y-2">
            <li>Contrast visually similar kana with minimal pairs.</li>
            <li>Practice reading loanwords aloud to fix rhythm.</li>
          </ul>
        </CleanCard>
      </div>
    </CleanPageLayout>
  );
}


