"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { CleanButton } from '@/components/layout';
import { ArrowRight, BookOpen, Target, Users, Zap, CheckCircle, Star } from 'lucide-react';

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
		<div className="min-h-screen bg-white">
			{/* Navigation */}
			<nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
				<div className="max-w-6xl mx-auto px-6">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center">
							<div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-sm">WW</span>
							</div>
							<span className="ml-3 text-xl font-semibold text-gray-900">WriteWave</span>
						</div>
						<div className="flex items-center space-x-4">
							<CleanButton
								variant="ghost"
								onClick={handleSignIn}
							>
								Sign In
							</CleanButton>
							<CleanButton
								variant="primary"
								onClick={handleGetStarted}
							>
								Get Started
							</CleanButton>
						</div>
					</div>
				</div>
			</nav>

			<main>
				{/* Hero Section */}
				<section className="py-24 lg:py-32">
					<div className="max-w-4xl mx-auto px-6 text-center">
						<h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
							Master Japanese
							<br />
							<span className="text-gray-600">Writing</span>
						</h1>
						<p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
							Learn Hiragana, Katakana, and Kanji through interactive practice. 
							Get instant feedback and build lasting skills.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<CleanButton
								size="lg"
								onClick={handleGetStarted}
								className="px-8 py-4 text-lg"
							>
								Start Learning
								<ArrowRight className="ml-2 h-5 w-5" />
							</CleanButton>
							<CleanButton
								variant="outline"
								size="lg"
								onClick={handleSignIn}
								className="px-8 py-4 text-lg"
							>
								Sign In
							</CleanButton>
						</div>
					</div>
				</section>

				{/* Social Proof */}
				<section className="py-16 bg-gray-50">
					<div className="max-w-6xl mx-auto px-6">
						<div className="text-center mb-12">
							<p className="text-gray-600 mb-8">Trusted by thousands of learners</p>
							<div className="flex items-center justify-center space-x-8 opacity-60">
								<div className="flex items-center space-x-2">
									<Star className="h-5 w-5 text-yellow-400 fill-current" />
									<Star className="h-5 w-5 text-yellow-400 fill-current" />
									<Star className="h-5 w-5 text-yellow-400 fill-current" />
									<Star className="h-5 w-5 text-yellow-400 fill-current" />
									<Star className="h-5 w-5 text-yellow-400 fill-current" />
									<span className="ml-2 text-gray-600">4.9/5</span>
								</div>
								<div className="text-gray-600">•</div>
								<div className="text-gray-600">50,000+ students</div>
								<div className="text-gray-600">•</div>
								<div className="text-gray-600">98% completion rate</div>
							</div>
						</div>
					</div>
				</section>

				{/* Features */}
				<section className="py-24">
					<div className="max-w-6xl mx-auto px-6">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-12">
							{/* Feature 1 */}
							<div className="text-center">
								<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
									<BookOpen className="h-8 w-8 text-gray-700" />
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-4">
									Interactive Practice
								</h3>
								<p className="text-gray-600 leading-relaxed">
									Learn through guided writing exercises with stroke order guidance and instant feedback.
								</p>
							</div>

							{/* Feature 2 */}
							<div className="text-center">
								<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
									<Zap className="h-8 w-8 text-gray-700" />
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-4">
									AI Feedback
								</h3>
								<p className="text-gray-600 leading-relaxed">
									Get instant recognition and correction suggestions powered by advanced OCR technology.
								</p>
							</div>

							{/* Feature 3 */}
							<div className="text-center">
								<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
									<Target className="h-8 w-8 text-gray-700" />
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-4">
									Progress Tracking
								</h3>
								<p className="text-gray-600 leading-relaxed">
									Monitor your learning journey with detailed analytics and personalized insights.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Japanese Characters */}
				<section className="py-24 bg-gray-50">
					<div className="max-w-6xl mx-auto px-6">
						<div className="text-center mb-16">
							<h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
								Learn All Writing Systems
							</h2>
							<p className="text-lg text-gray-600 max-w-2xl mx-auto">
								Master the three essential Japanese writing systems with our comprehensive curriculum.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{/* Hiragana */}
							<div className="bg-white p-8 rounded-lg border border-gray-200">
								<div className="text-center">
									<div className="text-6xl font-bold text-gray-900 mb-6">あ</div>
									<h3 className="text-xl font-semibold text-gray-900 mb-3">
										Hiragana
									</h3>
									<p className="text-gray-600 mb-4">
										Basic Japanese syllabary for native words and grammar.
									</p>
									<div className="text-sm text-gray-500">
										46 characters
									</div>
								</div>
							</div>

							{/* Katakana */}
							<div className="bg-white p-8 rounded-lg border border-gray-200">
								<div className="text-center">
									<div className="text-6xl font-bold text-gray-900 mb-6">ア</div>
									<h3 className="text-xl font-semibold text-gray-900 mb-3">
										Katakana
									</h3>
									<p className="text-gray-600 mb-4">
										Syllabary for foreign words and emphasis.
									</p>
									<div className="text-sm text-gray-500">
										46 characters
									</div>
								</div>
							</div>

							{/* Kanji */}
							<div className="bg-white p-8 rounded-lg border border-gray-200">
								<div className="text-center">
									<div className="text-6xl font-bold text-gray-900 mb-6">漢</div>
									<h3 className="text-xl font-semibold text-gray-900 mb-3">
										Kanji
									</h3>
									<p className="text-gray-600 mb-4">
										Chinese characters adapted for Japanese writing.
									</p>
									<div className="text-sm text-gray-500">
										2,000+ characters
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Benefits */}
				<section className="py-24">
					<div className="max-w-4xl mx-auto px-6">
						<div className="text-center mb-16">
							<h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
								Why Choose WriteWave?
							</h2>
						</div>

						<div className="space-y-8">
							{/* Benefit 1 */}
							<div className="flex items-start space-x-4">
								<div className="flex-shrink-0">
									<CheckCircle className="h-6 w-6 text-green-600 mt-1" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-2">
										Proven Learning Method
									</h3>
									<p className="text-gray-600">
										Our spaced repetition system ensures you retain what you learn long-term.
									</p>
								</div>
							</div>

							{/* Benefit 2 */}
							<div className="flex items-start space-x-4">
								<div className="flex-shrink-0">
									<CheckCircle className="h-6 w-6 text-green-600 mt-1" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-2">
										Adaptive Difficulty
									</h3>
									<p className="text-gray-600">
										The system adjusts to your skill level, keeping you challenged but not overwhelmed.
									</p>
								</div>
							</div>

							{/* Benefit 3 */}
							<div className="flex items-start space-x-4">
								<div className="flex-shrink-0">
									<CheckCircle className="h-6 w-6 text-green-600 mt-1" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-2">
										Community Support
									</h3>
									<p className="text-gray-600">
										Join study groups and connect with fellow learners for motivation and support.
									</p>
								</div>
							</div>

							{/* Benefit 4 */}
							<div className="flex items-start space-x-4">
								<div className="flex-shrink-0">
									<CheckCircle className="h-6 w-6 text-green-600 mt-1" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-2">
										Mobile Optimized
									</h3>
									<p className="text-gray-600">
										Practice anywhere with our mobile-first design and offline capabilities.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-24 bg-gray-900">
					<div className="max-w-4xl mx-auto px-6 text-center">
						<h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
							Start Your Japanese Journey Today
						</h2>
						<p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
							Join thousands of learners mastering Japanese writing with WriteWave.
						</p>
						<CleanButton
							size="lg"
							variant="secondary"
							onClick={handleGetStarted}
							className="px-8 py-4 text-lg"
						>
							Get Started Free
							<ArrowRight className="ml-2 h-5 w-5" />
						</CleanButton>
					</div>
				</section>

				{/* Footer */}
				<footer className="bg-white border-t border-gray-200 py-12">
					<div className="max-w-6xl mx-auto px-6">
						<div className="flex flex-col md:flex-row justify-between items-center">
							<div className="flex items-center mb-4 md:mb-0">
								<div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
									<span className="text-white font-bold text-sm">WW</span>
								</div>
								<span className="ml-3 text-lg font-semibold text-gray-900">WriteWave</span>
							</div>
							<div className="flex items-center space-x-6">
								<CleanButton
									variant="ghost"
									onClick={handleSignIn}
								>
									Sign In
								</CleanButton>
								<CleanButton
									variant="primary"
									onClick={handleGetStarted}
								>
									Get Started
								</CleanButton>
							</div>
						</div>
					</div>
				</footer>
			</main>
		</div>
	);
};
