import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class UserController {
    getUserProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateUserProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    getUserSettings(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateUserSettings(req: AuthenticatedRequest, res: Response): Promise<void>;
    getUserSessions(req: AuthenticatedRequest, res: Response): Promise<void>;
    deactivateUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    reactivateUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    searchUsers(req: Request, res: Response): Promise<void>;
    getUserStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateUserAvatar(req: AuthenticatedRequest, res: Response): Promise<void>;
    getUserById(req: Request, res: Response): Promise<void>;
    getAllUsers(req: Request, res: Response): Promise<void>;
}
export declare const userController: UserController;
export default userController;
//# sourceMappingURL=user.controller.d.ts.map