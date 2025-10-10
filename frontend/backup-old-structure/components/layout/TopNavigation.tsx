"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

export interface TopNavigationItem {
	id: string;
	label: string;
	href: string;
	active?: boolean;
}

interface TopNavigationProps {
	items: TopNavigationItem[];
	className?: string;
}

const NavigationItem: React.FC<{ item: TopNavigationItem }> = ({ item }) => (
	<a
		href={item.href}
		className={`
      body text-sm font-medium uppercase tracking-[0.05em] transition-all duration-200 relative
      ${
				item.active
					? "text-black border-b-3 border-black pb-1"
					: "text-gray-800 hover:text-black hover:underline hover:underline-offset-4 hover:decoration-black"
			}
    `}
		aria-current={item.active ? "page" : undefined}
	>
		{item.label}
	</a>
);

const HamburgerMenu: React.FC<{ isOpen: boolean; onToggle: () => void }> = ({
	isOpen,
	onToggle,
}) => (
	<button
		onClick={onToggle}
		className="lg:hidden p-2 hover:border-strong rounded-sm"
		aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
		aria-expanded={isOpen}
	>
		{isOpen ? (
			<X className="w-4 h-4" strokeWidth={1.5} />
		) : (
			<div className="flex flex-col gap-0.5">
				<div className="w-4 h-0.5 bg-black"></div>
				<div className="w-4 h-0.5 bg-black"></div>
				<div className="w-4 h-0.5 bg-black"></div>
			</div>
		)}
	</button>
);

const MobileOverlay: React.FC<{
	isOpen: boolean;
	onClose: () => void;
	items: TopNavigationItem[];
}> = ({ isOpen, onClose, items }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-white z-50 lg:hidden">
			<div className="flex items-center justify-between p-6 border-b border-black">
				<div className="w-12 h-12 border-base flex items-center justify-center">
					<span className="heading text-xl font-bold">WW</span>
				</div>
				<button
					onClick={onClose}
					className="p-2 hover:border-strong rounded-sm"
					aria-label="Close navigation menu"
				>
					<X className="w-6 h-6" strokeWidth={1.5} />
				</button>
			</div>

			<nav className="flex flex-col p-6 space-y-6">
				{items.map((item) => (
					<a
						key={item.id}
						href={item.href}
						onClick={onClose}
						className={`
              body text-lg font-medium uppercase tracking-[0.05em] transition-colors
              ${
								item.active
									? "text-black border-l-3 border-black pl-4"
									: "text-gray-800 hover:text-black"
							}
            `}
						aria-current={item.active ? "page" : undefined}
					>
						{item.label}
					</a>
				))}
			</nav>
		</div>
	);
};

export const TopNavigation: React.FC<TopNavigationProps> = ({
	items,
	className = "",
}) => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	return (
		<>
			<nav className={`hidden lg:flex items-center space-x-8 ${className}`}>
				{items.map((item) => (
					<NavigationItem key={item.id} item={item} />
				))}
			</nav>

			<HamburgerMenu isOpen={isMobileMenuOpen} onToggle={toggleMobileMenu} />

			<MobileOverlay
				isOpen={isMobileMenuOpen}
				onClose={closeMobileMenu}
				items={items}
			/>
		</>
	);
};
