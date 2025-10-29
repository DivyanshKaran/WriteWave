import { UserProfileUpdateData, UserSettingsUpdateData, ServiceResponse, PaginationParams, PaginatedResponse } from '../types';
export declare class UserService {
    getUserProfile(userId: string): Promise<ServiceResponse<any>>;
    updateUserProfile(userId: string, data: UserProfileUpdateData): Promise<ServiceResponse<any>>;
    getUserSettings(userId: string): Promise<ServiceResponse<any>>;
    updateUserSettings(userId: string, data: UserSettingsUpdateData): Promise<ServiceResponse<any>>;
    getUserSessions(userId: string): Promise<ServiceResponse<any[]>>;
    deactivateUser(userId: string): Promise<ServiceResponse<void>>;
    reactivateUser(userId: string): Promise<ServiceResponse<void>>;
    deleteUser(userId: string): Promise<ServiceResponse<void>>;
    searchUsers(query: string, pagination?: PaginationParams): Promise<ServiceResponse<PaginatedResponse<any>>>;
    getUserStats(userId: string): Promise<ServiceResponse<any>>;
    updateUserAvatar(userId: string, avatarUrl: string): Promise<ServiceResponse<any>>;
    getUserById(userId: string): Promise<ServiceResponse<any>>;
    getAllUsers(pagination?: PaginationParams): Promise<ServiceResponse<PaginatedResponse<any>>>;
}
export declare const userService: UserService;
export default userService;
//# sourceMappingURL=user.service.d.ts.map