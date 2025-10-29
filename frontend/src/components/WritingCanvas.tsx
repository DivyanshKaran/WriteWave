import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, CircleBrush, Shadow } from "fabric";
import { Button } from "@/components/ui/button";
import { Eraser, Pen, RotateCcw } from "lucide-react";
import { CharacterDetector } from "@/components/CharacterDetector";

interface WritingCanvasProps {
  referenceChar?: string;
  width?: number;
  height?: number;
  showDetector?: boolean;
}

export const WritingCanvas = ({ referenceChar, width = 300, height = 300, showDetector = false }: WritingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [isErasing, setIsErasing] = useState(false);

  // Calculate responsive dimensions
  const getResponsiveDimensions = () => {
    const maxWidth = Math.min(window.innerWidth * 0.9, 400);
    const maxHeight = Math.min(window.innerHeight * 0.4, 400);
    return {
      width: Math.max(maxWidth, 250),
      height: Math.max(maxHeight, 250)
    };
  };

  const dimensions = getResponsiveDimensions();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: dimensions.width,
      height: dimensions.height,
      backgroundColor: "#fffef7", // Warm paper color
    });

    // Create a brush that feels like writing on paper
    const brush = new CircleBrush(canvas);
    brush.color = "#212121"; // Deep ink color for paper-like contrast
    brush.width = 4; // More realistic pen width
    
    // Add texture variation for natural paper feel
    let pressurePoints: number[] = [];
    
    // Simulate pen pressure with variable opacity
    canvas.on('path:created', (e) => {
      const path = e.path as fabric.Path;
      if (!path) return;
      
      // Make it look more like ink on paper
      path.set({
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
        stroke: "#212121",
        strokeWidth: 4,
        opacity: 0.95, // Slight variation for realism
      });
      
      canvas.renderAll();
    });
    
    // Add subtle width variation to simulate natural pen pressure
    let lastX = 0;
    let lastY = 0;
    let lastTime = Date.now();
    
    canvas.on('mouse:move', (e) => {
      if (!e.pointer) return;
      
      const now = Date.now();
      const dt = now - lastTime;
      
      if (lastX !== 0 && dt > 0) {
        const distance = Math.sqrt(
          Math.pow(e.pointer.x - lastX, 2) + Math.pow(e.pointer.y - lastY, 2)
        );
        const speed = distance / dt;
        
        // Slower speed = thicker line (like pressing harder on paper)
        const newWidth = Math.max(3, Math.min(6, 5 - speed / 10));
        canvas.freeDrawingBrush.width = newWidth;
      }
      
      lastX = e.pointer.x;
      lastY = e.pointer.y;
      lastTime = now;
    });
    
    // Set the brush
    canvas.freeDrawingBrush = brush;
    canvas.isDrawingMode = true;

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [dimensions.width, dimensions.height]);

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#fffef7";
    fabricCanvas.renderAll();
  };

  const toggleEraser = () => {
    if (!fabricCanvas) return;
    const newErasingState = !isErasing;
    setIsErasing(newErasingState);
    
    if (newErasingState) {
      // Use white color for proper erasing
      fabricCanvas.freeDrawingBrush.color = "#fffef7";
      fabricCanvas.freeDrawingBrush.width = 15;
    } else {
      fabricCanvas.freeDrawingBrush.color = "#212121";
      fabricCanvas.freeDrawingBrush.width = 4;
    }
  };

  const resetToDrawing = () => {
    if (!fabricCanvas) return;
    setIsErasing(false);
    fabricCanvas.freeDrawingBrush.color = "#212121";
    fabricCanvas.freeDrawingBrush.width = 4;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button
          variant={isErasing ? "outline" : "default"}
          size="sm"
          onClick={resetToDrawing}
        >
          <Pen className="w-4 h-4" />
        </Button>
        <Button
          variant={isErasing ? "default" : "outline"}
          size="sm"
          onClick={toggleEraser}
        >
          <Eraser className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleClear}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="relative border border-gray-300 rounded-lg shadow-inner bg-gradient-to-br from-white to-gray-50 w-full max-w-md mx-auto overflow-hidden">
        {/* Paper texture with subtle noise */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.02) 1px, rgba(0,0,0,0.02) 2px),
              repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.01) 1px, rgba(0,0,0,0.01) 2px)
            `,
            zIndex: 0,
            opacity: 0.3
          }}
        />
        
        {/* Subtle fiber texture for paper feel */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)',
            backgroundSize: '3px 3px',
            zIndex: 0
          }}
        />
        
        {referenceChar && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ 
              opacity: 0.15,
              zIndex: 1,
              fontSize: `${Math.min(dimensions.width, dimensions.height) * 0.6}px`,
              fontFamily: 'serif',
              fontWeight: 'bold',
              color: '#808080',
              textShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            {referenceChar}
          </div>
        )}
        <canvas 
          ref={canvasRef} 
          className="cursor-crosshair relative w-full"
          style={{ zIndex: 2 }}
        />
      </div>

      {showDetector && (
        <CharacterDetector 
          fabricCanvas={fabricCanvas} 
          targetCharacter={referenceChar || ''} 
        />
      )}
    </div>
  );
};
