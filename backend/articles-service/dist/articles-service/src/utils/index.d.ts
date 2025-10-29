export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
export declare const createSlug: (title: string) => string;
export declare const calculateReadTime: (content: string) => number;
export declare const renderMarkdown: (content: string) => string;
export declare const extractExcerpt: (content: string, maxLength?: number) => string;
export declare const validateTags: (tags: string[]) => string[];
export declare const generateArticleSlug: (title: string, existingSlugs?: string[]) => Promise<string>;
export declare const formatArticleResponse: (article: any, userId?: string) => any;
export declare const formatCommentResponse: (comment: any) => any;
export declare const paginate: (page?: number, limit?: number) => {
    offset: number;
    limit: number;
};
export declare const createPaginationMeta: (page: number, limit: number, total: number) => {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};
export declare const sanitizeInput: (input: string) => string;
export declare const isValidObjectId: (id: string) => boolean;
//# sourceMappingURL=index.d.ts.map