import winston from 'winston';
export declare const logger: winston.Logger;
export declare const morganStream: {
    write: (message: string) => void;
};
export declare const requestLogger: (req: any, res: any, next: any) => void;
export declare const errorLogger: (error: Error, req?: any) => void;
export declare const contentLogger: (action: string, details: any) => void;
export declare const characterLogger: (action: string, characterId?: string, details?: any) => void;
export declare const vocabularyLogger: (action: string, vocabularyId?: string, details?: any) => void;
export declare const lessonLogger: (action: string, lessonId?: string, details?: any) => void;
export declare const mediaLogger: (action: string, mediaId?: string, details?: any) => void;
export declare const searchLogger: (query: string, results: number, duration: number, details?: any) => void;
export declare const cacheLogger: (operation: string, key: string, hit: boolean, duration?: number) => void;
export declare const fileUploadLogger: (action: string, filename: string, size: number, details?: any) => void;
export declare const performanceLogger: (operation: string, duration: number, details?: any) => void;
export declare const databaseLogger: (operation: string, duration: number, details?: any) => void;
export declare const rateLimitLogger: (ip: string, endpoint: string, limit: number) => void;
export declare const healthCheckLogger: (service: string, status: string, duration?: number) => void;
export declare const statisticsLogger: (type: string, count: number, details?: any) => void;
export default logger;
//# sourceMappingURL=logger.d.ts.map