"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface AnswerInputAreaProps {
	onDrawingChange?: (hasDrawing: boolean) => void;
	onClear?: () => void;
	className?: string;
}

export const AnswerInputArea: React.FC<AnswerInputAreaProps> = ({
	onDrawingChange,
	onClear,
	className = "",
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [hasDrawing, setHasDrawing] = useState(false);

	const startDrawing = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			if (!canvasRef.current) return;

			const canvas = canvasRef.current;
			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			setIsDrawing(true);
			setHasDrawing(true);
			onDrawingChange?.(true);

			ctx.beginPath();
			ctx.moveTo(x, y);
		},
		[onDrawingChange],
	);

	const draw = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			if (!isDrawing || !canvasRef.current) return;

			const canvas = canvasRef.current;
			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			ctx.lineTo(x, y);
			ctx.stroke();
		},
		[isDrawing],
	);

	const stopDrawing = useCallback(() => {
		setIsDrawing(false);
	}, []);

	const clearCanvas = useCallback(() => {
		if (!canvasRef.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		setHasDrawing(false);
		onDrawingChange?.(false);
		onClear?.();
	}, [onDrawingChange, onClear]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Set canvas size
		canvas.width = 320;
		canvas.height = 320;

		// Configure drawing context
		ctx.strokeStyle = "black";
		ctx.lineWidth = 3;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
	}, []);

	return (
		<motion.div
			className={`relative ${className}`}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: 0.2 }}
		>
			{/* Canvas Drawing Area */}
			<div className="relative">
				<canvas
					ref={canvasRef}
					className="w-80 h-80 border-base bg-white cursor-crosshair"
					onMouseDown={startDrawing}
					onMouseMove={draw}
					onMouseUp={stopDrawing}
					onMouseLeave={stopDrawing}
				/>

				{/* Clear Button */}
				{hasDrawing && (
					<motion.button
						onClick={clearCanvas}
						className="absolute top-2 right-2 w-6 h-6 border-base bg-white hover:border-strong flex items-center justify-center"
						initial={{ scale: 0, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.2 }}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						aria-label="Clear drawing"
					>
						<X className="w-4 h-4" strokeWidth={1.5} />
					</motion.button>
				)}
			</div>
		</motion.div>
	);
};
