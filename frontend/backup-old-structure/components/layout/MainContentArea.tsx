import React from "react";

interface MainContentAreaProps {
	children: React.ReactNode;
	hasSidebar?: boolean;
	className?: string;
}

interface GridProps {
	children: React.ReactNode;
	cols?: 1 | 2 | 3 | 4 | 6 | 12;
	gap?: "sm" | "md" | "lg";
	className?: string;
}

interface GridItemProps {
	children: React.ReactNode;
	span?: 1 | 2 | 3 | 4 | 6 | 12;
	className?: string;
}

// Grid system component
export const Grid: React.FC<GridProps> = ({
	children,
	cols = 12,
	gap = "md",
	className = "",
}) => {
	const gapClasses = {
		sm: "gap-2", // 8px
		md: "gap-6", // 24px
		lg: "gap-8", // 32px
	};

	const colClasses = {
		1: "grid-cols-1",
		2: "grid-cols-2",
		3: "grid-cols-3",
		4: "grid-cols-4",
		6: "grid-cols-6",
		12: "grid-cols-12",
	};

	return (
		<div
			className={`
      grid ${colClasses[cols]} ${gapClasses[gap]} ${className}
    `}
		>
			{children}
		</div>
	);
};

// Grid item component
export const GridItem: React.FC<GridItemProps> = ({
	children,
	span = 12,
	className = "",
}) => {
	const spanClasses = {
		1: "col-span-1",
		2: "col-span-2",
		3: "col-span-3",
		4: "col-span-4",
		6: "col-span-6",
		12: "col-span-12",
	};

	return <div className={`${spanClasses[span]} ${className}`}>{children}</div>;
};

// Main content area with responsive padding and max-width
export const MainContentArea: React.FC<MainContentAreaProps> = ({
	children,
	hasSidebar = false,
	className = "",
}) => {
	return (
		<div
			className={`
      min-h-screen transition-all duration-300
      ${hasSidebar ? "ml-70" : "ml-0"}
      lg:ml-${hasSidebar ? "70" : "0"}
    `}
		>
			<div className="max-w-screen-xl mx-auto">
				<div
					className={`
          px-6 py-8 lg:px-12 lg:py-16
          ${className}
        `}
				>
					{children}
				</div>
			</div>
		</div>
	);
};

// Container component for consistent max-width and centering
export const Container: React.FC<{
	children: React.ReactNode;
	className?: string;
}> = ({ children, className = "" }) => (
	<div className={`max-w-screen-xl mx-auto ${className}`}>{children}</div>
);

// Section component for consistent vertical spacing
export const Section: React.FC<{
	children: React.ReactNode;
	className?: string;
	padding?: "sm" | "md" | "lg";
}> = ({ children, className = "", padding = "md" }) => {
	const paddingClasses = {
		sm: "py-8", // 32px
		md: "py-16", // 64px
		lg: "py-24", // 96px
	};

	return (
		<section className={`${paddingClasses[padding]} ${className}`}>
			{children}
		</section>
	);
};

// Responsive utilities
export const ResponsiveGrid: React.FC<{
	children: React.ReactNode;
	className?: string;
}> = ({ children, className = "" }) => (
	<div
		className={`
    grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6
    ${className}
  `}
	>
		{children}
	</div>
);

export const ResponsiveFlex: React.FC<{
	children: React.ReactNode;
	className?: string;
	direction?: "row" | "col";
}> = ({ children, className = "", direction = "row" }) => (
	<div
		className={`
    flex flex-col md:flex-${direction} gap-4 md:gap-6
    ${className}
  `}
	>
		{children}
	</div>
);
