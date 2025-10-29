import { Request, Response } from 'express';
export declare class LessonController {
    getLessons(req: Request, res: Response): Promise<void>;
    getLessonById(req: Request, res: Response): Promise<void>;
    getLessonsByLevel(req: Request, res: Response): Promise<void>;
    getLessonsByCategory(req: Request, res: Response): Promise<void>;
    getLessonSteps(req: Request, res: Response): Promise<void>;
    getLessonPrerequisites(req: Request, res: Response): Promise<void>;
    getLessonStatistics(req: Request, res: Response): Promise<void>;
    getLessonProgressionPath(req: Request, res: Response): Promise<void>;
    createLesson(req: Request, res: Response): Promise<void>;
    updateLesson(req: Request, res: Response): Promise<void>;
    deleteLesson(req: Request, res: Response): Promise<void>;
}
export declare const lessonController: LessonController;
export default lessonController;
//# sourceMappingURL=lesson.controller.d.ts.map