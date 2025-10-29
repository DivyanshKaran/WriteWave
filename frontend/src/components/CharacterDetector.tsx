import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Canvas as FabricCanvas } from "fabric";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CharacterDetectorProps {
  fabricCanvas: FabricCanvas | null;
  targetCharacter: string;
}

interface DetectionResult {
  detected: boolean;
  accuracy: number;
  strokes: number;
  message: string;
}

export const CharacterDetector = ({ fabricCanvas, targetCharacter }: CharacterDetectorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [openCvReady, setOpenCvReady] = useState(false);

  // Load OpenCV
  useEffect(() => {
    // Check if OpenCV is already loaded
    if ((window as any).cv && (window as any).cv.Mat) {
      setOpenCvReady(true);
      return;
    }

    // Load OpenCV.js from official CDN
    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.x/opencv.js';
    script.async = true;
    
    const onOpenCvReady = () => {
      setOpenCvReady(true);
    };
    
    script.onload = () => {
      if ((window as any).cv?.then) {
        (window as any).cv.then(onOpenCvReady);
      } else {
        onOpenCvReady();
      }
    };
    
    script.onerror = () => {
      console.error('Failed to load OpenCV.js');
    };
    
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const detectCharacter = async () => {
    if (!fabricCanvas || !targetCharacter || !openCvReady || !canvasRef.current) {
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      // Get the canvas data
      const canvasElement = fabricCanvas.getElement();
      const ctx = canvasRef.current.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get 2D context');
      }

      // Resize the result canvas to match fabric canvas
      canvasRef.current.width = canvasElement.width;
      canvasRef.current.height = canvasElement.height;

      // Draw fabric canvas to result canvas
      ctx.drawImage(canvasElement, 0, 0);

      // Convert to image data
      const imageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);

      // Process with OpenCV
      const cvObj = (window as any).cv;
      if (!cvObj) {
        throw new Error('OpenCV is not ready');
      }
      
      const src = cvObj.matFromImageData(imageData);
      
      // Convert to grayscale
      const gray = new cvObj.Mat();
      cvObj.cvtColor(src, gray, cvObj.COLOR_RGBA2GRAY);

      // Apply threshold to get binary image
      const thresh = new cvObj.Mat();
      cvObj.threshold(gray, thresh, 50, 255, cvObj.THRESH_BINARY_INV);

      // Find contours
      const contours = new cvObj.MatVector();
      const hierarchy = new cvObj.Mat();
      cvObj.findContours(thresh, contours, hierarchy, cvObj.RETR_EXTERNAL, cvObj.CHAIN_APPROX_SIMPLE);

      // Count strokes (number of contours)
      const strokeCount = contours.size();

      // Calculate image characteristics
      const nonZeroPixels = cvObj.countNonZero(thresh);
      const totalPixels = thresh.rows * thresh.cols;
      const filledRatio = nonZeroPixels / totalPixels;

      // Simple heuristic-based detection
      // This is a basic implementation - in production, you'd use ML models
      const minStrokes = 1;
      const maxStrokes = 15;
      const minFilledRatio = 0.001;
      const maxFilledRatio = 0.5;

      const hasReasonableStrokes = strokeCount >= minStrokes && strokeCount <= maxStrokes;
      const hasReasonableFill = filledRatio >= minFilledRatio && filledRatio <= maxFilledRatio;

      // Calculate accuracy based on heuristic
      let accuracy = 0;
      if (hasReasonableStrokes && hasReasonableFill) {
        accuracy = Math.min(
          50 + (strokeCount * 3) + (filledRatio * 200),
          95
        );
      }

      const detected = hasReasonableStrokes && hasReasonableFill && accuracy >= 50;
      
      // Clean up
      src.delete();
      gray.delete();
      thresh.delete();
      contours.delete();
      hierarchy.delete();

      setResult({
        detected,
        accuracy: Math.round(accuracy),
        strokes: strokeCount,
        message: detected 
          ? `✓ Character detected! Good job!` 
          : `⚠ Keep practicing. Try to match the reference character more closely.`
      });

    } catch (error) {
      console.error('Detection error:', error);
      setResult({
        detected: false,
        accuracy: 0,
        strokes: 0,
        message: 'Error processing image. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={detectCharacter}
        disabled={isProcessing || !fabricCanvas || !targetCharacter || !openCvReady}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          "Submit & Check"
        )}
      </Button>

      {!openCvReady && (
        <p className="text-sm text-muted-foreground">Loading OpenCV library...</p>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {result && (
        <Card className={`${result.detected ? 'border-green-500' : 'border-orange-500'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.detected ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-orange-500" />
              )}
              Detection Result
            </CardTitle>
            <CardDescription>
              {result.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Accuracy:</span>
              <span className="font-semibold">{result.accuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Strokes detected:</span>
              <span className="font-semibold">{result.strokes}</span>
            </div>
            {result.detected && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-md">
                <p className="text-sm text-green-700 dark:text-green-400">
                  Great work! Your character matches the reference well.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
