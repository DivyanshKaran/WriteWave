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
    userRegistration: Joi.ObjectSchema<any>;
    userLogin: Joi.ObjectSchema<any>;
    passwordResetRequest: Joi.ObjectSchema<any>;
    passwordResetConfirm: Joi.ObjectSchema<any>;
    emailVerification: Joi.ObjectSchema<any>;
    refreshToken: Joi.ObjectSchema<any>;
    userProfileUpdate: Joi.ObjectSchema<any>;
    userSettingsUpdate: Joi.ObjectSchema<any>;
    paginationQuery: Joi.ObjectSchema<any>;
    userIdParam: Joi.ObjectSchema<any>;
    searchQuery: Joi.ObjectSchema<any>;
};
export declare const validateEmail: (email: string) => boolean;
export declare const validatePassword: (password: string) => {
    isValid: boolean;
    errors: string[];
};
export declare const validateUsername: (username: string) => {
    isValid: boolean;
    errors: string[];
};
export declare const sanitizeString: (str: string) => string;
export declare const sanitizeEmail: (email: string) => string;
export declare const sanitizeUsername: (username: string) => string;
export default validationSchemas;
//# sourceMappingURL=validation.d.ts.map