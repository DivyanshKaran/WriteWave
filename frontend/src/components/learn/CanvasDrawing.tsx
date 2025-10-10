"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSpring, animated } from '@react-spring/web';

interface CanvasDrawingProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  onStrokeComplete?: (strokes: Stroke[]) => void;
  className?: string;
}

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  timestamp: number;
}

export const CanvasDrawing: React.FC<CanvasDrawingProps> = ({
  width = 320,
  height = 320,
  strokeColor = '#000000',
  strokeWidth = 3,
  onStrokeComplete,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  const { scale } = useSpring({
    scale: isDrawing ? 0.98 : 1,
    config: { tension: 300, friction: 30 },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Set drawing styles
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Redraw all strokes
    strokes.forEach(stroke => {
      if (stroke.points.length > 0) {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        
        ctx.stroke();
      }
    });

    // Draw current stroke
    if (currentStroke && currentStroke.points.length > 0) {
      ctx.strokeStyle = currentStroke.color;
      ctx.lineWidth = currentStroke.width;
      ctx.beginPath();
      ctx.moveTo(currentStroke.points[0].x, currentStroke.points[0].y);
      
      for (let i = 1; i < currentStroke.points.length; i++) {
        ctx.lineTo(currentStroke.points[i].x, currentStroke.points[i].y);
      }
      
      ctx.stroke();
    }
  }, [width, height, strokeColor, strokeWidth, strokes, currentStroke]);

  const getPointFromEvent = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  }, []);

  const startDrawing = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const point = getPointFromEvent(e);
    if (!point) return;

    setIsDrawing(true);
    setLastPoint(point);

    const newStroke: Stroke = {
      points: [point],
      color: strokeColor,
      width: strokeWidth,
      timestamp: Date.now(),
    };

    setCurrentStroke(newStroke);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [getPointFromEvent, strokeColor, strokeWidth]);

  const draw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing || !currentStroke) return;

    const point = getPointFromEvent(e);
    if (!point) return;

    // Smooth the stroke using Catmull-Rom spline
    const smoothedPoints = smoothStroke([lastPoint!, point]);
    
    setCurrentStroke(prev => ({
      ...prev!,
      points: [...prev!.points, ...smoothedPoints.slice(1)],
    }));

    setLastPoint(point);
  }, [isDrawing, currentStroke, getPointFromEvent, lastPoint]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing || !currentStroke) return;

    setIsDrawing(false);
    setStrokes(prev => [...prev, currentStroke]);
    setCurrentStroke(null);
    setLastPoint(null);

    if (onStrokeComplete) {
      onStrokeComplete([...strokes, currentStroke]);
    }
  }, [isDrawing, currentStroke, strokes, onStrokeComplete]);

  const smoothStroke = useCallback((points: { x: number; y: number }[]) => {
    if (points.length < 2) return points;

    const smoothed: { x: number; y: number }[] = [];
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i < points.length - 2 ? points[i + 2] : points[i + 1];

      // Catmull-Rom spline
      for (let t = 0; t < 1; t += 0.1) {
        const x = catmullRom(p0.x, p1.x, p2.x, p3.x, t);
        const y = catmullRom(p0.y, p1.y, p2.y, p3.y, t);
        smoothed.push({ x, y });
      }
    }

    return smoothed;
  }, []);

  const catmullRom = (p0: number, p1: number, p2: number, p3: number, t: number) => {
    const t2 = t * t;
    const t3 = t2 * t;
    
    return 0.5 * (
      (2 * p1) +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    );
  };

  const clearCanvas = useCallback(() => {
    setStrokes([]);
    setCurrentStroke(null);
    setLastPoint(null);
  }, []);

  const undoLastStroke = useCallback(() => {
    if (strokes.length > 0) {
      setStrokes(prev => prev.slice(0, -1));
    }
  }, [strokes.length]);

  return (
    <div className={`relative ${className}`}>
      <animated.canvas
        ref={canvasRef}
        style={{ scale }}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="border-base cursor-crosshair touch-none"
      />
      
      {/* Controls */}
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={undoLastStroke}
          disabled={strokes.length === 0}
          className="w-8 h-8 bg-gray-100 border-base flex items-center justify-center text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ↶
        </button>
        <button
          onClick={clearCanvas}
          className="w-8 h-8 bg-gray-100 border-base flex items-center justify-center text-sm hover:bg-gray-200"
        >
          ✕
        </button>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-2 left-2 text-xs text-gray-500">
        {isDrawing ? 'Drawing...' : 'Draw here'}
      </div>
    </div>
  );
};
