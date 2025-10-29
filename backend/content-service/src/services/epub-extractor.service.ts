import { parse } from 'epub-parser';
import { parse as parseHtml } from 'node-html-parser';
import fs from 'fs';
import path from 'path';
import { CharacterService } from './character.service';
import { logger } from '../config/logger';

export interface ExtractedKanji {
  character: string;
  frequency: number;
  context: string[];
  pageNumbers: number[];
  sentences: string[];
}

export interface EpubExtractionResult {
  title: string;
  author: string;
  totalKanji: number;
  uniqueKanji: ExtractedKanji[];
  extractionDate: Date;
  filePath: string;
}

export class EpubExtractorService {
  public characterService: CharacterService;

  constructor() {
    this.characterService = new CharacterService();
  }

  /**
   * Extract kanji characters from an EPUB file
   */
  async extractKanjiFromEpub(filePath: string): Promise<EpubExtractionResult> {
    try {
      logger.info(`Starting EPUB extraction from: ${filePath}`);

      // Parse the EPUB file
      const epub = await parse(filePath);
      
      const extractedKanji: Map<string, ExtractedKanji> = new Map();
      let pageNumber = 0;

      // Process each chapter/section
      for (const chapter of epub.chapters) {
        pageNumber++;
        
        // Parse HTML content
        const htmlContent = parseHtml(chapter.html);
        const textContent = htmlContent.text || '';
        
        // Extract kanji from this chapter
        const chapterKanji = this.extractKanjiFromText(textContent, pageNumber);
        
        // Merge with existing kanji data
        for (const [kanji, data] of chapterKanji) {
          if (extractedKanji.has(kanji)) {
            const existing = extractedKanji.get(kanji)!;
            existing.frequency += data.frequency;
            existing.context.push(...data.context);
            existing.pageNumbers.push(...data.pageNumbers);
            existing.sentences.push(...data.sentences);
          } else {
            extractedKanji.set(kanji, data);
          }
        }
      }

      // Convert to array and sort by frequency
      const uniqueKanji = Array.from(extractedKanji.values())
        .sort((a, b) => b.frequency - a.frequency);

      const result: EpubExtractionResult = {
        title: epub.title || 'Unknown Title',
        author: epub.author || 'Unknown Author',
        totalKanji: uniqueKanji.reduce((sum, kanji) => sum + kanji.frequency, 0),
        uniqueKanji,
        extractionDate: new Date(),
        filePath
      };

      logger.info(`EPUB extraction completed. Found ${uniqueKanji.length} unique kanji characters.`);
      return result;

    } catch (error) {
      logger.error('Error extracting kanji from EPUB:', error);
      throw new Error(`Failed to extract kanji from EPUB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract kanji characters from text content
   */
  private extractKanjiFromText(text: string, pageNumber: number): Map<string, ExtractedKanji> {
    const kanjiMap = new Map<string, ExtractedKanji>();
    
    // Regular expression to match kanji characters (CJK Unified Ideographs)
    const kanjiRegex = /[\u4e00-\u9faf]/g;
    const matches = text.match(kanjiRegex);
    
    if (!matches) return kanjiMap;

    // Split text into sentences for context
    const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
    
    // Count frequency of each kanji
    const kanjiCounts = new Map<string, number>();
    for (const kanji of matches) {
      kanjiCounts.set(kanji, (kanjiCounts.get(kanji) || 0) + 1);
    }

    // Create ExtractedKanji objects
    for (const [kanji, frequency] of kanjiCounts) {
      // Find sentences containing this kanji
      const relevantSentences = sentences
        .filter(sentence => sentence.includes(kanji))
        .slice(0, 5) // Limit to 5 sentences for context
        .map(sentence => sentence.trim());

      // Extract context around the kanji
      const context: string[] = [];
      for (const sentence of relevantSentences) {
        const index = sentence.indexOf(kanji);
        if (index !== -1) {
          const start = Math.max(0, index - 20);
          const end = Math.min(sentence.length, index + 21);
          context.push(sentence.substring(start, end));
        }
      }

      kanjiMap.set(kanji, {
        character: kanji,
        frequency,
        context: [...new Set(context)], // Remove duplicates
        pageNumbers: [pageNumber],
        sentences: relevantSentences
      });
    }

    return kanjiMap;
  }

  /**
   * Enrich kanji data with additional information from external sources
   */
  async enrichKanjiData(extractedKanji: ExtractedKanji[]): Promise<any[]> {
    const enrichedKanji = [];

    for (const kanji of extractedKanji) {
      try {
        // Try to get existing character data from database
        let characterData = await this.characterService.getCharacterByCharacter(kanji.character);
        
        if (!characterData) {
          // If not in database, create basic character data
          characterData = {
            character: kanji.character,
            type: 'KANJI',
            frequency: kanji.frequency,
            examples: kanji.sentences,
            usageNotes: `Extracted from EPUB. Found ${kanji.frequency} times.`,
            isActive: true
          };
        } else {
          // Update existing character with EPUB data
          characterData.frequency = (characterData.frequency || 0) + kanji.frequency;
          characterData.examples = [
            ...(characterData.examples || []),
            ...kanji.sentences
          ];
        }

        enrichedKanji.push({
          ...characterData,
          epubData: {
            context: kanji.context,
            pageNumbers: kanji.pageNumbers,
            sentences: kanji.sentences
          }
        });

      } catch (error) {
        logger.error(`Error enriching kanji ${kanji.character}:`, error);
        // Still include the kanji with basic data
        enrichedKanji.push({
          character: kanji.character,
          type: 'KANJI',
          frequency: kanji.frequency,
          examples: kanji.sentences,
          usageNotes: `Extracted from EPUB. Found ${kanji.frequency} times.`,
          isActive: true,
          epubData: {
            context: kanji.context,
            pageNumbers: kanji.pageNumbers,
            sentences: kanji.sentences
          }
        });
      }
    }

    return enrichedKanji;
  }

  /**
   * Save extracted kanji to the database
   */
  async saveExtractedKanji(enrichedKanji: any[]): Promise<any[]> {
    const savedKanji = [];

    for (const kanjiData of enrichedKanji) {
      try {
        let savedCharacter;
        
        if (kanjiData.id) {
          // Update existing character
          savedCharacter = await this.characterService.updateCharacter(kanjiData.id, kanjiData);
        } else {
          // Create new character
          savedCharacter = await this.characterService.createCharacter(kanjiData);
        }

        savedKanji.push(savedCharacter);
        logger.info(`Saved kanji character: ${kanjiData.character}`);

      } catch (error) {
        logger.error(`Error saving kanji ${kanjiData.character}:`, error);
        // Continue with other kanji even if one fails
      }
    }

    return savedKanji;
  }

  /**
   * Generate individual kanji pages data
   */
  generateKanjiPagesData(enrichedKanji: any[]): any[] {
    return enrichedKanji.map(kanji => ({
      character: kanji.character,
      meaning: kanji.meaning || 'Unknown',
      kunyomi: kanji.kunyomi || [],
      onyomi: kanji.onyomi || [],
      level: kanji.jlptLevel || 'Unknown',
      strokeOrder: kanji.strokeOrder || [],
      vocabulary: kanji.examples || [],
      frequency: kanji.frequency || 0,
      context: kanji.epubData?.context || [],
      pageNumbers: kanji.epubData?.pageNumbers || [],
      sentences: kanji.epubData?.sentences || [],
      usageNotes: kanji.usageNotes || '',
      isActive: kanji.isActive || true
    }));
  }

  /**
   * Complete EPUB processing pipeline
   */
  async processEpubFile(filePath: string): Promise<{
    extractionResult: EpubExtractionResult;
    enrichedKanji: any[];
    savedKanji: any[];
    kanjiPagesData: any[];
  }> {
    try {
      logger.info(`Starting complete EPUB processing for: ${filePath}`);

      // Step 1: Extract kanji from EPUB
      const extractionResult = await this.extractKanjiFromEpub(filePath);

      // Step 2: Enrich kanji data
      const enrichedKanji = await this.enrichKanjiData(extractionResult.uniqueKanji);

      // Step 3: Save to database
      const savedKanji = await this.saveExtractedKanji(enrichedKanji);

      // Step 4: Generate kanji pages data
      const kanjiPagesData = this.generateKanjiPagesData(enrichedKanji);

      logger.info(`EPUB processing completed successfully. Processed ${savedKanji.length} kanji characters.`);

      return {
        extractionResult,
        enrichedKanji,
        savedKanji,
        kanjiPagesData
      };

    } catch (error) {
      logger.error('Error in EPUB processing pipeline:', error);
      throw error;
    }
  }
}
