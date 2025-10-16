"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CleanPageLayout, CleanCard, CleanButton } from '@/components/layout';

export default function ProgressPage() {
  const router = useRouter();
  const [hoverInfo, setHoverInfo] = useState<{ date: string; level: number } | null>(null);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Progress', href: '/progress' }
  ];

  const essentials = [
    { label: 'Streak', value: '12' },
    { label: 'Accuracy', value: '94%' },
    { label: 'Kanji learned', value: '127' },
  ];

  // Legacy data kept for reference; not rendered in the new minimal layout
  const recentAchievements = [] as Array<any>;

  const weeklyProgress = [
    { day: 'Mon', value: 85, label: 'Monday' },
    { day: 'Tue', value: 92, label: 'Tuesday' },
    { day: 'Wed', value: 78, label: 'Wednesday' },
    { day: 'Thu', value: 95, label: 'Thursday' },
    { day: 'Fri', value: 88, label: 'Friday' },
    { day: 'Sat', value: 76, label: 'Saturday' },
    { day: 'Sun', value: 90, label: 'Sunday' }
  ];

  const learningGoals = [
    { id: 1, title: 'Learn 50 Kanji', progress: 34, target: 50, deadline: '2024-02-15' },
    { id: 2, title: 'Complete Hiragana', progress: 100, target: 100, deadline: '2024-01-20' },
    { id: 3, title: 'Daily Practice', progress: 12, target: 30, deadline: '2024-02-01' }
  ];

  return (
      <CleanPageLayout title="Progress" description="Your practice at a glance" breadcrumbs={breadcrumbs}>
        <div className="p-6 space-y-8">
          {/* Quick actions (minimal) */}
          <div className="flex flex-wrap gap-3">
            <CleanButton variant="outline" onClick={() => router.push('/practice/writing?script=kanji')}>Practice writing</CleanButton>
            <CleanButton variant="outline" onClick={() => router.push('/practice/writing?script=hiragana')}>Hiragana</CleanButton>
            <CleanButton variant="outline" onClick={() => router.push('/practice/writing?script=katakana')}>Katakana</CleanButton>
            <CleanButton onClick={() => router.push('/practice/vocabulary')}>Vocabulary</CleanButton>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CleanCard title="Kanji learned" description="Cumulative">
              <div className="text-4xl font-bold">127</div>
            </CleanCard>
            <CleanCard title="Goals completed" description="This week">
              <div className="text-4xl font-bold">7</div>
            </CleanCard>
            <CleanCard title="Active days" description="Past 14 days">
              <div className="text-4xl font-bold">11</div>
            </CleanCard>
          </div>

          {/* GitHub-style heatmap (past year) with month labels */}
          <CleanCard title="Practice heatmap" description="Past year">
            <div className="overflow-x-auto p-2">
              {(() => {
                const weeks = 53; // cover ~365 days
                const box = 10; const gap = 2;
                const width = weeks * (box + gap) + gap;
                const height = 7 * (box + gap) + gap + 24; // + space for month + weekday labels
                const start = new Date();
                start.setHours(0,0,0,0);
                // Align start to last Sunday to match GitHub
                const today = new Date(start);
                const dayOfWeek = today.getDay();
                const startOffset = (weeks * 7) - (dayOfWeek + 1); // go back to oldest column start
                const oldest = new Date(start);
                oldest.setDate(start.getDate() - startOffset);
                const levelForDate = (d: Date) => {
                  const seed = d.getFullYear()*10000 + (d.getMonth()+1)*100 + d.getDate();
                  const r = (Math.sin(seed) + 1) / 2; // 0..1 pseudo
                  return r < 0.15 ? 0 : r < 0.45 ? 1 : r < 0.75 ? 2 : 3;
                };
                // Month label positions at the first week where a new month starts
                const monthLabels: Array<{ x: number; label: string }>=[];
                for (let w=0; w<weeks; w++) {
                  const colDate = new Date(oldest);
                  colDate.setDate(oldest.getDate() + w*7);
                  if (w===0 || colDate.getDate() <= 7) {
                    const label = colDate.toLocaleString('en-US', { month: 'short' });
                    monthLabels.push({ x: gap + w*(box+gap), label });
                  }
                }
                return (
                  <svg viewBox={`0 0 ${width} ${height}`} className="min-w-full" style={{ maxWidth: width }}>
                    {/* Month labels */}
                    {monthLabels.map((m, i) => (
                      <text key={i} x={m.x} y={12} fontSize="10" fill="#000">{m.label}</text>
                    ))}
                    {/* Weekday labels (Mon, Wed, Fri) */}
                    {['Mon','Wed','Fri'].map((d, i) => (
                      <text key={d} x={0} y={gap + 16 + (i*2+1)*(box+gap) + 7} fontSize="9" fill="#000">{d}</text>
                    ))}
                    {/* Day boxes */}
                    {Array.from({ length: weeks }).map((_, w) => (
                      Array.from({ length: 7 }).map((__, d) => {
                        const date = new Date(oldest);
                        date.setDate(oldest.getDate() + w*7 + d);
                        if (date > start) return null; // don't draw future
                        const level = levelForDate(date);
                        const op = [0.15, 0.35, 0.6, 1][level];
                        const x = gap + w*(box+gap);
                        const y = gap + 16 + d*(box+gap);
                        const label = date.toLocaleDateString('en-US', { year:'numeric', month:'short', day:'2-digit' });
                        return (
                          <g key={`${w}-${d}`} onMouseEnter={() => setHoverInfo({ date: label, level })} onMouseLeave={() => setHoverInfo(null)}>
                            <rect x={x} y={y} width={box} height={box} fill="#000" opacity={op} rx="1" ry="1" />
                            <title>{`${label} • Level ${level+1}`}</title>
                          </g>
                        );
                      })
                    ))}
                  </svg>
                );
              })()}
            </div>
            <div className="flex items-center justify-between px-2 pb-2 text-sm">
              <div className="text-black/70">
                {hoverInfo ? `${hoverInfo.date} • Level ${hoverInfo.level + 1}` : 'Hover a day to see details'}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-black/70 text-xs">Less</span>
                {[0.15,0.35,0.6,1].map((op, i) => (
                  <span key={i} className="w-3.5 h-3.5 bg-black" style={{ opacity: op }} />
                ))}
                <span className="text-black/70 text-xs">More</span>
              </div>
            </div>
          </CleanCard>

          {/* Hexagon accuracy */}
          <CleanCard title="Test accuracy" description="6-section hexagon">
            <div className="flex items-center justify-center p-4">
              {(() => {
                const metrics = [90, 84, 88, 92, 80, 86]; // six aspects
                const max = 100;
                const cx = 120; const cy = 120; const r = 100;
                const toPoint = (i: number, val: number) => {
                  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 6;
                  const rr = (val / max) * r;
                  return [cx + rr * Math.cos(angle), cy + rr * Math.sin(angle)];
                };
                const outer = Array.from({ length: 6 }).map((_, i) => toPoint(i, r)).map(p => p.join(',')).join(' ');
                const poly = metrics.map((v, i) => toPoint(i, v)).map(p => p.join(',')).join(' ');
                return (
                  <svg viewBox="0 0 240 240" className="w-72 h-72">
                    <polygon points={outer} fill="none" stroke="#000" strokeWidth="2" opacity="0.4" />
                    {[0.66, 0.33].map((f, idx) => (
                      <polygon key={idx} points={Array.from({ length: 6 }).map((_, i) => toPoint(i, r * f)).map(p => p.join(',')).join(' ')} fill="none" stroke="#000" strokeWidth="1" opacity="0.2" />
                    ))}
                    <polygon points={poly} fill="#000" opacity="0.2" stroke="#000" strokeWidth="2" />
                  </svg>
                );
              })()}
            </div>
          </CleanCard>

          {/* KPIs row replaces goals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {essentials.map((e) => (
              <CleanCard key={e.label} title={e.label} description="">
                <div className="text-4xl font-bold">{e.value}</div>
              </CleanCard>
            ))}
          </div>

          {/* Footer quick links removed for a cleaner look */}

        </div>
      </CleanPageLayout>
  );
}