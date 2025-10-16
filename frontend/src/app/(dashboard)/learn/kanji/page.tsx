"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { CleanPageLayout, CleanCard, CleanButton } from "@/components/layout";

export default function LearnKanjiPage() {
  const router = useRouter();
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Learn', href: '/learn' },
    { label: 'Kanji', href: '/learn/kanji' },
  ];

  return (
    <CleanPageLayout title="Learn Kanji" description="Structured by JLPT levels" breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-8">
        <CleanCard>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {['N5','N4','N3','N2','N1'].map(l => (
              <CleanButton key={l} onClick={() => router.push(`/practice/writing?script=kanji&level=${l.toLowerCase()}`)}>
                {l}
              </CleanButton>
            ))}
          </div>
        </CleanCard>

        <CleanCard title="How to learn" description="Evidence-based guidance">
          <ul className="list-disc pl-6 space-y-2">
            <li>Limit new kanji/day (5–10); keep SRS reviews under control.</li>
            <li>Tie each kanji to real words and example sentences.</li>
            <li>Practice recognition and production separately.</li>
          </ul>
        </CleanCard>
      </div>
    </CleanPageLayout>
  );
}


