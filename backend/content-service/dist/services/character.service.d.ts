import { CharacterData, CharacterWithRelations, StrokeOrderData, ServiceResponse, PaginationParams, SearchResult, CharacterType, JLPTLevel, DifficultyLevel } from '../types';
export declare class CharacterService {
    getCharacters(pagination?: PaginationParams, filters?: {
        type?: CharacterType;
        jlptLevel?: JLPTLevel;
        difficultyLevel?: DifficultyLevel;
    }): Promise<ServiceResponse<SearchResult<any>>>;
    getCharacterById(characterId: string): Promise<ServiceResponse<CharacterWithRelations>>;
    getCharactersByType(type: CharacterType, pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    getCharactersByJLPTLevel(level: JLPTLevel, pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    getHiraganaCharacters(pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    getKatakanaCharacters(pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    getKanjiCharacters(level: JLPTLevel, pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    getCharacterStrokeOrder(characterId: string): Promise<ServiceResponse<StrokeOrderData>>;
    createCharacter(data: CharacterData): Promise<ServiceResponse<CharacterWithRelations>>;
    updateCharacter(characterId: string, data: Partial<CharacterData>): Promise<ServiceResponse<CharacterWithRelations>>;
    deleteCharacter(characterId: string): Promise<ServiceResponse<void>>;
    searchCharacters(query: string, filters?: {
        type?: CharacterType;
        jlptLevel?: JLPTLevel;
        difficultyLevel?: DifficultyLevel;
    }, pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    getCharacterStatistics(): Promise<ServiceResponse<any>>;
    getCharacterRelationships(characterId: string): Promise<ServiceResponse<any>>;
    getCharacterByCharacter(character: string): Promise<any>;
    getCharacterStats(): Promise<any>;
}
export declare const characterService: CharacterService;
export default characterService;
//# sourceMappingURL=character.service.d.ts.map