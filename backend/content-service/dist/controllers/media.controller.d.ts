import { Request, Response } from 'express';
export declare class MediaController {
    getMediaAssets(req: Request, res: Response): Promise<void>;
    getMediaAssetById(req: Request, res: Response): Promise<void>;
    getMediaAssetsByType(req: Request, res: Response): Promise<void>;
    getMediaAssetsByCategory(req: Request, res: Response): Promise<void>;
    searchMediaAssets(req: Request, res: Response): Promise<void>;
    getMediaAssetStatistics(req: Request, res: Response): Promise<void>;
    uploadMediaAsset(req: Request, res: Response): Promise<void>;
    updateMediaAsset(req: Request, res: Response): Promise<void>;
    deleteMediaAsset(req: Request, res: Response): Promise<void>;
    getMediaAssetFile(req: Request, res: Response): Promise<void>;
    getMediaAssetThumbnail(req: Request, res: Response): Promise<void>;
}
export declare const mediaController: MediaController;
export default mediaController;
//# sourceMappingURL=media.controller.d.ts.map