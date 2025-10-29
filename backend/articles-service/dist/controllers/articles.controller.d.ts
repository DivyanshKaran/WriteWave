import { Request, Response, NextFunction } from 'express';
export declare const createArticle: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getArticles: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getArticleById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateArticle: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteArticle: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const toggleLike: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const toggleBookmark: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const addComment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getComments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTrendingArticles: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getFeaturedArticles: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserArticles: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPopularTags: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getArticleStats: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserArticleStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const errorHandler: (error: any, _req: Request, res: Response, _next: NextFunction) => void;
//# sourceMappingURL=articles.controller.d.ts.map