"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

interface LandingPageProps {
	onGetStarted?: () => void;
	onSignIn?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
	onGetStarted,
	onSignIn
}) => {
	const router = useRouter();

	const handleGetStarted = () => {
		if (onGetStarted) {
			onGetStarted();
		} else {
			router.push('/register');
		}
	};

	const handleSignIn = () => {
		if (onSignIn) {
			onSignIn();
		} else {
			router.push('/login');
		}
	};

	return (
		<div className="min-h-screen bg-white text-black">
			<main>
				<section className="py-24 lg:py-40">
					<div className="max-w-4xl mx-auto px-6 text-center">
						<h1 className="heading text-5xl lg:text-6xl font-bold mb-6 leading-tight">
							Master Japanese Writing
						</h1>
						<p className="text-xl text-black/70 mb-12 max-w-2xl mx-auto leading-relaxed">
							Interactive practice with instant feedback. Progress that you can feel.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<button onClick={handleGetStarted} className="px-8 py-4 text-lg bg-black text-white">
								Start learning
								<ArrowRight className="inline ml-2 h-5 w-5" />
							</button>
							<button onClick={handleSignIn} className="px-8 py-4 text-lg border border-black">
								Sign in
							</button>
						</div>
					</div>
				</section>

				<section className="py-20 border-t border-black/10">
					<div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="border border-black p-6">
							<h3 className="font-semibold mb-2">Hiragana</h3>
							<p className="text-sm text-black/70">Practice the foundation of Japanese with precise stroke order.</p>
						</div>
						<div className="border border-black p-6">
							<h3 className="font-semibold mb-2">Katakana</h3>
							<p className="text-sm text-black/70">Master foreign loanwords and sharpen your recognition speed.</p>
						</div>
						<div className="border border-black p-6">
							<h3 className="font-semibold mb-2">Kanji</h3>
							<p className="text-sm text-black/70">Build a daily habit to conquer essential characters efficiently.</p>
						</div>
					</div>
				</section>

				<section className="py-24 text-center">
					<div className="max-w-3xl mx-auto px-6">
						<h2 className="text-3xl font-bold mb-4">Make consistent progress</h2>
						<p className="text-black/70 mb-10">Minimal interface, maximum focus. Track your streaks and improvements without distractions.</p>
						<button onClick={handleGetStarted} className="px-8 py-4 text-lg bg-black text-white">Get started</button>
					</div>
				</section>
			</main>
		</div>
	);
};
