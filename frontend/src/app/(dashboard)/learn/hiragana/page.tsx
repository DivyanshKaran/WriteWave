"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { CleanPageLayout, CleanCard, CleanButton } from "@/components/layout";

export default function LearnHiraganaPage() {
  const router = useRouter();
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Learn', href: '/learn' },
    { label: 'Hiragana', href: '/learn/hiragana' },
  ];

  return (
    <CleanPageLayout title="Learn Hiragana" description="Master the basic sets" breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-8">
        <CleanCard>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {['Basic','Digraphs','Diacritics'].map(l => (
              <CleanButton key={l} onClick={() => router.push(`/practice/writing?script=hiragana&level=${l.toLowerCase()}`)}>
                {l}
              </CleanButton>
            ))}
          </div>
        </CleanCard>

        <CleanCard title="Tips" description="Do this daily">
          <ul className="list-disc pl-6 space-y-2">
            <li>Write each kana slowly with correct stroke order.</li>
            <li>Shadow audio while reading for mora timing.</li>
            <li>Use SRS for recognition and a short writing drill for production.</li>
          </ul>
        </CleanCard>
      </div>
    </CleanPageLayout>
  );
}


