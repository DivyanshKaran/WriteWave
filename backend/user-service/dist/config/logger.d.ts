import winston from 'winston';
export declare const logger: winston.Logger;
export declare const morganStream: {
    write: (message: string) => void;
};
export declare const requestLogger: (req: any, res: any, next: any) => void;
export declare const errorLogger: (error: Error, req?: any) => void;
export declare const securityLogger: (event: string, details: any) => void;
export declare const performanceLogger: (operation: string, duration: number, details?: any) => void;
export declare const databaseLogger: (operation: string, duration: number, details?: any) => void;
export declare const cacheLogger: (operation: string, key: string, hit: boolean, duration?: number) => void;
export declare const authLogger: (event: string, userId?: string, details?: any) => void;
export declare const userActionLogger: (action: string, userId: string, details?: any) => void;
export declare const emailLogger: (event: string, recipient: string, details?: any) => void;
export declare const oauthLogger: (provider: string, event: string, details?: any) => void;
export declare const fileUploadLogger: (event: string, userId: string, details?: any) => void;
export declare const rateLimitLogger: (ip: string, endpoint: string, limit: number) => void;
export declare const healthCheckLogger: (service: string, status: string, duration?: number) => void;
export declare const cleanupLogger: (operation: string, count: number, details?: any) => void;
export default logger;
//# sourceMappingURL=logger.d.ts.map