"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CharacterDisplayCard } from "@/components/learning/CharacterDisplayCard";
import { ProgressIndicators } from "@/components/learning/ProgressIndicators";
import { AnswerInputArea } from "@/components/learning/AnswerInputArea";
import { ActionButtons } from "@/components/learning/ActionButtons";

interface CharacterLearningInterfaceProps {
	character: string;
	strokeOrderPaths?: string[];
	currentLesson: number;
	totalLessons: number;
	progress: number;
	onAnswerCheck: (answer: string) => void;
	onHintRequest: () => void;
	onContinue: () => void;
	className?: string;
}

export const CharacterLearningInterface: React.FC<
	CharacterLearningInterfaceProps
> = ({
	character,
	strokeOrderPaths = [],
	currentLesson,
	totalLessons,
	progress,
	onAnswerCheck,
	onHintRequest,
	onContinue,
	className = "",
}) => {
	const [showStrokeOrder, setShowStrokeOrder] = useState(false);
	const [hasDrawing, setHasDrawing] = useState(false);
	const [showContinuePrompt, setShowContinuePrompt] = useState(false);

	const handleStrokeComplete = () => {
		setShowContinuePrompt(true);
	};

	const handleDrawingChange = (hasDrawing: boolean) => {
		setHasDrawing(hasDrawing);
	};

	const handleCheckAnswer = () => {
		if (!hasDrawing) return;
		onAnswerCheck("user-drawing");
	};

	const handleShowHint = () => {
		setShowStrokeOrder(true);
		onHintRequest();
	};

	const handleContinue = () => {
		setShowContinuePrompt(false);
		setShowStrokeOrder(false);
		onContinue();
	};

	return (
		<motion.div
			className={`max-w-md mx-auto space-y-8 ${className}`}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
		>
			{/* Progress Indicators */}
			<ProgressIndicators
				progress={progress}
				currentLesson={currentLesson}
				totalLessons={totalLessons}
				showContinuePrompt={showContinuePrompt}
			/>

			{/* Character Display Card */}
			<div className="flex justify-center">
				<CharacterDisplayCard
					character={character}
					showStrokeOrder={showStrokeOrder}
					strokeOrderPaths={strokeOrderPaths}
					onStrokeComplete={handleStrokeComplete}
				/>
			</div>

			{/* Answer Input Area */}
			<div className="flex justify-center">
				<AnswerInputArea
					onDrawingChange={handleDrawingChange}
					onClear={() => setHasDrawing(false)}
				/>
			</div>

			{/* Action Buttons */}
			<ActionButtons
				onCheckAnswer={handleCheckAnswer}
				onShowHint={handleShowHint}
				canCheckAnswer={hasDrawing}
			/>

			{/* Continue Overlay */}
			{showContinuePrompt && (
				<motion.div
					className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
					onClick={handleContinue}
				>
					<motion.div
						className="bg-white p-8 border-base text-center cursor-pointer"
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.3, delay: 0.1 }}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<p className="body text-lg font-medium mb-2">Great job!</p>
						<p className="body text-sm text-gray-600">
							Tap anywhere to continue
						</p>
					</motion.div>
				</motion.div>
			)}
		</motion.div>
	);
};
