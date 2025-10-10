import Filter from 'bad-words';
import natural from 'natural';

// Initialize bad words filter
const filter = new Filter();

// Content moderation service
export class ContentModerationService {
  private spamKeywords: string[] = [
    'buy now', 'click here', 'free money', 'make money fast',
    'get rich quick', 'viagra', 'casino', 'lottery', 'winner'
  ];

  private hateSpeechKeywords: string[] = [
    'hate', 'kill', 'destroy', 'annihilate', 'exterminate'
  ];

  private harassmentKeywords: string[] = [
    'stupid', 'idiot', 'moron', 'retard', 'loser', 'pathetic'
  ];

  async checkContent(content: string): Promise<{
    isApproved: boolean;
    confidence: number;
    reasons: string[];
    suggestions?: string[];
  }> {
    const issues: string[] = [];
    let confidence = 1.0;

    // Check for bad words
    if (filter.isProfane(content)) {
      issues.push('Contains profanity');
      confidence -= 0.3;
    }

    // Check for spam keywords
    const spamDetected = this.spamKeywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    if (spamDetected) {
      issues.push('Contains spam keywords');
      confidence -= 0.4;
    }

    // Check for hate speech
    const hateSpeechDetected = this.hateSpeechKeywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    if (hateSpeechDetected) {
      issues.push('Contains hate speech');
      confidence -= 0.5;
    }

    // Check for harassment
    const harassmentDetected = this.harassmentKeywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    if (harassmentDetected) {
      issues.push('Contains harassment');
      confidence -= 0.3;
    }

    // Check for excessive caps
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.7 && content.length > 10) {
      issues.push('Excessive capitalization');
      confidence -= 0.2;
    }

    // Check for excessive punctuation
    const punctuationRatio = (content.match(/[!?.]{2,}/g) || []).length / content.length;
    if (punctuationRatio > 0.1) {
      issues.push('Excessive punctuation');
      confidence -= 0.1;
    }

    // Check for repeated characters
    const repeatedChars = content.match(/(.)\1{4,}/g);
    if (repeatedChars && repeatedChars.length > 0) {
      issues.push('Repeated characters');
      confidence -= 0.2;
    }

    // Check for URL patterns (potential spam)
    const urlPattern = /https?:\/\/[^\s]+/g;
    const urls = content.match(urlPattern);
    if (urls && urls.length > 2) {
      issues.push('Multiple URLs detected');
      confidence -= 0.3;
    }

    // Check for email patterns (potential spam)
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = content.match(emailPattern);
    if (emails && emails.length > 1) {
      issues.push('Multiple email addresses detected');
      confidence -= 0.2;
    }

    // Check content length
    if (content.length < 3) {
      issues.push('Content too short');
      confidence -= 0.1;
    }

    if (content.length > 10000) {
      issues.push('Content too long');
      confidence -= 0.1;
    }

    // Determine if content should be approved
    const isApproved = confidence >= 0.5 && issues.length === 0;

    // Generate suggestions for improvement
    const suggestions: string[] = [];
    if (issues.includes('Contains profanity')) {
      suggestions.push('Please remove profanity from your content');
    }
    if (issues.includes('Contains spam keywords')) {
      suggestions.push('Please avoid promotional language');
    }
    if (issues.includes('Contains hate speech')) {
      suggestions.push('Please use respectful language');
    }
    if (issues.includes('Contains harassment')) {
      suggestions.push('Please be respectful to other users');
    }
    if (issues.includes('Excessive capitalization')) {
      suggestions.push('Please avoid using all caps');
    }
    if (issues.includes('Excessive punctuation')) {
      suggestions.push('Please use normal punctuation');
    }
    if (issues.includes('Repeated characters')) {
      suggestions.push('Please avoid repeating characters');
    }

    return {
      isApproved,
      confidence: Math.max(0, confidence),
      reasons: issues,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  async checkUserBehavior(userId: string): Promise<{
    isApproved: boolean;
    confidence: number;
    reasons: string[];
    suggestions?: string[];
  }> {
    // This would typically check user's posting history, report history, etc.
    // For now, return a basic approval
    return {
      isApproved: true,
      confidence: 1.0,
      reasons: []
    };
  }

  async checkImageContent(imageUrl: string): Promise<{
    isApproved: boolean;
    confidence: number;
    reasons: string[];
    suggestions?: string[];
  }> {
    // This would typically use image recognition APIs
    // For now, return a basic approval
    return {
      isApproved: true,
      confidence: 1.0,
      reasons: []
    };
  }

  // Advanced text analysis using natural language processing
  private analyzeSentiment(text: string): number {
    const analyzer = new natural.SentimentAnalyzer('English', 
      natural.PorterStemmer, ['negation']);
    
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase());
    
    const lexicon = new natural.Lexicon('English', 'N', 'NNP');
    const ruleSet = new natural.RuleSet('English');
    const stemmer = natural.PorterStemmer;
    
    const stemmedTokens = tokens.map(token => stemmer.stem(token));
    
    return analyzer.getSentiment(stemmedTokens, lexicon, ruleSet);
  }

  private detectLanguage(text: string): string {
    // Simple language detection based on common words
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le'];
    const frenchWords = ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour'];
    
    const words = text.toLowerCase().split(/\s+/);
    let englishCount = 0;
    let spanishCount = 0;
    let frenchCount = 0;
    
    words.forEach(word => {
      if (englishWords.includes(word)) englishCount++;
      if (spanishWords.includes(word)) spanishCount++;
      if (frenchWords.includes(word)) frenchCount++;
    });
    
    if (spanishCount > englishCount && spanishCount > frenchCount) return 'spanish';
    if (frenchCount > englishCount && frenchCount > spanishCount) return 'french';
    return 'english';
  }

  private extractKeywords(text: string): string[] {
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase());
    
    // Remove stop words and short words
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    const keywords = tokens.filter(token => 
      token.length > 2 && !stopWords.has(token) && /^[a-zA-Z]+$/.test(token)
    );
    
    // Get unique keywords
    return [...new Set(keywords)];
  }

  // Get content quality score
  async getContentQualityScore(content: string): Promise<number> {
    let score = 1.0;
    
    // Length score
    if (content.length < 10) score -= 0.3;
    else if (content.length > 1000) score -= 0.1;
    
    // Readability score
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length;
    
    if (avgWordsPerSentence > 25) score -= 0.2;
    if (avgWordsPerSentence < 5) score -= 0.1;
    
    // Vocabulary diversity
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const diversityRatio = uniqueWords.size / words.length;
    if (diversityRatio < 0.3) score -= 0.2;
    
    // Sentiment analysis
    const sentiment = this.analyzeSentiment(content);
    if (sentiment < -0.5) score -= 0.3;
    
    return Math.max(0, Math.min(1, score));
  }
}

// Export singleton instance
export const contentModeration = new ContentModerationService();
