"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { CleanPageLayout, CleanCard, CleanButton } from "@/components/layout";
import { ArrowRight } from 'lucide-react';

export default function LearnPage() {
	const router = useRouter();

	const breadcrumbs = [
		{ label: 'Home', href: '/' },
		{ label: 'Learn', href: '/learn' }
	];

	return (
		<CleanPageLayout title="Learn" description="A focused plan to master characters and words" breadcrumbs={breadcrumbs}>
			<div className="p-6 space-y-8">
				<CleanCard>
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6">
						<div>
							<h2 className="text-3xl font-bold">Your learning plan</h2>
							<p className="text-black/70 mt-2">Follow a simple, distraction-free plan aligned with our monochrome style.</p>
						</div>
						<div className="flex items-center gap-3">
                <CleanButton variant="outline" onClick={() => router.push('/learn/kanji')}>Kanji</CleanButton>
                <CleanButton variant="outline" onClick={() => router.push('/learn/hiragana')}>Hiragana</CleanButton>
                <CleanButton variant="outline" onClick={() => router.push('/learn/katakana')}>Katakana</CleanButton>
                <CleanButton onClick={() => router.push('/learn/vocabulary')}>Vocabulary<ArrowRight className="ml-2 h-4 w-4" /></CleanButton>
						</div>
					</div>
				</CleanCard>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<CleanCard title="Kanji" description="Structured by JLPT levels">
						<div className="grid grid-cols-3 gap-2">
							{['N5','N4','N3','N2','N1'].map(l => (
								<button key={l} onClick={() => router.push(`/practice/writing?script=kanji&level=${l.toLowerCase()}`)} className="border border-black px-3 py-2 hover:bg-black hover:text-white">{l}</button>
							))}
						</div>
					</CleanCard>
					<CleanCard title="Hiragana" description="Master basic sets">
						<div className="grid grid-cols-3 gap-2">
							{['Basic','Digraphs','Diacritics'].map(l => (
								<button key={l} onClick={() => router.push(`/practice/writing?script=hiragana&level=${l.toLowerCase()}`)} className="border border-black px-3 py-2 hover:bg-black hover:text-white">{l}</button>
							))}
						</div>
					</CleanCard>
					<CleanCard title="Katakana" description="Master basic sets">
						<div className="grid grid-cols-3 gap-2">
							{['Basic','Digraphs','Diacritics'].map(l => (
								<button key={l} onClick={() => router.push(`/practice/writing?script=katakana&level=${l.toLowerCase()}`)} className="border border-black px-3 py-2 hover:bg-black hover:text-white">{l}</button>
							))}
						</div>
					</CleanCard>
				</div>

				<CleanCard title="Vocabulary" description="Focused word lists">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
						{['JLPT N5','JLPT N4','Daily Life','Travel'].map((c) => (
							<button key={c} onClick={() => router.push(`/practice/vocabulary?category=${encodeURIComponent(c.toLowerCase().replace(/\s+/g,'-'))}`)} className="border border-black px-3 py-2 text-left hover:bg-black hover:text-white">{c}</button>
						))}
					</div>
				</CleanCard>
			</div>
		</CleanPageLayout>
	);
}
