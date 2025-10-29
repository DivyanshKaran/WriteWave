import { CharacterService } from './character.service';
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
export declare class EpubExtractorService {
    characterService: CharacterService;
    constructor();
    extractKanjiFromEpub(filePath: string): Promise<EpubExtractionResult>;
    private extractKanjiFromText;
    enrichKanjiData(extractedKanji: ExtractedKanji[]): Promise<any[]>;
    saveExtractedKanji(enrichedKanji: any[]): Promise<any[]>;
    generateKanjiPagesData(enrichedKanji: any[]): any[];
    processEpubFile(filePath: string): Promise<{
        extractionResult: EpubExtractionResult;
        enrichedKanji: any[];
        savedKanji: any[];
        kanjiPagesData: any[];
    }>;
}
//# sourceMappingURL=epub-extractor.service.d.ts.map