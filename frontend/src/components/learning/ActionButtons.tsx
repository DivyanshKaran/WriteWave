"use client";

import React from "react";
import { motion } from "framer-motion";

interface ActionButtonsProps {
	onCheckAnswer: () => void;
	onShowHint: () => void;
	canCheckAnswer?: boolean;
	className?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
	onCheckAnswer,
	onShowHint,
	canCheckAnswer = false,
	className = "",
}) => {
	return (
		<motion.div
			className={`space-y-4 ${className}`}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: 0.4 }}
		>
			{/* Primary Button - Check Answer */}
			<motion.button
				onClick={onCheckAnswer}
				disabled={!canCheckAnswer}
				className={`
          w-full h-12 body text-base font-medium transition-all duration-200
          ${
						canCheckAnswer
							? "bg-black text-white hover:border-strong cursor-pointer"
							: "bg-gray-200 text-gray-600 cursor-not-allowed"
					}
        `}
				whileHover={canCheckAnswer ? { scale: 1.02 } : {}}
				whileTap={canCheckAnswer ? { scale: 0.98 } : {}}
				aria-label="Check your answer"
			>
				Check Answer
			</motion.button>

			{/* Secondary Button - Show Hint */}
			<motion.button
				onClick={onShowHint}
				className="w-full h-12 body text-base font-medium bg-white text-black border-base hover:border-strong transition-all duration-200"
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				aria-label="Show hint for this character"
			>
				Show Hint
			</motion.button>
		</motion.div>
	);
};
