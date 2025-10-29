import { LessonData, LessonWithRelations, ServiceResponse, PaginationParams, SearchResult, LessonType, JLPTLevel, DifficultyLevel } from '../types';
export declare class LessonService {
    getLessons(pagination?: PaginationParams, filters?: {
        type?: LessonType;
        jlptLevel?: JLPTLevel;
        difficultyLevel?: DifficultyLevel;
    }): Promise<ServiceResponse<SearchResult<any>>>;
    getLessonById(lessonId: string): Promise<ServiceResponse<LessonWithRelations>>;
    getLessonsByType(type: LessonType, pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    getLessonsByJLPTLevel(level: JLPTLevel, pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    getLessonsByDifficultyLevel(difficultyLevel: DifficultyLevel, pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    createLesson(data: LessonData): Promise<ServiceResponse<LessonWithRelations>>;
    updateLesson(lessonId: string, data: Partial<LessonData>): Promise<ServiceResponse<LessonWithRelations>>;
    deleteLesson(lessonId: string): Promise<ServiceResponse<void>>;
    searchLessons(query: string, filters?: {
        type?: LessonType;
        jlptLevel?: JLPTLevel;
        difficultyLevel?: DifficultyLevel;
    }, pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    getLessonStatistics(): Promise<ServiceResponse<any>>;
    getLessonProgressionPath(currentLessonId: string): Promise<ServiceResponse<any>>;
    getLessonsByEstimatedTime(minTime?: number, maxTime?: number, pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    getRandomLessons(count?: number, filters?: {
        type?: LessonType;
        jlptLevel?: JLPTLevel;
        difficultyLevel?: DifficultyLevel;
    }): Promise<ServiceResponse<any[]>>;
    getLessonsByLevel(level: string, pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    getLessonsByCategory(category: string, pagination?: PaginationParams): Promise<ServiceResponse<SearchResult<any>>>;
    getLessonSteps(lessonId: string): Promise<ServiceResponse<any[]>>;
    getLessonPrerequisites(lessonId: string): Promise<ServiceResponse<any[]>>;
}
export declare const lessonService: LessonService;
export default lessonService;
//# sourceMappingURL=lesson.service.d.ts.map