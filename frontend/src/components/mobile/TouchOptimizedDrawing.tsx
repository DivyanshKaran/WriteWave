"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pen, Eraser, RotateCcw, Download, Share2, Settings, ZoomIn, ZoomOut, Smartphone, Tablet, Monitor, Brush, Pencil, Undo, Trash2 } from 'lucide-react';

interface TouchOptimizedDrawingProps {
  userId: string;
  character?: string;
  onDrawingComplete?: (drawingData: DrawingData) => void;
  onDrawingChange?: (drawingData: DrawingData) => void;
  className?: string;
}

interface DrawingData {
  strokes: Stroke[];
  width: number;
  height: number;
  timestamp: string;
  device: 'mobile' | 'tablet' | 'desktop';
  touchPoints: number;
  pressure: number[];
  velocity: number[];
}

interface Stroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
  opacity: number;
  tool: 'pen' | 'eraser' | 'brush' | 'pencil';
  pressure: number[];
  velocity: number[];
  timestamp: string;
  device: 'mobile' | 'tablet' | 'desktop';
}

interface Point {
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
  velocity: number;
}

interface DrawingTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: 'pen' | 'eraser' | 'brush' | 'pencil' | 'highlighter';
  size: number;
  opacity: number;
  color: string;
  pressureSensitive: boolean;
  velocitySensitive: boolean;
}

