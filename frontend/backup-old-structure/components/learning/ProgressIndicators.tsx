"use client";

import React from "react";
import { motion } from "framer-motion";

interface ProgressIndicatorsProps {
	progress: number; // 0-1
	currentLesson: number;
	totalLessons: number;
	showContinuePrompt?: boolean;
	className?: string;
}

export const ProgressIndicators: React.FC<ProgressIndicatorsProps> = ({
	progress,
	currentLesson,
	totalLessons,
	showContinuePrompt = false,
	className = "",
}) => {
	return (
		<div className={`space-y-4 ${className}`}>
			{/* Top Progress Bar and Lesson Counter */}
			<div className="flex items-center justify-between">
				{/* Linear Progress Bar */}
				<div className="flex-1 mr-4">
					<div className="w-full h-2 border-base bg-white relative overflow-hidden">
						<motion.div
							className="h-full bg-success"
							initial={{ width: 0 }}
							animate={{ width: `${progress * 100}%` }}
							transition={{ duration: 0.5, ease: "easeOut" }}
						/>
					</div>
				</div>

				{/* Lesson Counter */}
				<div className="body text-sm text-gray-600 whitespace-nowrap">
					{currentLesson}/{totalLessons}
				</div>
			</div>

			{/* Continue Prompt */}
			{showContinuePrompt && (
				<motion.div
					className="text-center"
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.5 }}
				>
					<p className="body text-xs text-gray-600">Tap anywhere to continue</p>
				</motion.div>
			)}
		</div>
	);
};
