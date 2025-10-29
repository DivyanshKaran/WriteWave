"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpubExtractorService = void 0;
const epub_parser_1 = require("epub-parser");
const node_html_parser_1 = require("node-html-parser");
const character_service_1 = require("./character.service");
const logger_1 = require("../config/logger");
class EpubExtractorService {
    constructor() {
        this.characterService = new character_service_1.CharacterService();
    }
    async extractKanjiFromEpub(filePath) {
        try {
            logger_1.logger.info(`Starting EPUB extraction from: ${filePath}`);
            const epub = await (0, epub_parser_1.parse)(filePath);
            const extractedKanji = new Map();
            let pageNumber = 0;
            for (const chapter of epub.chapters) {
                pageNumber++;
                const htmlContent = (0, node_html_parser_1.parse)(chapter.html);
                const textContent = htmlContent.text || '';
                const chapterKanji = this.extractKanjiFromText(textContent, pageNumber);
                for (const [kanji, data] of chapterKanji) {
                    if (extractedKanji.has(kanji)) {
                        const existing = extractedKanji.get(kanji);
                        existing.frequency += data.frequency;
                        existing.context.push(...data.context);
                        existing.pageNumbers.push(...data.pageNumbers);
                        existing.sentences.push(...data.sentences);
                    }
                    else {
                        extractedKanji.set(kanji, data);
                    }
                }
            }
            const uniqueKanji = Array.from(extractedKanji.values())
                .sort((a, b) => b.frequency - a.frequency);
            const result = {
                title: epub.title || 'Unknown Title',
                author: epub.author || 'Unknown Author',
                totalKanji: uniqueKanji.reduce((sum, kanji) => sum + kanji.frequency, 0),
                uniqueKanji,
                extractionDate: new Date(),
                filePath
            };
            logger_1.logger.info(`EPUB extraction completed. Found ${uniqueKanji.length} unique kanji characters.`);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Error extracting kanji from EPUB:', error);
            throw new Error(`Failed to extract kanji from EPUB: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    extractKanjiFromText(text, pageNumber) {
        const kanjiMap = new Map();
        const kanjiRegex = /[\u4e00-\u9faf]/g;
        const matches = text.match(kanjiRegex);
        if (!matches)
            return kanjiMap;
        const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
        const kanjiCounts = new Map();
        for (const kanji of matches) {
            kanjiCounts.set(kanji, (kanjiCounts.get(kanji) || 0) + 1);
        }
        for (const [kanji, frequency] of kanjiCounts) {
            const relevantSentences = sentences
                .filter(sentence => sentence.includes(kanji))
                .slice(0, 5)
                .map(sentence => sentence.trim());
            const context = [];
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
                context: [...new Set(context)],
                pageNumbers: [pageNumber],
                sentences: relevantSentences
            });
        }
        return kanjiMap;
    }
    async enrichKanjiData(extractedKanji) {
        const enrichedKanji = [];
        for (const kanji of extractedKanji) {
            try {
                let characterData = await this.characterService.getCharacterByCharacter(kanji.character);
                if (!characterData) {
                    characterData = {
                        character: kanji.character,
                        type: 'KANJI',
                        frequency: kanji.frequency,
                        examples: kanji.sentences,
                        usageNotes: `Extracted from EPUB. Found ${kanji.frequency} times.`,
                        isActive: true
                    };
                }
                else {
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
            }
            catch (error) {
                logger_1.logger.error(`Error enriching kanji ${kanji.character}:`, error);
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
    async saveExtractedKanji(enrichedKanji) {
        const savedKanji = [];
        for (const kanjiData of enrichedKanji) {
            try {
                let savedCharacter;
                if (kanjiData.id) {
                    savedCharacter = await this.characterService.updateCharacter(kanjiData.id, kanjiData);
                }
                else {
                    savedCharacter = await this.characterService.createCharacter(kanjiData);
                }
                savedKanji.push(savedCharacter);
                logger_1.logger.info(`Saved kanji character: ${kanjiData.character}`);
            }
            catch (error) {
                logger_1.logger.error(`Error saving kanji ${kanjiData.character}:`, error);
            }
        }
        return savedKanji;
    }
    generateKanjiPagesData(enrichedKanji) {
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
    async processEpubFile(filePath) {
        try {
            logger_1.logger.info(`Starting complete EPUB processing for: ${filePath}`);
            const extractionResult = await this.extractKanjiFromEpub(filePath);
            const enrichedKanji = await this.enrichKanjiData(extractionResult.uniqueKanji);
            const savedKanji = await this.saveExtractedKanji(enrichedKanji);
            const kanjiPagesData = this.generateKanjiPagesData(enrichedKanji);
            logger_1.logger.info(`EPUB processing completed successfully. Processed ${savedKanji.length} kanji characters.`);
            return {
                extractionResult,
                enrichedKanji,
                savedKanji,
                kanjiPagesData
            };
        }
        catch (error) {
            logger_1.logger.error('Error in EPUB processing pipeline:', error);
            throw error;
        }
    }
}
exports.EpubExtractorService = EpubExtractorService;
//# sourceMappingURL=epub-extractor.service.js.map