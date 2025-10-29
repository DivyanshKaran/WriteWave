export declare class PasswordService {
    private readonly saltRounds;
    constructor();
    hashPassword(password: string): Promise<string>;
    comparePassword(password: string, hashedPassword: string): Promise<boolean>;
    generateRandomPassword(length?: number): string;
    generateSecureRandomString(length?: number): string;
    generatePasswordResetToken(): string;
    generateEmailVerificationToken(): string;
    generateRefreshTokenId(): string;
    validatePasswordStrength(password: string): {
        isValid: boolean;
        errors: string[];
        score: number;
    };
    getPasswordStrengthLevel(score: number): 'weak' | 'medium' | 'strong' | 'very-strong';
    isPasswordCompromised(password: string): boolean;
    generatePasswordHint(password: string): string;
    calculatePasswordEntropy(password: string): number;
    private getCharsetSize;
    hashPasswordWithSalt(password: string, salt: string): Promise<string>;
    generateSalt(): string;
    verifyPasswordAgainstMultipleHashes(password: string, hashes: string[]): Promise<{
        isValid: boolean;
        matchedHash?: string;
    }>;
}
export declare const passwordService: PasswordService;
export declare const validatePasswordStrength: (password: string) => {
    isValid: boolean;
    errors: string[];
    score: number;
};
export declare const getPasswordStrengthLevel: (score: number) => "medium" | "weak" | "strong" | "very-strong";
export declare const isPasswordCompromised: (password: string) => boolean;
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const generatePasswordResetToken: () => string;
export declare const generateEmailVerificationToken: () => string;
export declare const generateRefreshTokenId: () => string;
export declare const generateSecureRandomString: (length?: number) => string;
export default passwordService;
//# sourceMappingURL=password.d.ts.map