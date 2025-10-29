import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare class ValidationError extends Error {
    statusCode: number;
    errors: any[];
    constructor(message: string, errors?: any[]);
}
export declare const validate: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateQuery: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateParams: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validationSchemas: {
    character: Joi.ObjectSchema<any>;
    vocabulary: Joi.ObjectSchema<any>;
    lesson: Joi.ObjectSchema<any>;
    media: Joi.ObjectSchema<any>;
    search: Joi.ObjectSchema<any>;
    pagination: Joi.ObjectSchema<any>;
    idParam: Joi.ObjectSchema<any>;
    characterIdParam: Joi.ObjectSchema<any>;
    vocabularyIdParam: Joi.ObjectSchema<any>;
    lessonIdParam: Joi.ObjectSchema<any>;
    mediaIdParam: Joi.ObjectSchema<any>;
};
export declare const validateCharacterType: (type: string) => boolean;
export declare const validateJLPTLevel: (level: string) => boolean;
export declare const validateDifficultyLevel: (level: string) => boolean;
export declare const validateMediaType: (type: string) => boolean;
export declare const validateVocabularyCategory: (category: string) => boolean;
export declare const validateLessonType: (type: string) => boolean;
export declare const sanitizeString: (str: string) => string;
export declare const sanitizeSearchQuery: (query: string) => string;
export default validationSchemas;
export declare const validateRequest: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.d.ts.map