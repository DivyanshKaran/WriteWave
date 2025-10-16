"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CharacterDisplayCard } from "@/components/learning/CharacterDisplayCard";
import { ProgressIndicators } from "@/components/learning/ProgressIndicators";
import { AnswerInputArea } from "@/components/learning/AnswerInputArea";
import { ActionButtons } from "@/components/learning/ActionButtons";
import { Volume2, VolumeX, RotateCcw, CheckCircle, XCircle, AlertCircle, Star, Target, Clock, Zap } from "lucide-react";
import type { Character, CharacterRecognitionResult } from "@/types/character";

interface CharacterLearningInterfaceProps {
	character: Character;
	currentLesson: number;
	totalLessons: number;
	progress: number;
	onAnswerCheck: (result: CharacterRecognitionResult) => void;
	onHintRequest: () => void;
	onContinue: () => void;
	onSkip: () => void;
	className?: string;
}

interface OCRFeedback {
	accuracy: number;
	strokeOrder: number;
	proportions: number;
	overall: number;
	suggestions: string[];
	confidence: number;
}

interface LearningMetrics {
	attempts: number;
	timeSpent: number;
	bestScore: number;
	improvement: number;
}

export const CharacterLearningInterface: React.FC<
	CharacterLearningInterfaceProps
> = ({
	character,
	currentLesson,
	totalLessons,
	progress,
	onAnswerCheck,
	onHintRequest,
	onContinue,
	onSkip,
	className = "",
}) => {
	const [showStrokeOrder, setShowStrokeOrder] = useState(false);
	const [hasDrawing, setHasDrawing] = useState(false);
	const [showContinuePrompt, setShowContinuePrompt] = useState(false);
	const [isAudioPlaying, setIsAudioPlaying] = useState(false);
	const [ocrFeedback, setOcrFeedback] = useState<OCRFeedback | null>(null);
	const [learningMetrics, setLearningMetrics] = useState<LearningMetrics>({
		attempts: 0,
		timeSpent: 0,
		bestScore: 0,
		improvement: 0
	});
	const [showFeedback, setShowFeedback] = useState(false);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [currentMode, setCurrentMode] = useState<'practice' | 'recognition' | 'stroke-order'>('practice');
	
	const audioRef = useRef<HTMLAudioElement>(null);
	const startTimeRef = useRef<number>(Date.now());

	useEffect(() => {
		startTimeRef.current = Date.now();
		return () => {
			const timeSpent = Date.now() - startTimeRef.current;
			setLearningMetrics(prev => ({ ...prev, timeSpent: prev.timeSpent + timeSpent }));
		};
	}, [character]);

	const handleStrokeComplete = () => {
		setShowContinuePrompt(true);
	};

	const handleDrawingChange = (hasDrawing: boolean) => {
		setHasDrawing(hasDrawing);
	};

	const handleCheckAnswer = async () => {
		if (!hasDrawing) return;
		
		setIsAnalyzing(true);
		
		// Simulate OCR analysis
		await new Promise(resolve => setTimeout(resolve, 2000));
		
		// Mock OCR feedback
		const mockFeedback: OCRFeedback = {
			accuracy: Math.floor(Math.random() * 40) + 60, // 60-100%
			strokeOrder: Math.floor(Math.random() * 30) + 70, // 70-100%
			proportions: Math.floor(Math.random() * 50) + 50, // 50-100%
			overall: 0,
			suggestions: [
				"Try to make the strokes more consistent",
				"Pay attention to the stroke order",
				"The proportions look good!"
			],
			confidence: Math.floor(Math.random() * 30) + 70 // 70-100%
		};
		
		mockFeedback.overall = Math.round((mockFeedback.accuracy + mockFeedback.strokeOrder + mockFeedback.proportions) / 3);
		
		setOcrFeedback(mockFeedback);
		setShowFeedback(true);
		setIsAnalyzing(false);
		
		// Update metrics
		setLearningMetrics(prev => ({
			...prev,
			attempts: prev.attempts + 1,
			bestScore: Math.max(prev.bestScore, mockFeedback.overall),
			improvement: mockFeedback.overall - prev.bestScore
		}));

		// Create recognition result
		const result: CharacterRecognitionResult = {
			characterId: character.id,
			recognized: mockFeedback.overall >= 80,
			confidence: mockFeedback.confidence / 100,
			accuracy: mockFeedback.accuracy / 100,
			strokeOrder: mockFeedback.strokeOrder / 100,
			proportions: mockFeedback.proportions / 100,
			feedback: mockFeedback.suggestions,
			timestamp: new Date().toISOString()
		};

		onAnswerCheck(result);
	};

	const handleShowHint = () => {
		setShowStrokeOrder(true);
		onHintRequest();
	};

	const handleContinue = () => {
		setShowContinuePrompt(false);
		setShowStrokeOrder(false);
		setShowFeedback(false);
		setOcrFeedback(null);
		onContinue();
	};

	const handleSkip = () => {
		onSkip();
	};

	const playAudio = () => {
		if (audioRef.current) {
			if (isAudioPlaying) {
				audioRef.current.pause();
				setIsAudioPlaying(false);
			} else {
				audioRef.current.play();
				setIsAudioPlaying(true);
			}
		}
	};

	const clearCanvas = () => {
		setHasDrawing(false);
		setOcrFeedback(null);
		setShowFeedback(false);
	};

	const getFeedbackColor = (score: number) => {
		if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
		if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
		return 'text-red-600 bg-red-50 border-red-200';
	};

	const getFeedbackIcon = (score: number) => {
		if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
		if (score >= 60) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
		return <XCircle className="w-5 h-5 text-red-600" />;
	};

	return (
		<div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 ${className}`}>
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="heading text-3xl font-bold text-gray-900">Character Practice</h1>
						<p className="body text-gray-600">
							Lesson {currentLesson} of {totalLessons} • {Math.round(progress)}% complete
						</p>
					</div>
					
					<div className="flex items-center space-x-4">
						{/* Mode Selector */}
						<div className="flex items-center border-base rounded-lg p-1">
							{['practice', 'recognition', 'stroke-order'].map((mode) => (
								<button
									key={mode}
									onClick={() => setCurrentMode(mode as typeof currentMode)}
									className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
										currentMode === mode
											? 'bg-primary text-white'
											: 'text-gray-600 hover:text-gray-900'
									}`}
								>
									{mode.replace('-', ' ')}
								</button>
							))}
						</div>
						
						{/* Skip Button */}
						<button
							onClick={handleSkip}
							className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
						>
							Skip
						</button>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Content Area */}
					<div className="lg:col-span-2 space-y-6">
						{/* Progress Bar */}
						<div className="bg-white border-base rounded-lg p-4 shadow-sm">
							<div className="flex items-center justify-between text-sm text-gray-600 mb-2">
								<span>Progress</span>
								<span>{Math.round(progress)}%</span>
							</div>
							<div className="w-full bg-gray-200 h-3 rounded-full">
								<div 
									className="bg-primary h-3 rounded-full transition-all duration-300"
									style={{ width: `${progress}%` }}
								/>
							</div>
						</div>

						{/* Character Display */}
						<div className="bg-white border-base rounded-lg p-8 shadow-sm text-center">
							<div className="text-8xl font-bold text-primary mb-4">
								{character.character}
							</div>
							
							<div className="space-y-2 mb-6">
								<div className="text-lg text-gray-600">
									<strong>Readings:</strong> {character.readings.join(', ')}
								</div>
								<div className="text-lg text-gray-600">
									<strong>Meanings:</strong> {character.meanings.join(', ')}
								</div>
							</div>

							{/* Audio Button */}
							<button
								onClick={playAudio}
								className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors mx-auto"
							>
								{isAudioPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
								<span>Listen</span>
							</button>
							
							<audio ref={audioRef} onEnded={() => setIsAudioPlaying(false)}>
								<source src={`/audio/${character.id}.mp3`} type="audio/mpeg" />
							</audio>
						</div>

						{/* Drawing Canvas */}
						<div className="bg-white border-base rounded-lg p-6 shadow-sm">
							<div className="flex items-center justify-between mb-4">
								<h3 className="heading text-lg font-semibold">Practice Drawing</h3>
								<button
									onClick={clearCanvas}
									className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
								>
									<RotateCcw className="w-4 h-4" />
									<span>Clear</span>
								</button>
							</div>
							
							<div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
								<AnswerInputArea
									onDrawingChange={handleDrawingChange}
									onClear={clearCanvas}
								/>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex items-center justify-center space-x-4">
							<button
								onClick={handleShowHint}
								className="flex items-center space-x-2 px-6 py-3 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
							>
								<Target className="w-4 h-4" />
								<span>Show Hint</span>
							</button>
							
							<button
								onClick={handleCheckAnswer}
								disabled={!hasDrawing || isAnalyzing}
								className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isAnalyzing ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
										<span>Analyzing...</span>
									</>
								) : (
									<>
										<CheckCircle className="w-4 h-4" />
										<span>Check Answer</span>
									</>
								)}
							</button>
						</div>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Learning Metrics */}
						<div className="bg-white border-base rounded-lg p-6 shadow-sm">
							<h3 className="heading text-lg font-semibold mb-4">Your Progress</h3>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm text-gray-600">Attempts</span>
									<span className="font-medium">{learningMetrics.attempts}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-gray-600">Best Score</span>
									<span className="font-medium">{learningMetrics.bestScore}%</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-gray-600">Time Spent</span>
									<span className="font-medium">{Math.round(learningMetrics.timeSpent / 1000)}s</span>
								</div>
								{learningMetrics.improvement > 0 && (
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">Improvement</span>
										<span className="font-medium text-green-600">+{learningMetrics.improvement}%</span>
									</div>
								)}
							</div>
						</div>

						{/* Stroke Order Hint */}
						{showStrokeOrder && (
							<div className="bg-white border-base rounded-lg p-6 shadow-sm">
								<h3 className="heading text-lg font-semibold mb-4">Stroke Order</h3>
								<div className="text-center">
									<div className="text-4xl font-bold text-primary mb-2">
										{character.character}
									</div>
									<p className="text-sm text-gray-600">
										Follow the numbered strokes to practice the correct order
									</p>
								</div>
							</div>
						)}

						{/* Character Info */}
						<div className="bg-white border-base rounded-lg p-6 shadow-sm">
							<h3 className="heading text-lg font-semibold mb-4">Character Info</h3>
							<div className="space-y-3">
								<div>
									<span className="text-sm text-gray-600">Type:</span>
									<span className="ml-2 font-medium capitalize">{character.type}</span>
								</div>
								<div>
									<span className="text-sm text-gray-600">Difficulty:</span>
									<span className="ml-2 font-medium">{character.difficulty}/5</span>
								</div>
								<div>
									<span className="text-sm text-gray-600">Strokes:</span>
									<span className="ml-2 font-medium">{character.strokeCount}</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* OCR Feedback Overlay */}
				<AnimatePresence>
					{showFeedback && ocrFeedback && (
						<motion.div
							className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={handleContinue}
						>
							<motion.div
								className="bg-white border-base rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl"
								initial={{ scale: 0.9, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.9, opacity: 0 }}
								onClick={(e) => e.stopPropagation()}
							>
								<div className="text-center space-y-6">
									{/* Overall Score */}
									<div className="flex items-center justify-center space-x-3">
										{getFeedbackIcon(ocrFeedback.overall)}
										<div>
											<div className="text-3xl font-bold text-gray-900">
												{ocrFeedback.overall}%
											</div>
											<div className="text-sm text-gray-600">Overall Score</div>
										</div>
									</div>

									{/* Detailed Scores */}
									<div className="grid grid-cols-3 gap-4">
										<div className="text-center">
											<div className="text-lg font-bold text-gray-900">
												{ocrFeedback.accuracy}%
											</div>
											<div className="text-xs text-gray-600">Accuracy</div>
										</div>
										<div className="text-center">
											<div className="text-lg font-bold text-gray-900">
												{ocrFeedback.strokeOrder}%
											</div>
											<div className="text-xs text-gray-600">Stroke Order</div>
										</div>
										<div className="text-center">
											<div className="text-lg font-bold text-gray-900">
												{ocrFeedback.proportions}%
											</div>
											<div className="text-xs text-gray-600">Proportions</div>
										</div>
									</div>

									{/* Suggestions */}
									<div className="text-left">
										<h4 className="font-medium text-gray-900 mb-2">Suggestions:</h4>
										<ul className="text-sm text-gray-600 space-y-1">
											{ocrFeedback.suggestions.map((suggestion, index) => (
												<li key={index} className="flex items-start space-x-2">
													<div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
													<span>{suggestion}</span>
												</li>
											))}
										</ul>
									</div>

									{/* Continue Button */}
									<button
										onClick={handleContinue}
										className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
									>
										Continue
									</button>
								</div>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};
