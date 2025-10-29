import { passwordService } from '../utils/password';

describe('Password utilities', () => {
  it('validates weak and strong passwords', () => {
    const weak = passwordService.validatePasswordStrength('abc');
    expect(weak.isValid).toBe(false);
    expect(weak.errors.length).toBeGreaterThan(0);

    const strong = passwordService.validatePasswordStrength('Str0ng!Passw0rd');
    expect(strong.isValid).toBe(true);
    expect(strong.score).toBeGreaterThanOrEqual(7);
  });

  it('maps score to strength levels', () => {
    expect(passwordService.getPasswordStrengthLevel(0)).toBe('weak');
    expect(passwordService.getPasswordStrengthLevel(4)).toBe('medium');
    expect(passwordService.getPasswordStrengthLevel(6)).toBe('strong');
    expect(passwordService.getPasswordStrengthLevel(8)).toBe('very-strong');
  });

  it('detects compromised passwords', () => {
    expect(passwordService.isPasswordCompromised('password')).toBe(true);
    expect(passwordService.isPasswordCompromised('Unique!Pass123')).toBe(false);
  });

  it('generates secure random strings of expected length', () => {
    const s = passwordService.generateSecureRandomString(16);
    expect(typeof s).toBe('string');
    // hex string from crypto.randomBytes -> length doubles
    expect(s.length).toBe(32);
    expect(/^[0-9a-f]+$/.test(s)).toBe(true);
  });

  it('hashes and compares password successfully', async () => {
    const hash = await passwordService.hashPassword('P@ssw0rd!');
    expect(hash).toMatch(/\$2[aby]\$.{56}/);
    await expect(passwordService.comparePassword('P@ssw0rd!', hash)).resolves.toBe(true);
    await expect(passwordService.comparePassword('wrong', hash)).resolves.toBe(false);
  });

  it('calculates password entropy', () => {
    const e1 = passwordService.calculatePasswordEntropy('aaaa');
    const e2 = passwordService.calculatePasswordEntropy('aA1!');
    expect(e2).toBeGreaterThan(e1);
  });
});


