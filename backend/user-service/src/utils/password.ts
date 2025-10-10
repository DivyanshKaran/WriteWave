import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { config } from '@/config';
import { logger } from '@/config/logger';

// Password utility class
export class PasswordService {
  private readonly saltRounds: number;

  constructor() {
    this.saltRounds = config.security.bcryptRounds;
  }

  // Hash password
  async hashPassword(password: string): Promise<string> {
    try {
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);
      logger.debug('Password hashed successfully');
      return hashedPassword;
    } catch (error) {
      logger.error('Password hashing failed', { error });
      throw new Error('Password hashing failed');
    }
  }

  // Compare password with hash
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      logger.debug('Password comparison completed', { isMatch });
      return isMatch;
    } catch (error) {
      logger.error('Password comparison failed', { error });
      throw new Error('Password comparison failed');
    }
  }

  // Generate random password
  generateRandomPassword(length: number = 12): string {
    try {
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
      let password = '';
      
      for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, charset.length);
        password += charset[randomIndex];
      }
      
      logger.debug('Random password generated', { length });
      return password;
    } catch (error) {
      logger.error('Random password generation failed', { error });
      throw new Error('Random password generation failed');
    }
  }

  // Generate secure random string
  generateSecureRandomString(length: number = 32): string {
    try {
      const randomBytes = crypto.randomBytes(length);
      const randomString = randomBytes.toString('hex');
      
      logger.debug('Secure random string generated', { length });
      return randomString;
    } catch (error) {
      logger.error('Secure random string generation failed', { error });
      throw new Error('Secure random string generation failed');
    }
  }

  // Generate password reset token
  generatePasswordResetToken(): string {
    try {
      const token = this.generateSecureRandomString(32);
      logger.debug('Password reset token generated');
      return token;
    } catch (error) {
      logger.error('Password reset token generation failed', { error });
      throw new Error('Password reset token generation failed');
    }
  }

  // Generate email verification token
  generateEmailVerificationToken(): string {
    try {
      const token = this.generateSecureRandomString(32);
      logger.debug('Email verification token generated');
      return token;
    } catch (error) {
      logger.error('Email verification token generation failed', { error });
      throw new Error('Email verification token generation failed');
    }
  }

  // Generate refresh token ID
  generateRefreshTokenId(): string {
    try {
      const tokenId = this.generateSecureRandomString(16);
      logger.debug('Refresh token ID generated');
      return tokenId;
    } catch (error) {
      logger.error('Refresh token ID generation failed', { error });
      throw new Error('Refresh token ID generation failed');
    }
  }

  // Validate password strength
  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    score: number;
  } {
    const errors: string[] = [];
    let score = 0;

    // Check minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else {
      score += 1;
    }

    // Check maximum length
    if (password.length > 128) {
      errors.push('Password must be no more than 128 characters long');
    } else {
      score += 1;
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    // Check for number
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    // Check for special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      score += 1;
    }

    // Check for common passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common');
    } else {
      score += 1;
    }

    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) {
      errors.push('Password cannot contain more than 2 consecutive identical characters');
    } else {
      score += 1;
    }

    const isValid = errors.length === 0;
    
    logger.debug('Password strength validation completed', { 
      isValid, 
      score, 
      errorCount: errors.length 
    });

    return { isValid, errors, score };
  }

  // Get password strength level
  getPasswordStrengthLevel(score: number): 'weak' | 'medium' | 'strong' | 'very-strong' {
    if (score < 4) return 'weak';
    if (score < 6) return 'medium';
    if (score < 8) return 'strong';
    return 'very-strong';
  }

  // Check if password is compromised (basic check)
  isPasswordCompromised(password: string): boolean {
    // This is a basic implementation
    // In production, you might want to use a service like HaveIBeenPwned
    const compromisedPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey',
      'dragon', 'master', 'hello', 'freedom', 'whatever'
    ];
    
    return compromisedPasswords.includes(password.toLowerCase());
  }

  // Generate password hint
  generatePasswordHint(password: string): string {
    // This is a basic implementation
    // In production, you might want to provide more sophisticated hints
    const hint = password.charAt(0) + '*'.repeat(password.length - 2) + password.charAt(password.length - 1);
    return hint;
  }

  // Calculate password entropy
  calculatePasswordEntropy(password: string): number {
    const charsetSize = this.getCharsetSize(password);
    const length = password.length;
    const entropy = Math.log2(Math.pow(charsetSize, length));
    
    return Math.round(entropy * 100) / 100;
  }

  // Get charset size for entropy calculation
  private getCharsetSize(password: string): number {
    let charsetSize = 0;
    
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/\d/.test(password)) charsetSize += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) charsetSize += 32;
    
    return charsetSize || 1;
  }

  // Hash password with custom salt
  async hashPasswordWithSalt(password: string, salt: string): Promise<string> {
    try {
      const hashedPassword = await bcrypt.hash(password, salt);
      logger.debug('Password hashed with custom salt');
      return hashedPassword;
    } catch (error) {
      logger.error('Password hashing with custom salt failed', { error });
      throw new Error('Password hashing with custom salt failed');
    }
  }

  // Generate salt
  generateSalt(): string {
    try {
      const salt = bcrypt.genSaltSync(this.saltRounds);
      logger.debug('Salt generated');
      return salt;
    } catch (error) {
      logger.error('Salt generation failed', { error });
      throw new Error('Salt generation failed');
    }
  }

  // Verify password against multiple hashes (for migration)
  async verifyPasswordAgainstMultipleHashes(
    password: string,
    hashes: string[]
  ): Promise<{ isValid: boolean; matchedHash?: string }> {
    try {
      for (const hash of hashes) {
        const isMatch = await this.comparePassword(password, hash);
        if (isMatch) {
          return { isValid: true, matchedHash: hash };
        }
      }
      
      return { isValid: false };
    } catch (error) {
      logger.error('Password verification against multiple hashes failed', { error });
      throw new Error('Password verification against multiple hashes failed');
    }
  }
}

// Export password service instance
export const passwordService = new PasswordService();

// Password validation utilities
export const validatePasswordStrength = (password: string) => {
  return passwordService.validatePasswordStrength(password);
};

export const getPasswordStrengthLevel = (score: number) => {
  return passwordService.getPasswordStrengthLevel(score);
};

export const isPasswordCompromised = (password: string) => {
  return passwordService.isPasswordCompromised(password);
};

// Password hashing utilities
export const hashPassword = (password: string) => {
  return passwordService.hashPassword(password);
};

export const comparePassword = (password: string, hashedPassword: string) => {
  return passwordService.comparePassword(password, hashedPassword);
};

// Token generation utilities
export const generatePasswordResetToken = () => {
  return passwordService.generatePasswordResetToken();
};

export const generateEmailVerificationToken = () => {
  return passwordService.generateEmailVerificationToken();
};

export const generateRefreshTokenId = () => {
  return passwordService.generateRefreshTokenId();
};

export const generateSecureRandomString = (length?: number) => {
  return passwordService.generateSecureRandomString(length);
};

// Export default
export default passwordService;
