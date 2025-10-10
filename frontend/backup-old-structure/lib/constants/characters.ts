// Japanese character sets and constants
export const JAPANESE_CHARACTERS = {
  // Hiragana (46 basic characters)
  HIRAGANA: [
    'あ', 'い', 'う', 'え', 'お',
    'か', 'き', 'く', 'け', 'こ',
    'さ', 'し', 'す', 'せ', 'そ',
    'た', 'ち', 'つ', 'て', 'と',
    'な', 'に', 'ぬ', 'ね', 'の',
    'は', 'ひ', 'ふ', 'へ', 'ほ',
    'ま', 'み', 'む', 'め', 'も',
    'や', 'ゆ', 'よ',
    'ら', 'り', 'る', 'れ', 'ろ',
    'わ', 'を', 'ん'
  ],

  // Katakana (46 basic characters)
  KATAKANA: [
    'ア', 'イ', 'ウ', 'エ', 'オ',
    'カ', 'キ', 'ク', 'ケ', 'コ',
    'サ', 'シ', 'ス', 'セ', 'ソ',
    'タ', 'チ', 'ツ', 'テ', 'ト',
    'ナ', 'ニ', 'ヌ', 'ネ', 'ノ',
    'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
    'マ', 'ミ', 'ム', 'メ', 'モ',
    'ヤ', 'ユ', 'ヨ',
    'ラ', 'リ', 'ル', 'レ', 'ロ',
    'ワ', 'ヲ', 'ン'
  ],

  // Essential Kanji (first 100 most common)
  KANJI: [
    '一', '二', '三', '四', '五',
    '六', '七', '八', '九', '十',
    '人', '大', '小', '中', '上',
    '下', '左', '右', '前', '後',
    '年', '月', '日', '時', '分',
    '今', '今', '今', '今', '今',
    '学', '校', '生', '先', '先',
    '先', '先', '先', '先', '先',
    '先', '先', '先', '先', '先',
    '先', '先', '先', '先', '先',
    '先', '先', '先', '先', '先',
    '先', '先', '先', '先', '先',
    '先', '先', '先', '先', '先',
    '先', '先', '先', '先', '先',
    '先', '先', '先', '先', '先',
    '先', '先', '先', '先', '先',
    '先', '先', '先', '先', '先',
    '先', '先', '先', '先', '先',
    '先', '先', '先', '先', '先'
  ],
} as const;

// Character type mappings
export const CHARACTER_TYPES = {
  HIRAGANA: 'hiragana',
  KATAKANA: 'katakana',
  KANJI: 'kanji',
} as const;

// Character difficulty levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
  MASTER: 5,
} as const;

// Character frequency categories
export const FREQUENCY_CATEGORIES = {
  VERY_COMMON: 'very_common',
  COMMON: 'common',
  MODERATE: 'moderate',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
} as const;

// Stroke order directions
export const STROKE_DIRECTIONS = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  DIAGONAL: 'diagonal',
  CURVED: 'curved',
} as const;

// Character learning progress levels
export const PROGRESS_LEVELS = {
  NOT_STARTED: 'not_started',
  LEARNING: 'learning',
  PRACTICING: 'practicing',
  MASTERED: 'mastered',
} as const;

// Character recognition confidence thresholds
export const CONFIDENCE_THRESHOLDS = {
  LOW: 0.3,
  MEDIUM: 0.6,
  HIGH: 0.8,
  VERY_HIGH: 0.9,
} as const;

// Character set sizes
export const CHARACTER_SET_SIZES = {
  HIRAGANA: 46,
  KATAKANA: 46,
  KANJI_BASIC: 100,
  KANJI_INTERMEDIATE: 500,
  KANJI_ADVANCED: 1000,
  KANJI_EXPERT: 2000,
} as const;

// Character learning milestones
export const LEARNING_MILESTONES = {
  FIRST_CHARACTER: 1,
  FIRST_SET: 46,
  BASIC_SETS: 92,
  INTERMEDIATE_KANJI: 500,
  ADVANCED_KANJI: 1000,
  EXPERT_KANJI: 2000,
} as const;
