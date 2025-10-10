// Character Types - Hiragana, Katakana, Kanji, and Character-related types

// Base Character Interface
export interface Character {
  id: string;
  character: string;
  type: 'hiragana' | 'katakana' | 'kanji';
  readings: string[];
  meanings: string[];
  stroke_order: string[];
  difficulty: number;
}

// Character Types
export type CharacterType = 'hiragana' | 'katakana' | 'kanji';

// Character Difficulty Levels
export type CharacterDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

// Character Mastery
export interface CharacterMastery {
  characterId: string;
  character: string;
  type: CharacterType;
  mastery: number; // 0-100
  attempts: number;
  correctAttempts: number;
  lastPracticed: string;
  difficulty: number;
  strokeOrder: string[];
  readings: string[];
  meanings: string[];
}

// Learning Session
export interface LearningSession {
  id: string;
  characterId: string;
  startTime: string;
  endTime?: string;
  attempts: number;
  correctAttempts: number;
  timeSpent: number; // in seconds
  completed: boolean;
}

// Character Store State
export interface CharacterState {
  // Character data
  characters: Character[];
  currentCharacter: Character | null;
  characterMastery: Record<string, CharacterMastery>;
  
  // Learning session
  currentSession: LearningSession | null;
  sessionHistory: LearningSession[];
  
  // Learning progress
  charactersLearned: string[];
  charactersInProgress: string[];
  charactersMastered: string[];
  
  // Filters and search
  selectedType: 'all' | CharacterType;
  selectedDifficulty: 'all' | CharacterDifficulty;
  searchQuery: string;
  
  // Loading states
  isLoading: boolean;
  isPracticing: boolean;
  
  // Actions
  loadCharacters: (filters?: { type?: string; difficulty?: number }) => Promise<void>;
  setCurrentCharacter: (character: Character) => void;
  startLearningSession: (characterId: string) => void;
  endLearningSession: (success: boolean) => void;
  updateCharacterMastery: (characterId: string, mastery: number) => Promise<void>;
  practiceCharacter: (characterId: string, success: boolean) => Promise<void>;
  setCharacterType: (type: 'all' | CharacterType) => void;
  setCharacterDifficulty: (difficulty: 'all' | CharacterDifficulty) => void;
  setSearchQuery: (query: string) => void;
  getFilteredCharacters: () => Character[];
  getCharacterMastery: (characterId: string) => CharacterMastery | null;
  resetCharacterProgress: () => void;
}

// Character Set Definitions
export interface CharacterSet {
  hiragana: Character[];
  katakana: Character[];
  kanji: Character[];
}

// Character Frequency Data
export interface CharacterFrequency {
  character: string;
  frequency: number;
  rank: number;
  category: 'very_common' | 'common' | 'moderate' | 'uncommon' | 'rare';
}

// Character Similarity
export interface CharacterSimilarity {
  character1: string;
  character2: string;
  similarity: number; // 0-1
  commonStrokes: number;
  totalStrokes: number;
}

// Character Learning Progress
export interface CharacterLearningProgress {
  characterId: string;
  userId: string;
  mastery: number;
  attempts: number;
  correctAttempts: number;
  averageTime: number;
  lastPracticed: string;
  streak: number;
  difficulty: number;
}

// Character Practice Session
export interface CharacterPracticeSession {
  id: string;
  characterId: string;
  userId: string;
  startTime: string;
  endTime: string;
  attempts: number;
  correctAttempts: number;
  timeSpent: number;
  strokes: Stroke[];
  accuracy: number;
  completed: boolean;
}

// Stroke Definition
export interface Stroke {
  id: string;
  order: number;
  path: string; // SVG path
  direction: 'horizontal' | 'vertical' | 'diagonal' | 'curved';
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  timestamp: number;
}

// Character Recognition Result
export interface CharacterRecognitionResult {
  character: string;
  confidence: number;
  alternatives: Array<{
    character: string;
    confidence: number;
  }>;
  processingTime: number;
  strokes: Stroke[];
}

// Character Learning Metrics
export interface CharacterLearningMetrics {
  characterId: string;
  totalPracticeTime: number;
  averageAccuracy: number;
  improvementRate: number;
  difficultyRating: number;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'master';
  lastImprovement: string;
}

// Character Study Group
export interface CharacterStudyGroup {
  id: string;
  name: string;
  description: string;
  characters: string[]; // Character IDs
  members: string[]; // User IDs
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
  difficulty: CharacterDifficulty;
}

// Character Challenge
export interface CharacterChallenge {
  id: string;
  title: string;
  description: string;
  characters: string[]; // Character IDs
  difficulty: CharacterDifficulty;
  timeLimit?: number; // in seconds
  attempts: number;
  completed: boolean;
  score: number;
  createdAt: string;
  expiresAt?: string;
}
