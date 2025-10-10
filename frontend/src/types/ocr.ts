// OCR Types - Canvas, Drawing, Recognition, and OCR-related types

// OCR Configuration
export interface OCRConfig {
  threshold: number;
  blur: number;
  contrast: number;
  brightness: number;
}

// OCR Result
export interface OCRResult {
  character: string;
  confidence: number;
  alternatives: Array<{ character: string; confidence: number }>;
  processingTime: number;
}

// Canvas Drawing Types
export interface CanvasPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface CanvasStroke {
  id: string;
  points: CanvasPoint[];
  color: string;
  width: number;
  timestamp: number;
}

export interface CanvasDrawing {
  id: string;
  strokes: CanvasStroke[];
  width: number;
  height: number;
  backgroundColor: string;
  createdAt: string;
  updatedAt: string;
}

// Drawing Recognition
export interface DrawingRecognition {
  id: string;
  drawingId: string;
  recognizedCharacter: string;
  confidence: number;
  alternatives: Array<{
    character: string;
    confidence: number;
  }>;
  processingTime: number;
  timestamp: string;
}

// Stroke Analysis
export interface StrokeAnalysis {
  strokeId: string;
  order: number;
  direction: 'horizontal' | 'vertical' | 'diagonal' | 'curved';
  length: number;
  startPoint: CanvasPoint;
  endPoint: CanvasPoint;
  curvature: number;
  speed: number;
  pressure: number;
}

// Character Recognition
export interface CharacterRecognition {
  id: string;
  userId: string;
  characterId: string;
  drawing: CanvasDrawing;
  recognition: DrawingRecognition;
  accuracy: number;
  feedback: {
    correct: boolean;
    suggestions: string[];
    strokeOrderCorrect: boolean;
    strokeOrderSuggestions: string[];
  };
  timestamp: string;
}

// OCR Processing
export interface OCRProcessing {
  id: string;
  imageData: ImageData;
  config: OCRConfig;
  result: OCRResult;
  processingTime: number;
  timestamp: string;
}

// Drawing Session
export interface DrawingSession {
  id: string;
  userId: string;
  characterId: string;
  startTime: string;
  endTime?: string;
  drawings: CanvasDrawing[];
  recognitions: DrawingRecognition[];
  completed: boolean;
  accuracy: number;
  timeSpent: number;
}

// Drawing Feedback
export interface DrawingFeedback {
  sessionId: string;
  characterId: string;
  accuracy: number;
  feedback: {
    overall: 'excellent' | 'good' | 'fair' | 'needs_improvement';
    strokeOrder: 'correct' | 'incorrect';
    strokeDirection: 'correct' | 'incorrect';
    strokeCount: 'correct' | 'too_many' | 'too_few';
    suggestions: string[];
  };
  timestamp: string;
}

// Drawing Analytics
export interface DrawingAnalytics {
  userId: string;
  characterId: string;
  totalAttempts: number;
  averageAccuracy: number;
  improvementRate: number;
  commonMistakes: string[];
  bestAttempt: DrawingRecognition;
  recentAttempts: DrawingRecognition[];
  timeSpent: number;
  lastPracticed: string;
}

// Drawing Comparison
export interface DrawingComparison {
  userId: string;
  characterId: string;
  userDrawing: CanvasDrawing;
  referenceDrawing: CanvasDrawing;
  similarity: number;
  differences: Array<{
    type: 'stroke_order' | 'stroke_direction' | 'stroke_count' | 'proportion';
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  suggestions: string[];
}

// Drawing Practice
export interface DrawingPractice {
  id: string;
  userId: string;
  characterId: string;
  mode: 'free' | 'guided' | 'stroke_order' | 'recognition';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit?: number;
  attempts: number;
  bestAccuracy: number;
  averageAccuracy: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}

// Drawing Challenge
export interface DrawingChallenge {
  id: string;
  title: string;
  description: string;
  characters: string[];
  mode: 'free' | 'guided' | 'stroke_order' | 'recognition';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit: number;
  participants: string[];
  leaderboard: Array<{
    userId: string;
    accuracy: number;
    timeSpent: number;
    rank: number;
  }>;
  startTime: string;
  endTime: string;
  active: boolean;
}

// Drawing Recognition Model
export interface DrawingRecognitionModel {
  id: string;
  name: string;
  version: string;
  accuracy: number;
  supportedCharacters: string[];
  config: OCRConfig;
  lastUpdated: string;
  active: boolean;
}

// Drawing Data Export
export interface DrawingDataExport {
  userId: string;
  exportDate: string;
  drawings: CanvasDrawing[];
  recognitions: DrawingRecognition[];
  analytics: DrawingAnalytics[];
  period: {
    start: string;
    end: string;
  };
  format: 'json' | 'csv' | 'pdf';
}

// Drawing Import
export interface DrawingImport {
  userId: string;
  importDate: string;
  source: 'backup' | 'migration' | 'export';
  drawings: CanvasDrawing[];
  recognitions: DrawingRecognition[];
  format: 'json' | 'csv';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errors?: string[];
}
