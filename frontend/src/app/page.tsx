"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores';
import { Button } from '@/components/ui';
import { ArrowRight, BookOpen, Target, Users, Zap } from 'lucide-react';

export default function LandingPage() {
	const router = useRouter();
	const { isAuthenticated, isLoading } = useUserStore();

	// Redirect based on authentication status
	useEffect(() => {
		if (!isLoading) {
			if (isAuthenticated) {
				router.push('/learn');
			}
		}
	}, [isAuthenticated, isLoading, router]);

	// Show loading state while checking authentication
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="body text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	// Landing page for unauthenticated users
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			<main id="main-content">
				{/* Navigation */}
				<nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex justify-between items-center h-16">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<h1 className="heading text-2xl font-bold text-primary">WriteWave</h1>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<Button
									variant="secondary"
									onClick={() => router.push('/login')}
								>
									Sign In
								</Button>
								<Button
									onClick={() => router.push('/register')}
								>
									Get Started
								</Button>
							</div>
						</div>
					</div>
				</nav>

				{/* Hero Section */}
				<section className="relative py-20 lg:py-32">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center">
							<h1 className="heading text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
								Master Japanese Writing
								<span className="block text-primary">with AI-Powered Feedback</span>
							</h1>
							<p className="body text-xl text-gray-600 max-w-3xl mx-auto mb-8">
								Learn Hiragana, Katakana, and Kanji through interactive writing practice. 
								Get instant OCR feedback, track your progress, and build lasting streaks.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Button
									size="lg"
									onClick={() => router.push('/register')}
									className="text-lg px-8 py-4"
								>
									Start Learning Free
									<ArrowRight className="ml-2 h-5 w-5" />
								</Button>
								<Button
									variant="secondary"
									size="lg"
									onClick={() => router.push('/login')}
									className="text-lg px-8 py-4"
								>
									Sign In
								</Button>
							</div>
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section className="py-20 bg-white">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-16">
							<h2 className="heading text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
								Why Choose WriteWave?
							</h2>
							<p className="body text-lg text-gray-600 max-w-2xl mx-auto">
								Our platform combines traditional learning methods with cutting-edge technology 
								to provide the most effective Japanese writing experience.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
							{/* Feature 1 */}
							<div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
								<div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
									<BookOpen className="h-8 w-8 text-primary" />
								</div>
								<h3 className="heading text-xl font-semibold text-gray-900 mb-2">
									Interactive Learning
								</h3>
								<p className="body text-gray-600">
									Practice writing Japanese characters with step-by-step stroke order guidance.
								</p>
							</div>

							{/* Feature 2 */}
							<div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
								<div className="bg-success/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
									<Zap className="h-8 w-8 text-success" />
								</div>
								<h3 className="heading text-xl font-semibold text-gray-900 mb-2">
									AI-Powered OCR
								</h3>
								<p className="body text-gray-600">
									Get instant feedback on your handwriting with advanced character recognition.
								</p>
							</div>

							{/* Feature 3 */}
							<div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
								<div className="bg-warning/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
									<Target className="h-8 w-8 text-warning" />
								</div>
								<h3 className="heading text-xl font-semibold text-gray-900 mb-2">
									Progress Tracking
								</h3>
								<p className="body text-gray-600">
									Track your learning journey with detailed analytics and achievement system.
								</p>
							</div>

							{/* Feature 4 */}
							<div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
								<div className="bg-error/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
									<Users className="h-8 w-8 text-error" />
								</div>
								<h3 className="heading text-xl font-semibold text-gray-900 mb-2">
									Community Learning
								</h3>
								<p className="body text-gray-600">
									Join study groups and connect with fellow Japanese learners worldwide.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Japanese Characters Preview */}
				<section className="py-20 bg-gray-50">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-16">
							<h2 className="heading text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
								Learn All Japanese Writing Systems
							</h2>
							<p className="body text-lg text-gray-600 max-w-2xl mx-auto">
								Master the three essential Japanese writing systems with our comprehensive curriculum.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{/* Hiragana */}
							<div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
								<div className="text-center">
									<div className="jp text-6xl font-bold text-primary mb-4">あ</div>
									<h3 className="heading text-2xl font-semibold text-gray-900 mb-2">
										Hiragana
									</h3>
									<p className="body text-gray-600 mb-4">
										Learn the basic Japanese syllabary used for native words and grammar.
									</p>
									<div className="text-sm text-gray-500">
										46 characters • Beginner level
									</div>
								</div>
							</div>

							{/* Katakana */}
							<div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
								<div className="text-center">
									<div className="jp text-6xl font-bold text-success mb-4">ア</div>
									<h3 className="heading text-2xl font-semibold text-gray-900 mb-2">
										Katakana
									</h3>
									<p className="body text-gray-600 mb-4">
										Master the syllabary used for foreign words and emphasis.
									</p>
									<div className="text-sm text-gray-500">
										46 characters • Beginner level
									</div>
								</div>
							</div>

							{/* Kanji */}
							<div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
								<div className="text-center">
									<div className="jp text-6xl font-bold text-warning mb-4">漢</div>
									<h3 className="heading text-2xl font-semibold text-gray-900 mb-2">
										Kanji
									</h3>
									<p className="body text-gray-600 mb-4">
										Study Chinese characters adapted for Japanese writing.
									</p>
									<div className="text-sm text-gray-500">
										2,000+ characters • Advanced level
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-20 bg-primary">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
						<h2 className="heading text-3xl lg:text-4xl font-bold text-white mb-4">
							Ready to Start Your Japanese Journey?
						</h2>
						<p className="body text-xl text-blue-100 max-w-2xl mx-auto mb-8">
							Join thousands of learners who have already mastered Japanese writing with WriteWave.
						</p>
						<Button
							size="lg"
							variant="secondary"
							onClick={() => router.push('/register')}
							className="text-lg px-8 py-4"
						>
							Get Started Today
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
					</div>
				</section>

				{/* Footer */}
				<footer className="bg-gray-900 text-white py-12">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center">
							<h3 className="heading text-2xl font-bold mb-4">WriteWave</h3>
							<p className="body text-gray-400 mb-6">
								Master Japanese writing with AI-powered feedback and gamified learning.
							</p>
							<div className="flex justify-center space-x-6">
								<Button
									variant="secondary"
									onClick={() => router.push('/login')}
								>
									Sign In
								</Button>
								<Button
									onClick={() => router.push('/register')}
								>
									Sign Up
								</Button>
							</div>
						</div>
					</div>
				</footer>
			</main>
		</div>
	);
}
