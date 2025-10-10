import React from "react";
import { Bell, Settings, Search, User } from "lucide-react";

export interface QuickAction {
	id: string;
	icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
	href?: string;
	onClick?: () => void;
	badge?: number;
	ariaLabel: string;
}

interface QuickActionsProps {
	actions: QuickAction[];
	streak?: number;
	className?: string;
}

const QuickActionButton: React.FC<{ action: QuickAction }> = ({ action }) => {
	const IconComponent = action.icon;

	const buttonContent = (
		<div className="relative w-8 h-8 border-base flex items-center justify-center hover:border-strong transition-colors">
			<IconComponent className="w-5 h-5" strokeWidth={1.5} />
			{action.badge && action.badge > 0 && (
				<span
					className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-error rounded-full"
					aria-label={`${action.badge} notifications`}
				/>
			)}
		</div>
	);

	if (action.href) {
		return (
			<a
				href={action.href}
				className="inline-block"
				aria-label={action.ariaLabel}
			>
				{buttonContent}
			</a>
		);
	}

	return (
		<button
			onClick={action.onClick}
			className="inline-block"
			aria-label={action.ariaLabel}
		>
			{buttonContent}
		</button>
	);
};

const StreakCounter: React.FC<{ streak: number }> = ({ streak }) => (
	<div className="w-8 h-8 border-base flex items-center justify-center">
		<span className="body text-sm font-medium">🔥{streak}</span>
	</div>
);

export const QuickActions: React.FC<QuickActionsProps> = ({
	actions,
	streak,
	className = "",
}) => {
	return (
		<div className={`flex items-center space-x-2 ${className}`}>
			{actions.map((action) => (
				<QuickActionButton key={action.id} action={action} />
			))}

			{streak !== undefined && <StreakCounter streak={streak} />}
		</div>
	);
};

// Predefined common actions
export const CommonQuickActions = {
	notifications: (count: number = 0): QuickAction => ({
		id: "notifications",
		icon: Bell,
		href: "/notifications",
		badge: count,
		ariaLabel: `Notifications${count > 0 ? ` (${count} unread)` : ""}`,
	}),

	search: (): QuickAction => ({
		id: "search",
		icon: Search,
		onClick: () => console.log("Search clicked"),
		ariaLabel: "Search",
	}),

	settings: (): QuickAction => ({
		id: "settings",
		icon: Settings,
		href: "/settings",
		ariaLabel: "Settings",
	}),

	profile: (): QuickAction => ({
		id: "profile",
		icon: User,
		href: "/profile",
		ariaLabel: "Profile",
	}),
};
