"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CleanAppShell, CleanPageLayout, CleanCard, CleanButton } from "@/components/layout";
import { BookOpen, Target, Settings, Play, RotateCcw, CheckCircle, Star, TrendingUp } from 'lucide-react';

export default function LearnPage() {
	const router = useRouter();
	const [currentView, setCurrentView] = useState<'overview' | 'practice' | 'lessons' | 'exercises'>('overview');

	const breadcrumbs = [
		{ label: 'Home', href: '/' },
		{ label: 'Learn', href: '/learn' }
	];

	const quickStats = [
		{ label: 'Characters Learned', value: '127', icon: <BookOpen className="w-5 h-5 text-gray-700" /> },
		{ label: 'Current Streak', value: '12 days', icon: <Target className="w-5 h-5 text-green-600" /> },
		{ label: 'Accuracy', value: '94%', icon: <CheckCircle className="w-5 h-5 text-purple-600" /> },
		{ label: 'Level', value: 'Intermediate', icon: <Star className="w-5 h-5 text-gray-700" /> }
	];

	const recentLessons = [
		{ id: 1, title: 'Hiragana Basics', progress: 85, difficulty: 'Beginner' },
		{ id: 2, title: 'Katakana Introduction', progress: 60, difficulty: 'Beginner' },
		{ id: 3, title: 'Basic Kanji', progress: 30, difficulty: 'Intermediate' }
	];

	const recommendedContent = [
		{ id: 1, title: 'Daily Practice', description: 'Continue your streak with today\'s practice', type: 'practice', href: '/practice' },
		{ id: 2, title: 'Review Weak Characters', description: 'Focus on characters you struggle with', type: 'review', href: '/practice/writing' },
		{ id: 3, title: 'New Vocabulary', description: 'Learn 10 new words', type: 'vocabulary', href: '/practice/vocabulary' }
	];

	return (
		<CleanAppShell currentPage="learn" user={{ streak: 12, notifications: 3 }}>
			<CleanPageLayout
				title="Learn Japanese"
				description="Master Japanese characters with interactive lessons and practice"
				breadcrumbs={breadcrumbs}
				actions={
					<div className="flex items-center space-x-3">
						<CleanButton variant="outline" size="sm">
							<Settings className="w-4 h-4 mr-2" />
							Settings
						</CleanButton>
						<CleanButton variant="primary" size="sm" onClick={() => router.push('/practice')}>
							<Play className="w-4 h-4 mr-2" />
							Start Practice
						</CleanButton>
					</div>
				}
			>
				<div className="p-6 space-y-6">
					{/* Quick Stats */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{quickStats.map((stat, index) => (
							<CleanCard key={index} padding="sm" className="text-center">
								<div className="flex items-center justify-center mb-2">
									{stat.icon}
								</div>
								<div className="text-2xl font-bold text-gray-900 mb-1">
									{stat.value}
								</div>
								<div className="text-sm text-gray-600">
									{stat.label}
								</div>
							</CleanCard>
						))}
					</div>

					{/* Main Content Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Recent Lessons */}
						<div className="lg:col-span-2">
							<CleanCard title="Recent Lessons" description="Continue where you left off">
								<div className="space-y-4">
									{recentLessons.map((lesson) => (
										<div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
											<div className="flex-1">
												<h4 className="font-medium text-gray-900">{lesson.title}</h4>
												<div className="flex items-center space-x-4 mt-1">
													<span className="text-sm text-gray-600">{lesson.difficulty}</span>
													<div className="flex items-center space-x-2">
													<div className="w-24 bg-gray-200 rounded-full h-2">
														<div 
															className="bg-green-600 h-2 rounded-full transition-all duration-300"
															style={{ width: `${lesson.progress}%` }}
														/>
													</div>
														<span className="text-sm text-gray-600">{lesson.progress}%</span>
													</div>
												</div>
											</div>
											<CleanButton variant="primary" size="sm">
												Continue
											</CleanButton>
										</div>
									))}
								</div>
							</CleanCard>
						</div>

						{/* Recommended Content */}
						<div>
							<CleanCard title="Recommended" description="Personalized content for you">
								<div className="space-y-3">
									{recommendedContent.map((item) => (
										<div key={item.id} className="p-3 bg-gray-50 rounded-lg">
											<h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
											<p className="text-sm text-gray-600 mb-2">{item.description}</p>
											<CleanButton 
												variant="outline" 
												size="sm" 
												fullWidth
												onClick={() => router.push(item.href)}
											>
												Start
											</CleanButton>
										</div>
									))}
								</div>
							</CleanCard>
						</div>
					</div>

				</div>
			</CleanPageLayout>
		</CleanAppShell>
	);
}
