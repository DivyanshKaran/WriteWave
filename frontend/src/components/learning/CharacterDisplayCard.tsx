"use client";

import React from "react";
import { motion } from "framer-motion";

interface CharacterDisplayCardProps {
	character: string;
	showStrokeOrder?: boolean;
	strokeOrderPaths?: string[];
	onStrokeComplete?: () => void;
	className?: string;
}

const StrokeOrderAnimation: React.FC<{
	paths: string[];
	onComplete: () => void;
}> = ({ paths, onComplete }) => {
	const [currentStroke, setCurrentStroke] = React.useState(0);

	React.useEffect(() => {
		if (paths.length === 0) return;

		setCurrentStroke(0);

		const animateStrokes = async () => {
			for (let i = 0; i < paths.length; i++) {
				setCurrentStroke(i);
				await new Promise((resolve) => setTimeout(resolve, 400));
			}
			onComplete();
		};

		animateStrokes();
	}, [paths, onComplete]);

	return (
		<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
			<svg width="240" height="240" viewBox="0 0 240 240" className="absolute">
				{paths.map((path, index) => (
					<g key={index}>
						{/* Stroke path */}
						<motion.path
							d={path}
							fill="none"
							stroke="black"
							strokeWidth="2"
							initial={{ pathLength: 0 }}
							animate={{
								pathLength: currentStroke >= index ? 1 : 0,
								opacity: currentStroke >= index ? 1 : 0,
							}}
							transition={{ duration: 0.4, ease: "easeInOut" }}
						/>

						{/* Stroke number */}
						{currentStroke >= index && (
							<motion.circle
								cx={path.split(" ")[1] || 120}
								cy={path.split(" ")[2] || 120}
								r="10"
								fill="white"
								stroke="black"
								strokeWidth="1"
								initial={{ scale: 0, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ duration: 0.2, delay: 0.2 }}
								className="text-xs font-medium flex items-center justify-center"
							>
								<text
									x="50%"
									y="50%"
									textAnchor="middle"
									dominantBaseline="middle"
									fontSize="10"
									fill="black"
								>
									{index + 1}
								</text>
							</motion.circle>
						)}
					</g>
				))}
			</svg>
		</div>
	);
};

export const CharacterDisplayCard: React.FC<CharacterDisplayCardProps> = ({
	character,
	showStrokeOrder = false,
	strokeOrderPaths = [],
	onStrokeComplete,
	className = "",
}) => {
	return (
		<div className={`relative ${className}`}>
			{/* Character Display Card */}
			<motion.div
				className="w-100 h-100 border-base bg-white flex items-center justify-center relative"
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.3, ease: "easeOut" }}
			>
				{/* Character Text */}
				<span className="jp text-[240px] leading-none">{character}</span>

				{/* Stroke Order Animation Overlay */}
				{showStrokeOrder && strokeOrderPaths.length > 0 && (
					<StrokeOrderAnimation
						paths={strokeOrderPaths}
						onComplete={onStrokeComplete || (() => {})}
					/>
				)}
			</motion.div>
		</div>
	);
};
