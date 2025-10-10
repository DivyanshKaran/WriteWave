import React from "react";

export interface BreadcrumbItem {
	label: string;
	href?: string;
	current?: boolean;
}

interface BreadcrumbProps {
	items: BreadcrumbItem[];
	className?: string;
}

const BreadcrumbItem: React.FC<{ item: BreadcrumbItem; isLast: boolean }> = ({
	item,
	isLast,
}) => {
	if (item.current) {
		return <span className="body text-xs text-black">{item.label}</span>;
	}

	return (
		<>
			<a
				href={item.href}
				className="body text-xs text-gray-600 hover:text-black hover:underline hover:underline-offset-2 transition-colors"
			>
				{item.label}
			</a>
			{!isLast && <span className="body text-xs text-gray-600 mx-2">/</span>}
		</>
	);
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
	items,
	className = "",
}) => {
	if (items.length === 0) return null;

	return (
		<nav className={`flex items-center ${className}`} aria-label="Breadcrumb">
			<ol className="flex items-center space-x-2">
				{items.map((item, index) => (
					<li key={index} className="flex items-center">
						<BreadcrumbItem item={item} isLast={index === items.length - 1} />
					</li>
				))}
			</ol>
		</nav>
	);
};
