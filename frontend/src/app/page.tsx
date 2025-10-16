"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores';
import { LandingPage } from '@/components/landing';

export default function HomePage() {
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
			<div className="min-h-screen flex items-center justify-center bg-white">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto mb-4"></div>
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	// Landing page for unauthenticated users
	return <LandingPage />;
}