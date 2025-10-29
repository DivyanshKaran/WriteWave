"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSecureRandomString = exports.generateRefreshTokenId = exports.generateEmailVerificationToken = exports.generatePasswordResetToken = exports.comparePassword = exports.hashPassword = exports.isPasswordCompromised = exports.getPasswordStrengthLevel = exports.validatePasswordStrength = exports.passwordService = exports.PasswordService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
const logger_1 = require("../config/logger");
class PasswordService {
    constructor() {
        this.saltRounds = config_1.config.security.bcryptRounds;
    }
    async hashPassword(password) {
        try {
            const hashedPassword = await bcryptjs_1.default.hash(password, this.saltRounds);
            logger_1.logger.debug('Password hashed successfully');
            return hashedPassword;
        }
        catch (error) {
            logger_1.logger.error('Password hashing failed', { error });
            throw new Error('Password hashing failed');
        }
    }
    async comparePassword(password, hashedPassword) {
        try {
            const isMatch = await bcryptjs_1.default.compare(password, hashedPassword);
            logger_1.logger.debug('Password comparison completed', { isMatch });
            return isMatch;
        }
        catch (error) {
            logger_1.logger.error('Password comparison failed', { error });
            throw new Error('Password comparison failed');
        }
    }
    generateRandomPassword(length = 12) {
        try {
            const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
            let password = '';
            for (let i = 0; i < length; i++) {
                const randomIndex = crypto_1.default.randomInt(0, charset.length);
                password += charset[randomIndex];
            }
            logger_1.logger.debug('Random password generated', { length });
            return password;
        }
        catch (error) {
            logger_1.logger.error('Random password generation failed', { error });
            throw new Error('Random password generation failed');
        }
    }
    generateSecureRandomString(length = 32) {
        try {
            const randomBytes = crypto_1.default.randomBytes(length);
            const randomString = randomBytes.toString('hex');
            logger_1.logger.debug('Secure random string generated', { length });
            return randomString;
        }
        catch (error) {
            logger_1.logger.error('Secure random string generation failed', { error });
            throw new Error('Secure random string generation failed');
        }
    }
    generatePasswordResetToken() {
        try {
            const token = this.generateSecureRandomString(32);
            logger_1.logger.debug('Password reset token generated');
            return token;
        }
        catch (error) {
            logger_1.logger.error('Password reset token generation failed', { error });
            throw new Error('Password reset token generation failed');
        }
    }
    generateEmailVerificationToken() {
        try {
            const token = this.generateSecureRandomString(32);
            logger_1.logger.debug('Email verification token generated');
            return token;
        }
        catch (error) {
            logger_1.logger.error('Email verification token generation failed', { error });
            throw new Error('Email verification token generation failed');
        }
    }
    generateRefreshTokenId() {
        try {
            const tokenId = this.generateSecureRandomString(16);
            logger_1.logger.debug('Refresh token ID generated');
            return tokenId;
        }
        catch (error) {
            logger_1.logger.error('Refresh token ID generation failed', { error });
            throw new Error('Refresh token ID generation failed');
        }
    }
    validatePasswordStrength(password) {
        const errors = [];
        let score = 0;
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        else {
            score += 1;
        }
        if (password.length > 128) {
            errors.push('Password must be no more than 128 characters long');
        }
        else {
            score += 1;
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        else {
            score += 1;
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        else {
            score += 1;
        }
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        else {
            score += 1;
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        else {
            score += 1;
        }
        const commonPasswords = [
            'password', '123456', '123456789', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein', 'welcome', 'monkey'
        ];
        if (commonPasswords.includes(password.toLowerCase())) {
            errors.push('Password is too common');
        }
        else {
            score += 1;
        }
        if (/(.)\1{2,}/.test(password)) {
            errors.push('Password cannot contain more than 2 consecutive identical characters');
        }
        else {
            score += 1;
        }
        const isValid = errors.length === 0;
        logger_1.logger.debug('Password strength validation completed', {
            isValid,
            score,
            errorCount: errors.length
        });
        return { isValid, errors, score };
    }
    getPasswordStrengthLevel(score) {
        if (score < 4)
            return 'weak';
        if (score < 6)
            return 'medium';
        if (score < 8)
            return 'strong';
        return 'very-strong';
    }
    isPasswordCompromised(password) {
        const compromisedPasswords = [
            'password', '123456', '123456789', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein', 'welcome', 'monkey',
            'dragon', 'master', 'hello', 'freedom', 'whatever'
        ];
        return compromisedPasswords.includes(password.toLowerCase());
    }
    generatePasswordHint(password) {
        const hint = password.charAt(0) + '*'.repeat(password.length - 2) + password.charAt(password.length - 1);
        return hint;
    }
    calculatePasswordEntropy(password) {
        const charsetSize = this.getCharsetSize(password);
        const length = password.length;
        const entropy = Math.log2(Math.pow(charsetSize, length));
        return Math.round(entropy * 100) / 100;
    }
    getCharsetSize(password) {
        let charsetSize = 0;
        if (/[a-z]/.test(password))
            charsetSize += 26;
        if (/[A-Z]/.test(password))
            charsetSize += 26;
        if (/\d/.test(password))
            charsetSize += 10;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
            charsetSize += 32;
        return charsetSize || 1;
    }
    async hashPasswordWithSalt(password, salt) {
        try {
            const hashedPassword = await bcryptjs_1.default.hash(password, salt);
            logger_1.logger.debug('Password hashed with custom salt');
            return hashedPassword;
        }
        catch (error) {
            logger_1.logger.error('Password hashing with custom salt failed', { error });
            throw new Error('Password hashing with custom salt failed');
        }
    }
    generateSalt() {
        try {
            const salt = bcryptjs_1.default.genSaltSync(this.saltRounds);
            logger_1.logger.debug('Salt generated');
            return salt;
        }
        catch (error) {
            logger_1.logger.error('Salt generation failed', { error });
            throw new Error('Salt generation failed');
        }
    }
    async verifyPasswordAgainstMultipleHashes(password, hashes) {
        try {
            for (const hash of hashes) {
                const isMatch = await this.comparePassword(password, hash);
                if (isMatch) {
                    return { isValid: true, matchedHash: hash };
                }
            }
            return { isValid: false };
        }
        catch (error) {
            logger_1.logger.error('Password verification against multiple hashes failed', { error });
            throw new Error('Password verification against multiple hashes failed');
        }
    }
}
exports.PasswordService = PasswordService;
exports.passwordService = new PasswordService();
const validatePasswordStrength = (password) => {
    return exports.passwordService.validatePasswordStrength(password);
};
exports.validatePasswordStrength = validatePasswordStrength;
const getPasswordStrengthLevel = (score) => {
    return exports.passwordService.getPasswordStrengthLevel(score);
};
exports.getPasswordStrengthLevel = getPasswordStrengthLevel;
const isPasswordCompromised = (password) => {
    return exports.passwordService.isPasswordCompromised(password);
};
exports.isPasswordCompromised = isPasswordCompromised;
const hashPassword = (password) => {
    return exports.passwordService.hashPassword(password);
};
exports.hashPassword = hashPassword;
const comparePassword = (password, hashedPassword) => {
    return exports.passwordService.comparePassword(password, hashedPassword);
};
exports.comparePassword = comparePassword;
const generatePasswordResetToken = () => {
    return exports.passwordService.generatePasswordResetToken();
};
exports.generatePasswordResetToken = generatePasswordResetToken;
const generateEmailVerificationToken = () => {
    return exports.passwordService.generateEmailVerificationToken();
};
exports.generateEmailVerificationToken = generateEmailVerificationToken;
const generateRefreshTokenId = () => {
    return exports.passwordService.generateRefreshTokenId();
};
exports.generateRefreshTokenId = generateRefreshTokenId;
const generateSecureRandomString = (length) => {
    return exports.passwordService.generateSecureRandomString(length);
};
exports.generateSecureRandomString = generateSecureRandomString;
exports.default = exports.passwordService;
//# sourceMappingURL=password.js.map