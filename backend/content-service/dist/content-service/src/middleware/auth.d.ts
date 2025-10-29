import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
            };
        }
    }
}
export declare const authenticateJWT: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const rateLimit: (maxRequests?: number, windowMs?: number) => (req: Request, res: Response, next: NextFunction) => void;
export declare const corsMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const requestLogging: (req: Request, res: Response, next: NextFunction) => void;
export declare const errorHandler: (error: Error, req: Request, res: Response, next: NextFunction) => void;
export declare const notFound: (req: Request, res: Response) => void;
export declare const securityHeaders: (req: Request, res: Response, next: NextFunction) => void;
export declare const requestId: (req: Request, res: Response, next: NextFunction) => void;
export declare const healthCheck: (req: Request, res: Response) => void;
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
//# sourceMappingURL=auth.d.ts.map