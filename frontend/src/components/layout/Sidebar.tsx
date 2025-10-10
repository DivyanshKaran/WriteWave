"use client";

import React, { useState } from "react";

export interface SidebarSection {
	id: string;
	title: string;
	items: SidebarItem[];
}

export interface SidebarItem {
	id: string;
	label: string;
	href: string;
	icon?: React.ReactNode;
	active?: boolean;
}

interface SidebarProps {
	sections: SidebarSection[];
	collapsed?: boolean;
	onToggleCollapse?: () => void;
}

const SidebarSection: React.FC<{
	section: SidebarSection;
	collapsed: boolean;
}> = ({ section, collapsed }) => (
	<div className="mb-8">
		{!collapsed && (
			<h3 className="body text-xs uppercase tracking-widest text-gray-600 mb-4 px-6">
				{section.title}
			</h3>
		)}
		<nav>
			{section.items.map((item) => (
				<a
					key={item.id}
					href={item.href}
					className={`flex items-center h-10 px-6 transition-colors ${
						item.active
							? "bg-gray-50 border-l-2 border-black text-black"
							: "text-gray-800 hover:bg-gray-50"
					}`}
					title={collapsed ? item.label : undefined}
				>
					{item.icon && (
						<span className={`${collapsed ? "mx-auto" : "mr-3"} flex-shrink-0`}>
							{item.icon}
						</span>
					)}
					{!collapsed && (
						<span className="body text-base truncate">{item.label}</span>
					)}
				</a>
			))}
		</nav>
	</div>
);

const CollapseButton: React.FC<{
	collapsed: boolean;
	onToggle: () => void;
}> = ({ collapsed, onToggle }) => (
	<button
		onClick={onToggle}
		className="absolute top-4 right-4 p-2 hover:border-strong rounded-sm"
		aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
	>
		<svg
			className="w-4 h-4"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
			/>
		</svg>
	</button>
);

export const Sidebar: React.FC<SidebarProps> = ({
	sections,
	collapsed = false,
	onToggleCollapse,
}) => {
	const [isCollapsed, setIsCollapsed] = useState(collapsed);

	const handleToggle = () => {
		setIsCollapsed(!isCollapsed);
		onToggleCollapse?.();
	};

	return (
		<aside
			className={`
      fixed left-0 top-16 bottom-0 bg-white border-r border-black z-40 transition-all duration-300
      ${isCollapsed ? "w-16" : "w-70"}
    `}
		>
			<div className="relative h-full overflow-y-auto">
				<CollapseButton collapsed={isCollapsed} onToggle={handleToggle} />

				<div className="pt-16 pb-8">
					{sections.map((section) => (
						<SidebarSection
							key={section.id}
							section={section}
							collapsed={isCollapsed}
						/>
					))}
				</div>
			</div>
		</aside>
	);
};

// Default icons for common navigation items
export const SidebarIcons = {
	home: (
		<svg
			className="w-5 h-5"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
			/>
		</svg>
	),
	learn: (
		<svg
			className="w-5 h-5"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
			/>
		</svg>
	),
	progress: (
		<svg
			className="w-5 h-5"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
			/>
		</svg>
	),
	settings: (
		<svg
			className="w-5 h-5"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
			/>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
			/>
		</svg>
	),
};
