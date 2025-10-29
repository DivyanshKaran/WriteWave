import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireEmailVerification: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const rateLimit: (maxRequests?: number, windowMs?: number) => (req: Request, res: Response, next: NextFunction) => void;
export declare const corsMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const requestLogging: (req: Request, res: Response, next: NextFunction) => void;
export declare const errorHandler: (error: Error, req: Request, res: Response, next: NextFunction) => void;
export declare const notFound: (req: Request, res: Response) => void;
export declare const securityHeaders: (req: Request, res: Response, next: NextFunction) => void;
export declare const requestId: (req: Request, res: Response, next: NextFunction) => void;
export declare const healthCheck: (req: Request, res: Response) => void;
//# sourceMappingURL=auth.d.ts.map