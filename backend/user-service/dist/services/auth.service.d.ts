import { UserRegistrationData, UserLoginData, OAuthUserData, RefreshTokenData, PasswordResetData, PasswordResetConfirmData, EmailVerificationData, ServiceResponse } from '../types';
export declare class AuthService {
    registerUser(data: UserRegistrationData): Promise<ServiceResponse<{
        user: any;
        accessToken: string;
        refreshToken: string;
    }>>;
    loginUser(data: UserLoginData, deviceInfo?: any, ipAddress?: string, userAgent?: string): Promise<ServiceResponse<{
        user: any;
        accessToken: string;
        refreshToken: string;
    }>>;
    oauthLogin(data: OAuthUserData, deviceInfo?: any, ipAddress?: string, userAgent?: string): Promise<ServiceResponse<{
        user: any;
        accessToken: string;
        refreshToken: string;
        isNewUser: boolean;
    }>>;
    refreshToken(data: RefreshTokenData): Promise<ServiceResponse<{
        accessToken: string;
        refreshToken: string;
    }>>;
    logout(refreshToken: string): Promise<ServiceResponse<void>>;
    logoutAllDevices(userId: string): Promise<ServiceResponse<void>>;
    requestPasswordReset(data: PasswordResetData): Promise<ServiceResponse<void>>;
    confirmPasswordReset(data: PasswordResetConfirmData): Promise<ServiceResponse<void>>;
    verifyEmail(data: EmailVerificationData): Promise<ServiceResponse<void>>;
    resendEmailVerification(email: string): Promise<ServiceResponse<void>>;
}
export declare const authService: AuthService;
export default authService;
//# sourceMappingURL=auth.service.d.ts.map