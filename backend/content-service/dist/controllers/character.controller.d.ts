import { Request, Response } from 'express';
export declare class CharacterController {
    getCharacters(req: Request, res: Response): Promise<void>;
    getCharacterById(req: Request, res: Response): Promise<void>;
    getHiraganaCharacters(req: Request, res: Response): Promise<void>;
    getKatakanaCharacters(req: Request, res: Response): Promise<void>;
    getKanjiCharacters(req: Request, res: Response): Promise<void>;
    getCharacterStrokeOrder(req: Request, res: Response): Promise<void>;
    searchCharacters(req: Request, res: Response): Promise<void>;
    getCharacterStatistics(req: Request, res: Response): Promise<void>;
    getCharacterRelationships(req: Request, res: Response): Promise<void>;
    createCharacter(req: Request, res: Response): Promise<void>;
    updateCharacter(req: Request, res: Response): Promise<void>;
    deleteCharacter(req: Request, res: Response): Promise<void>;
}
export declare const characterController: CharacterController;
export default characterController;
//# sourceMappingURL=character.controller.d.ts.map