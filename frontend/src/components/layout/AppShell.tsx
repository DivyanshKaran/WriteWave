"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
	TopNavigation,
	QuickActions,
	CommonQuickActions,
	type TopNavigationItem,
} from "@/components/navigation";
import { MobileNavigationOverlay, BottomNavigation } from "@/components/responsive";
import { SkipLinks, FocusManager } from "@/components/accessibility";
import { A11Y_CONSTANTS } from "@/lib/accessibility/constants";

export interface UserAreaProps {
	avatar?: string;
	streak?: number;
	notifications?: number;
}

interface AppShellProps {
	children: React.ReactNode;
	navigation?: TopNavigationItem[];
	user?: UserAreaProps;
}

const Logo: React.FC = () => (
	<div className="w-12 h-12 border-base flex items-center justify-center">
		<span className="heading text-xl font-bold" aria-label="WriteWave Logo">WW</span>
	</div>
);

const UserArea: React.FC<UserAreaProps> = ({
	avatar,
	streak,
	notifications,
}) => {
	const quickActions = [
		CommonQuickActions.notifications(notifications || 0),
		CommonQuickActions.settings(),
		CommonQuickActions.profile(),
	];

	return (
		<div className="flex items-center gap-4">
			<QuickActions actions={quickActions} streak={streak} />

			<div className="w-8 h-8 border-base rounded-full flex items-center justify-center">
				{avatar ? (
					<Image
						src={avatar}
						alt="User avatar"
						width={32}
						height={32}
						className="rounded-full object-cover"
					/>
				) : (
					<div className="w-6 h-6 bg-gray-200 rounded-full" aria-hidden="true"></div>
				)}
			</div>
		</div>
	);
};

export const AppShell: React.FC<AppShellProps> = ({
	children,
	navigation = [],
	user = {},
}) => {
	const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

	return (
		<div className="min-h-screen bg-white">
			{/* Skip Links */}
			<SkipLinks />
			
			{/* Fixed Header - Responsive Height */}
			<header 
				id="navigation"
				role="banner"
				className="fixed top-0 left-0 right-0 bg-white border-b border-black z-50 mobile:h-14 tablet:h-16 desktop:h-16"
			>
				<div className="max-w-screen-xl mx-auto px-4 mobile:px-4 tablet:px-6 desktop:px-6 h-full flex items-center justify-between">
					<Logo />
					
					{/* Desktop Navigation */}
					<nav className="hidden tablet:block desktop:block" role="navigation" aria-label="Main navigation">
						<TopNavigation items={navigation} />
					</nav>
					
					{/* Mobile Navigation Button */}
					<div className="block tablet:hidden desktop:hidden">
						<button
							onClick={() => setIsMobileNavOpen(true)}
							className={`w-10 h-10 flex items-center justify-center border-base hover:border-strong ${A11Y_CONSTANTS.FOCUS_RING}`}
							aria-label="Open navigation menu"
							aria-expanded={isMobileNavOpen}
							aria-controls="mobile-navigation"
						>
							<div className="w-4 h-4 flex flex-col justify-between">
								<div className="w-full h-0.5 bg-black"></div>
								<div className="w-full h-0.5 bg-black"></div>
								<div className="w-full h-0.5 bg-black"></div>
							</div>
						</button>
					</div>
					
					<UserArea {...user} />
				</div>
			</header>

			{/* Mobile Navigation Overlay */}
			<MobileNavigationOverlay
				isOpen={isMobileNavOpen}
				onClose={() => setIsMobileNavOpen(false)}
				navigation={navigation}
			/>

			{/* Main Content with responsive header offset */}
			<main 
				id="main-content"
				role="main"
				className="mobile:pt-14 tablet:pt-16 desktop:pt-16 mobile:pb-16 tablet:pb-0 desktop:pb-0"
			>
				{children}
			</main>

			{/* Bottom Navigation - Mobile Only */}
			<div className="block tablet:hidden desktop:hidden">
				<BottomNavigation />
			</div>
		</div>
	);
};
