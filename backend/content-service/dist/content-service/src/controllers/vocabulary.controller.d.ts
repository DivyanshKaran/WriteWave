import { Request, Response } from 'express';
export declare class VocabularyController {
    getVocabularyWords(req: Request, res: Response): Promise<void>;
    getVocabularyWordById(req: Request, res: Response): Promise<void>;
    getVocabularyWordsByCategory(req: Request, res: Response): Promise<void>;
    getVocabularyWordsByJLPTLevel(req: Request, res: Response): Promise<void>;
    searchVocabularyWords(req: Request, res: Response): Promise<void>;
    getVocabularyStatistics(req: Request, res: Response): Promise<void>;
    getVocabularyWordsByFrequency(req: Request, res: Response): Promise<void>;
    getVocabularyWordsByPartOfSpeech(req: Request, res: Response): Promise<void>;
    getRandomVocabularyWords(req: Request, res: Response): Promise<void>;
    createVocabularyWord(req: Request, res: Response): Promise<void>;
    updateVocabularyWord(req: Request, res: Response): Promise<void>;
    deleteVocabularyWord(req: Request, res: Response): Promise<void>;
}
export declare const vocabularyController: VocabularyController;
export default vocabularyController;
//# sourceMappingURL=vocabulary.controller.d.ts.map