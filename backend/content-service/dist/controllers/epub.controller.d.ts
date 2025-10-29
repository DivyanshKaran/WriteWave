import { Request, Response } from 'express';
export declare class EpubController {
    private epubExtractor;
    private upload;
    constructor();
    getUploadMiddleware(): import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    uploadAndExtractKanji: (req: Request, res: Response) => Promise<void>;
    extractKanjiFromFile: (req: Request, res: Response) => Promise<void>;
    getKanjiPageData: (req: Request, res: Response) => Promise<void>;
    getAllExtractedKanji: (req: Request, res: Response) => Promise<void>;
    searchKanji: (req: Request, res: Response) => Promise<void>;
    getExtractionStats: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=epub.controller.d.ts.map