import { MediaData, FileUpload, ServiceResponse, PaginationParams, SearchResult, MediaType } from '../types';
export declare class MediaService {
    getMediaAssets(pagination?: PaginationParams, filters?: {
        type?: MediaType;
        characterId?: string;
        vocabularyWordId?: string;
        lessonId?: string;
    }): Promise<ServiceResponse<SearchResult<any>>>;
    getMediaAssetById(mediaId: string): Promise<ServiceResponse<any>>;
    uploadMediaAsset(file: FileUpload, data: Partial<MediaData>): Promise<ServiceResponse<any>>;
    updateMediaAsset(mediaId: string, data: Partial<MediaData>): Promise<ServiceResponse<any>>;
    deleteMediaAsset(mediaId: string): Promise<ServiceResponse<void>>;
    getMediaAssetsByCharacter(characterId: string): Promise<ServiceResponse<any[]>>;
    getMediaAssetsByVocabularyWord(vocabularyWordId: string): Promise<ServiceResponse<any[]>>;
    getMediaAssetsByLesson(lessonId: string): Promise<ServiceResponse<any[]>>;
    getMediaAssetStatistics(): Promise<ServiceResponse<any>>;
    private processImage;
    private processAudio;
    private getAllowedTypes;
    private validateFileSize;
    private getMimeType;
    cleanupOrphanedMediaAssets(): Promise<ServiceResponse<void>>;
    getMediaAssetsByType(type: MediaType, pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    getMediaAssetsByCategory(category: string, pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    searchMediaAssets(query: string, filters?: any, pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    getMediaAssetFile(mediaId: string): Promise<ServiceResponse<any>>;
    getMediaAssetThumbnail(mediaId: string): Promise<ServiceResponse<any>>;
}
export declare const mediaService: MediaService;
export default mediaService;
//# sourceMappingURL=media.service.d.ts.map