interface DrawingSettings {
  canvasSize: 'small' | 'medium' | 'large' | 'fullscreen';
  gridVisible: boolean;
  guidelinesVisible: boolean;
  strokeOrderVisible: boolean;
  pressureSensitivity: boolean;
  velocitySensitivity: boolean;
  smoothing: number;
  snapToGrid: boolean;
  autoSave: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export const TouchOptimizedDrawing: React.FC<TouchOptimizedDrawingProps> = ({
  userId,
  character = 'あ',
  onDrawingComplete,
  onDrawingChange,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [selectedTool, setSelectedTool] = useState<DrawingTool | null>(null);
  const [settings, setSettings] = useState<DrawingSettings>({
    canvasSize: 'medium',
    gridVisible: true,
    guidelinesVisible: true,
    strokeOrderVisible: true,
    pressureSensitivity: true,
    velocitySensitivity: true,
    smoothing: 0.5,
    snapToGrid: false,
    autoSave: true,
    theme: 'auto'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showTools, setShowTools] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastTouchTime, setLastTouchTime] = useState(0);
  const [touchCount, setTouchCount] = useState(0);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Drawing tools
  const tools: DrawingTool[] = [
    {
      id: 'pen',
      name: 'Pen',
      icon: <Pen className="w-5 h-5" />,
      type: 'pen',
      size: 3,
      opacity: 1,
      color: '#000000',
      pressureSensitive: true,
      velocitySensitive: true
    },
    {
      id: 'brush',
      name: 'Brush',
      icon: <Brush className="w-5 h-5" />,
      type: 'brush',
      size: 8,
      opacity: 0.8,
      color: '#000000',
      pressureSensitive: true,
      velocitySensitive: true
    },
    {
      id: 'pencil',
      name: 'Pencil',
      icon: <Pencil className="w-5 h-5" />,
      type: 'pencil',
      size: 2,
      opacity: 0.7,
      color: '#000000',
      pressureSensitive: true,
      velocitySensitive: false
    },
    {
      id: 'eraser',
      name: 'Eraser',
      icon: <Eraser className="w-5 h-5" />,
      type: 'eraser',
      size: 10,
      opacity: 1,
      color: '#ffffff',
      pressureSensitive: true,
      velocitySensitive: false
    }
  ];

  // Initialize device type and canvas
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
        setCanvasSize({ width: 300, height: 300 });
      } else if (width < 1024) {
        setDeviceType('tablet');
        setCanvasSize({ width: 400, height: 400 });
      } else {
        setDeviceType('desktop');
        setCanvasSize({ width: 500, height: 500 });
      }
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  // Initialize selected tool
  useEffect(() => {
    if (tools.length > 0 && !selectedTool) {
      setSelectedTool(tools[0]);
    }
  }, [tools, selectedTool]);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Set up canvas context
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw grid if enabled
    if (settings.gridVisible) {
      drawGrid(ctx);
    }

    // Draw guidelines if enabled
    if (settings.guidelinesVisible) {
      drawGuidelines(ctx);
    }

    // Redraw all strokes
    redrawCanvas(ctx);
  }, [canvasSize, settings, strokes]);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    const gridSize = 20;
    for (let x = 0; x <= canvasSize.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasSize.height);
      ctx.stroke();
    }

    for (let y = 0; y <= canvasSize.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize.width, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  };

  const drawGuidelines = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    // Center lines
    ctx.beginPath();
    ctx.moveTo(canvasSize.width / 2, 0);
    ctx.lineTo(canvasSize.width / 2, canvasSize.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, canvasSize.height / 2);
    ctx.lineTo(canvasSize.width, canvasSize.height / 2);
    ctx.stroke();

    ctx.setLineDash([]);
  };

  const redrawCanvas = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Redraw all strokes
    strokes.forEach(stroke => {
      drawStroke(ctx, stroke);
    });
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 2) return;

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.globalAlpha = stroke.opacity;

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    for (let i = 1; i < stroke.points.length; i++) {
      const point = stroke.points[i];
      ctx.lineTo(point.x, point.y);
    }

    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  const getTouchPoint = (event: TouchEvent | MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 1, timestamp: Date.now(), velocity: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let x: number, y: number, pressure: number;

    if ('touches' in event) {
      const touch = event.touches[0];
      x = (touch.clientX - rect.left) * scaleX;
      y = (touch.clientY - rect.top) * scaleY;
      pressure = touch.force || 1;
    } else {
      x = (event.clientX - rect.left) * scaleX;
      y = (event.clientY - rect.top) * scaleY;
      pressure = 1;
    }

    return {
      x: x - pan.x,
      y: y - pan.y,
      pressure,
      timestamp: Date.now(),
      velocity: 0
    };
  };

  const calculateVelocity = (point1: Point, point2: Point): number => {
    const distance = Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
    const time = point2.timestamp - point1.timestamp;
    return time > 0 ? distance / time : 0;
  };

  const startDrawing = useCallback((event: TouchEvent | MouseEvent) => {
    event.preventDefault();
    
    if (!selectedTool) return;

    const point = getTouchPoint(event);
    const stroke: Stroke = {
      id: `stroke-${Date.now()}`,
      points: [point],
      color: selectedTool.color,
      width: selectedTool.size,
      opacity: selectedTool.opacity,
      tool: selectedTool.type,
      pressure: [point.pressure],
      velocity: [0],
      timestamp: new Date().toISOString(),
      device: deviceType
    };

    setCurrentStroke(stroke);
    setIsDrawing(true);
  }, [selectedTool, deviceType, pan]);

  const draw = useCallback((event: TouchEvent | MouseEvent) => {
    event.preventDefault();
    
    if (!isDrawing || !currentStroke) return;

    const point = getTouchPoint(event);
    const lastPoint = currentStroke.points[currentStroke.points.length - 1];
    const velocity = calculateVelocity(lastPoint, point);

    const updatedStroke: Stroke = {
      ...currentStroke,
      points: [...currentStroke.points, point],
      pressure: [...currentStroke.pressure, point.pressure],
      velocity: [...currentStroke.velocity, velocity]
    };

    setCurrentStroke(updatedStroke);

    // Draw on canvas
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && updatedStroke.points.length > 1) {
      const prevPoint = updatedStroke.points[updatedStroke.points.length - 2];
      const currentPoint = updatedStroke.points[updatedStroke.points.length - 1];

      ctx.strokeStyle = updatedStroke.color;
      ctx.lineWidth = updatedStroke.width;
      ctx.globalAlpha = updatedStroke.opacity;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(prevPoint.x, prevPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }, [isDrawing, currentStroke, deviceType, pan]);

  const stopDrawing = useCallback((event: TouchEvent | MouseEvent) => {
    event.preventDefault();
    
    if (!isDrawing || !currentStroke) return;

    setStrokes(prev => [...prev, currentStroke]);
    setCurrentStroke(null);
    setIsDrawing(false);

    // Notify parent component
    if (onDrawingChange) {
      const drawingData: DrawingData = {
        strokes: [...strokes, currentStroke],
        width: canvasSize.width,
        height: canvasSize.height,
        timestamp: new Date().toISOString(),
        device: deviceType,
        touchPoints: touchCount,
        pressure: currentStroke.pressure,
        velocity: currentStroke.velocity
      };
      onDrawingChange(drawingData);
    }
  }, [isDrawing, currentStroke, strokes, canvasSize, deviceType, touchCount, onDrawingChange]);

  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke(null);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
      if (settings.gridVisible) drawGrid(ctx);
      if (settings.guidelinesVisible) drawGuidelines(ctx);
    }
  };

  const undoLastStroke = () => {
    setStrokes(prev => prev.slice(0, -1));
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handlePan = (deltaX: number, deltaY: number) => {
    setPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
  };

  const handleTouchStart = (event: TouchEvent) => {
    const now = Date.now();
    const timeSinceLastTouch = now - lastTouchTime;
    
    if (timeSinceLastTouch < 300) {
      setTouchCount(prev => prev + 1);
    } else {
      setTouchCount(1);
    }
    
    setLastTouchTime(now);

    if (event.touches.length === 1) {
      startDrawing(event);
    } else if (event.touches.length === 2) {
      setIsPanning(true);
    }
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (event.touches.length === 1 && isDrawing) {
      draw(event);
    } else if (event.touches.length === 2 && isPanning) {
      // Handle pinch-to-zoom and pan
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      // Simple pan implementation
      const deltaX = touch1.clientX - (touch1.clientX || 0);
      const deltaY = touch1.clientY - (touch1.clientY || 0);
      handlePan(deltaX, deltaY);
    }
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (event.touches.length === 0) {
      if (isDrawing) {
        stopDrawing(event);
      }
      setIsPanning(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center space-x-3">
          <div className="text-2xl font-bold text-primary">{character}</div>
          <div>
            <h3 className="font-semibold text-gray-900">Touch Drawing</h3>
            <p className="text-sm text-gray-600">Optimized for {deviceType}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTools(!showTools)}
            className="p-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Brush className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tools Panel */}
      {showTools && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex items-center justify-between p-4 bg-gray-50 border-b"
        >
          <div className="flex items-center space-x-2">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool)}
                className={`p-3 rounded-lg transition-colors ${
                  selectedTool?.id === tool.id
                    ? 'bg-primary text-white'
                    : 'bg-white border-base hover:border-primary hover:bg-primary/5'
                }`}
              >
                {tool.icon}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={undoLastStroke}
              className="p-2 bg-white border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 bg-white border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Canvas Container */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={containerRef}
          className="w-full h-full flex items-center justify-center bg-gray-100"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center'
          }}
        >
          <canvas
            ref={canvasRef}
            className="border-2 border-gray-300 bg-white shadow-lg"
            style={{
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none'
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
          <button
            onClick={() => handleZoom(0.1)}
            className="p-2 bg-white border-base rounded-lg shadow-lg hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.1)}
            className="p-2 bg-white border-base rounded-lg shadow-lg hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Device Indicator */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center space-x-2 px-3 py-1 bg-white border-base rounded-lg shadow-lg">
            {deviceType === 'mobile' && <Smartphone className="w-4 h-4 text-blue-500" />}
            {deviceType === 'tablet' && <Tablet className="w-4 h-4 text-green-500" />}
            {deviceType === 'desktop' && <Monitor className="w-4 h-4 text-purple-500" />}
            <span className="text-sm font-medium capitalize">{deviceType}</span>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 bg-white border-t"
          >
            <h4 className="font-semibold text-gray-900 mb-3">Drawing Settings</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Canvas Size
                </label>
                <select
                  value={settings.canvasSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, canvasSize: e.target.value as any }))}
                  className="w-full px-2 py-1 border-base rounded text-sm"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="fullscreen">Fullscreen</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tool Size
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={selectedTool?.size || 3}
                  onChange={(e) => {
                    if (selectedTool) {
                      setSelectedTool(prev => prev ? { ...prev, size: parseInt(e.target.value) } : null);
                    }
                  }}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opacity
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={selectedTool?.opacity || 1}
                  onChange={(e) => {
                    if (selectedTool) {
                      setSelectedTool(prev => prev ? { ...prev, opacity: parseFloat(e.target.value) } : null);
                    }
                  }}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as any }))}
                  className="w-full px-2 py-1 border-base rounded text-sm"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.gridVisible}
                    onChange={(e) => setSettings(prev => ({ ...prev, gridVisible: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Grid</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.guidelinesVisible}
                    onChange={(e) => setSettings(prev => ({ ...prev, guidelinesVisible: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Guidelines</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.pressureSensitivity}
                    onChange={(e) => setSettings(prev => ({ ...prev, pressureSensitivity: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Pressure</span>
                </label>
              </div>
              
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex items-center justify-between p-4 bg-white border-t">
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </button>
          <button className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Save
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
          <button
            onClick={() => onDrawingComplete?.({
              strokes,
              width: canvasSize.width,
              height: canvasSize.height,
              timestamp: new Date().toISOString(),
              device: deviceType,
              touchPoints: touchCount,
              pressure: [],
              velocity: []
            })}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Complete
          </button>
        </div>
      </div>
    </div>
  );
};
