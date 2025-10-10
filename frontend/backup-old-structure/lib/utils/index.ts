// Utility Functions
export {
  getLocale,
  formatDate as formatDateI18n,
  formatNumber as formatNumberI18n,
  formatCurrency as formatCurrencyI18n,
  formatPercentage as formatPercentageI18n,
  isJapaneseText,
  getJapaneseStyles,
  isRTLLocale,
  getDirection,
  TRANSLATION_KEYS,
  t,
} from './i18n';

export {
  validateEmail,
  validatePassword,
  validateJapaneseCharacter,
  validateStrokeOrder as validateStrokeOrderValidation,
  validateField,
  validateForm,
} from './validation';

export {
  getCharacterType,
  calculateCharacterDifficulty,
  estimateStrokeCount,
  getCharacterReadings,
  getCharacterMeanings,
  generateStrokeOrder,
  calculateCharacterSimilarity,
  getCharacterFrequency,
  calculateLearningProgress,
  calculateMasteryLevel,
} from './characterProcessing';

export {
  processOCR,
  preprocessImage,
  validateCharacter,
  validateStrokeOrder as validateStrokeOrderOCR,
  processRealTimeOCR,
  processBatchOCR,
  optimizeOCRPerformance,
  calculateCharacterConfidence,
} from './ocr';

export {
  formatXP,
  formatLevel,
  formatStreak,
  formatTime,
  formatDate as formatDateFormatter,
  formatDateTime,
  formatRelativeTime,
  formatPercentage as formatPercentageFormatter,
  formatFileSize,
  formatNumber as formatNumberFormatter,
  formatCurrency as formatCurrencyFormatter,
  formatPhoneNumber,
  formatUsername,
  formatSlug,
  formatInitials,
  formatTruncate,
  formatCapitalize,
  formatTitleCase,
} from './formatters';
