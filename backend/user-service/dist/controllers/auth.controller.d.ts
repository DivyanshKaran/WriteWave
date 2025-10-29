import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class AuthController {
    register(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    googleLogin(req: Request, res: Response): Promise<void>;
    googleCallback(req: Request, res: Response): Promise<void>;
    refreshToken(req: Request, res: Response): Promise<void>;
    logout(req: AuthenticatedRequest, res: Response): Promise<void>;
    logoutAllDevices(req: AuthenticatedRequest, res: Response): Promise<void>;
    requestPasswordReset(req: Request, res: Response): Promise<void>;
    confirmPasswordReset(req: Request, res: Response): Promise<void>;
    verifyEmail(req: Request, res: Response): Promise<void>;
    resendEmailVerification(req: Request, res: Response): Promise<void>;
    getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const authController: AuthController;
export default authController;
//# sourceMappingURL=auth.controller.d.ts.map