"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { CleanPageLayout, CleanCard, CleanButton } from "@/components/layout";

export default function LearnGrammarPage() {
  const router = useRouter();
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Learn', href: '/learn' },
    { label: 'Grammar', href: '/learn/grammar' },
  ];

  const tracks = [
    { id: 'n5', label: 'N5 essentials', desc: 'Particles, basic verb forms, adjectives' },
    { id: 'n4', label: 'N4 essentials', desc: 'て/た/ない forms, potential, volitional, ので/から' },
  ];

  return (
    <CleanPageLayout title="Learn Grammar" description="Example-first progression" breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tracks.map(t => (
            <CleanCard key={t.id} title={t.label} description={t.desc}>
              <CleanButton onClick={() => router.push(`/practice/vocabulary?category=${t.id}`)}>Start</CleanButton>
            </CleanCard>
          ))}
        </div>
        <CleanCard title="How to study" description="Keep it practical">
          <ul className="list-disc pl-6 space-y-2">
            <li>Learn grammar via example sentences; output immediately.</li>
            <li>Shadow audio to reinforce rhythm and pitch while reading.</li>
            <li>Add only useful sentences to SRS; avoid noise.</li>
          </ul>
        </CleanCard>
      </div>
    </CleanPageLayout>
  );
}


