import { VocabularyData, VocabularyWithRelations, ServiceResponse, PaginationParams, SearchResult, VocabularyCategory, JLPTLevel, DifficultyLevel } from '../types';
export declare class VocabularyService {
    getVocabularyWords(pagination?: PaginationParams, filters?: {
        category?: VocabularyCategory;
        jlptLevel?: JLPTLevel;
        difficultyLevel?: DifficultyLevel;
    }): Promise<ServiceResponse<SearchResult<any>>>;
    getVocabularyWordById(vocabularyId: string): Promise<ServiceResponse<VocabularyWithRelations>>;
    getVocabularyWordsByCategory(category: VocabularyCategory, pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    getVocabularyWordsByJLPTLevel(level: JLPTLevel, pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    searchVocabularyWords(query: string, filters?: {
        category?: VocabularyCategory;
        jlptLevel?: JLPTLevel;
        difficultyLevel?: DifficultyLevel;
    }, pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    createVocabularyWord(data: VocabularyData): Promise<ServiceResponse<VocabularyWithRelations>>;
    updateVocabularyWord(vocabularyId: string, data: Partial<VocabularyData>): Promise<ServiceResponse<VocabularyWithRelations>>;
    deleteVocabularyWord(vocabularyId: string): Promise<ServiceResponse<void>>;
    getVocabularyStatistics(): Promise<ServiceResponse<any>>;
    getVocabularyWordsByFrequency(minFrequency?: number, maxFrequency?: number, pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    getVocabularyWordsByPartOfSpeech(partOfSpeech: string, pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    getRandomVocabularyWords(count?: number, filters?: {
        category?: VocabularyCategory;
        jlptLevel?: JLPTLevel;
        difficultyLevel?: DifficultyLevel;
    }): Promise<ServiceResponse<any[]>>;
}
export declare const vocabularyService: VocabularyService;
export default vocabularyService;
//# sourceMappingURL=vocabulary.service.d.ts.map