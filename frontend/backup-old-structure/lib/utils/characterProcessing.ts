// Character processing utilities for Japanese text
import { JAPANESE_CHARACTERS } from '@/lib/constants/characters';

// Character type detection
export const getCharacterType = (character: string): 'hiragana' | 'katakana' | 'kanji' | 'other' => {
  if (/[\u3040-\u309F]/.test(character)) return 'hiragana';
  if (/[\u30A0-\u30FF]/.test(character)) return 'katakana';
  if (/[\u4E00-\u9FAF]/.test(character)) return 'kanji';
  return 'other';
};

// Character difficulty calculation
export const calculateCharacterDifficulty = (character: string): number => {
  const type = getCharacterType(character);
  
  switch (type) {
    case 'hiragana':
      return 1;
    case 'katakana':
      return 2;
    case 'kanji':
      // More complex kanji are generally more difficult
      return Math.min(5, Math.max(3, character.length));
    default:
      return 0;
  }
};

// Stroke count estimation (simplified)
export const estimateStrokeCount = (character: string): number => {
  const type = getCharacterType(character);
  
  switch (type) {
    case 'hiragana':
      return Math.floor(Math.random() * 3) + 1; // 1-3 strokes
    case 'katakana':
      return Math.floor(Math.random() * 4) + 1; // 1-4 strokes
    case 'kanji':
      return Math.floor(Math.random() * 15) + 3; // 3-17 strokes
    default:
      return 0;
  }
};

// Character reading extraction
export const getCharacterReadings = (character: string): string[] => {
  const type = getCharacterType(character);
  
  // This would typically come from a character database
  // For now, return placeholder readings
  switch (type) {
    case 'hiragana':
    case 'katakana':
      return [character]; // Kana characters are their own readings
    case 'kanji':
      return ['on-yomi', 'kun-yomi']; // Placeholder readings
    default:
      return [];
  }
};

// Character meaning extraction
export const getCharacterMeanings = (character: string): string[] => {
  const type = getCharacterType(character);
  
  // This would typically come from a character database
  // For now, return placeholder meanings
  switch (type) {
    case 'hiragana':
    case 'katakana':
      return ['phonetic character'];
    case 'kanji':
      return ['meaning 1', 'meaning 2']; // Placeholder meanings
    default:
      return [];
  }
};

// Stroke order generation (simplified)
export const generateStrokeOrder = (character: string): string[] => {
  const strokeCount = estimateStrokeCount(character);
  const strokes: string[] = [];
  
  // Generate simple stroke paths
  for (let i = 0; i < strokeCount; i++) {
    const x = 50 + (i * 20);
    const y = 50 + (i * 10);
    strokes.push(`M ${x} ${y} L ${x + 20} ${y + 20}`);
  }
  
  return strokes;
};

// Character similarity calculation
export const calculateCharacterSimilarity = (char1: string, char2: string): number => {
  if (char1 === char2) return 1.0;
  
  const type1 = getCharacterType(char1);
  const type2 = getCharacterType(char2);
  
  if (type1 !== type2) return 0.0;
  
  // Simple similarity based on character type
  switch (type1) {
    case 'hiragana':
    case 'katakana':
      return 0.8; // High similarity within same kana type
    case 'kanji':
      return 0.3; // Lower similarity for kanji
    default:
      return 0.0;
  }
};

// Character frequency analysis
export const getCharacterFrequency = (character: string): number => {
  // This would typically come from a frequency database
  // For now, return placeholder frequency
  const type = getCharacterType(character);
  
  switch (type) {
    case 'hiragana':
      return 0.9; // Very common
    case 'katakana':
      return 0.7; // Common
    case 'kanji':
      return 0.5; // Moderate
    default:
      return 0.1; // Rare
  }
};

// Character learning progress calculation
export const calculateLearningProgress = (
  character: string,
  attempts: number,
  correctAttempts: number,
  timeSpent: number
): number => {
  if (attempts === 0) return 0;
  
  const accuracy = correctAttempts / attempts;
  const timeFactor = Math.min(1, timeSpent / 60); // Normalize to 1 minute
  const difficulty = calculateCharacterDifficulty(character);
  
  // Progress formula: accuracy * time_factor * difficulty_factor
  return Math.min(1, accuracy * timeFactor * (1 / difficulty));
};

// Character mastery level calculation
export const calculateMasteryLevel = (progress: number): 'beginner' | 'intermediate' | 'advanced' | 'master' => {
  if (progress < 0.25) return 'beginner';
  if (progress < 0.5) return 'intermediate';
  if (progress < 0.75) return 'advanced';
  return 'master';
};
