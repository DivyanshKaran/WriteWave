export type UserProfile = {
    id: string;
    email: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    roles?: string[];
};
export type UserSettings = {
    notificationsEnabled?: boolean;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
    language?: string;
    timezone?: string;
};
export declare class UserServiceClient {
    private client;
    constructor(baseURL?: string);
    getCurrentUser(accessToken: string): Promise<UserProfile>;
    getUserByIdAdmin(userId: string, adminToken: string): Promise<UserProfile>;
    getProfile(accessToken: string): Promise<UserProfile>;
    getSettings(accessToken: string): Promise<UserSettings>;
}
export declare const userServiceClient: UserServiceClient;
//# sourceMappingURL=user-service-client.d.ts.map