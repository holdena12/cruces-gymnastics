import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';

// Import functions to test
import {
  validateSecurityConfig,
  rateLimit,
  encryptSensitiveData,
  decryptSensitiveData,
  sanitizeInput,
  isValidEmail,
  validatePasswordStrength,
  getSecurityHeaders,
  createAuditLog,
  logSecurityEvent
} from './security';

// Mock console methods to capture output
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('Security Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.JWT_SECRET;
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
  });

  afterEach(() => {
    // Restore environment variables
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
    process.env.ADMIN_EMAIL = 'admin@test.com';
    process.env.ADMIN_PASSWORD = 'TestAdmin123!';
  });

  describe('validateSecurityConfig', () => {
    test('should warn about missing environment variables', () => {
      validateSecurityConfig();

      expect(mockConsoleError).toHaveBeenCalledWith(
        '🚨 SECURITY WARNING: Missing required environment variables:',
        ['JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD']
      );
    });

    test('should warn about default JWT_SECRET', () => {
      process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';
      process.env.ADMIN_EMAIL = 'admin@test.com';
      process.env.ADMIN_PASSWORD = 'TestPassword123!';

      validateSecurityConfig();

      expect(mockConsoleError).toHaveBeenCalledWith(
        '🚨 SECURITY WARNING: Using default JWT_SECRET! Change this immediately!'
      );
    });

    test('should warn about default admin password', () => {
      process.env.JWT_SECRET = 'custom-jwt-secret';
      process.env.ADMIN_EMAIL = 'admin@test.com';
      process.env.ADMIN_PASSWORD = 'TempAdmin123!';

      validateSecurityConfig();

      expect(mockConsoleError).toHaveBeenCalledWith(
        '🚨 SECURITY WARNING: Using default admin password! Change this immediately!'
      );
    });

    test('should not warn when all variables are properly set', () => {
      process.env.JWT_SECRET = 'custom-jwt-secret';
      process.env.ADMIN_EMAIL = 'admin@test.com';
      process.env.ADMIN_PASSWORD = 'CustomPassword123!';

      validateSecurityConfig();

      expect(mockConsoleError).not.toHaveBeenCalled();
    });
  });

  describe('rateLimit', () => {
    test('should allow first request', () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header: string) => {
            if (header === 'x-forwarded-for') return '192.168.1.1';
            if (header === 'user-agent') return 'test-agent';
            return null;
          })
        }
      } as unknown as NextRequest;

      const result = rateLimit(mockRequest, 5, 60000);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    test('should block requests after limit exceeded', () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header: string) => {
            if (header === 'x-forwarded-for') return '192.168.1.2';
            if (header === 'user-agent') return 'test-agent';
            return null;
          })
        }
      } as unknown as NextRequest;

      // Make requests up to limit
      for (let i = 0; i < 5; i++) {
        rateLimit(mockRequest, 5, 60000);
      }

      // Next request should be blocked
      const result = rateLimit(mockRequest, 5, 60000);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    test('should reset rate limit after window expires', () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header: string) => {
            if (header === 'x-forwarded-for') return '192.168.1.3';
            if (header === 'user-agent') return 'test-agent';
            return null;
          })
        }
      } as unknown as NextRequest;

      // Mock Date.now to control time
      const originalDateNow = Date.now;
      const baseTime = 1000000;
      Date.now = jest.fn(() => baseTime);

      // Make requests up to limit
      for (let i = 0; i < 5; i++) {
        rateLimit(mockRequest, 5, 1000); // 1 second window
      }

      // Should be blocked
      const blockedResult = rateLimit(mockRequest, 5, 1000);
      expect(blockedResult.allowed).toBe(false);

      // Move time forward past window
      Date.now = jest.fn(() => baseTime + 2000);

      // Should be allowed again
      const allowedResult = rateLimit(mockRequest, 5, 1000);
      expect(allowedResult.allowed).toBe(true);

      // Restore Date.now
      Date.now = originalDateNow;
    });
  });

  describe('encryptSensitiveData and decryptSensitiveData', () => {
    test('should encrypt and decrypt data correctly', () => {
      const originalData = 'sensitive medical information';
      
      const encrypted = encryptSensitiveData(originalData);
      expect(encrypted).not.toBe(originalData);
      expect(encrypted).toContain(':'); // Should have IV:encrypted format
      
      const decrypted = decryptSensitiveData(encrypted);
      expect(decrypted).toBe(originalData);
    });

    test('should handle empty strings', () => {
      expect(encryptSensitiveData('')).toBe('');
      expect(decryptSensitiveData('')).toBe('');
    });

    test('should handle malformed encrypted data', () => {
      const malformed = 'not-encrypted-data';
      const result = decryptSensitiveData(malformed);
      expect(result).toBe(malformed); // Should return original if decryption fails
    });

    test('should generate different encrypted output for same input', () => {
      const data = 'test data';
      const encrypted1 = encryptSensitiveData(data);
      const encrypted2 = encryptSensitiveData(data);
      
      expect(encrypted1).not.toBe(encrypted2); // Different IVs
      expect(decryptSensitiveData(encrypted1)).toBe(data);
      expect(decryptSensitiveData(encrypted2)).toBe(data);
    });
  });

  describe('sanitizeInput', () => {
    test('should remove script tags', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeInput(maliciousInput);
      
      expect(sanitized).toBe('Hello World');
      expect(sanitized).not.toContain('<script>');
    });

    test('should remove dangerous characters', () => {
      const input = 'Hello<>"\' World';
      const sanitized = sanitizeInput(input);
      
      expect(sanitized).toBe('Hello World');
    });

    test('should trim whitespace', () => {
      const input = '  Hello World  ';
      const sanitized = sanitizeInput(input);
      
      expect(sanitized).toBe('Hello World');
    });

    test('should limit length to 1000 characters', () => {
      const longInput = 'a'.repeat(1500);
      const sanitized = sanitizeInput(longInput);
      
      expect(sanitized.length).toBe(1000);
    });

    test('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null as any)).toBe(null);
    });
  });

  describe('isValidEmail', () => {
    test('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'firstname+lastname@example.org',
        'user123@test-domain.com'
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    test('should reject invalid email formats', () => {
      const invalidEmails = [
        'not-an-email',
        '@domain.com', 
        'test@',
        'test@domain', // No TLD
        '',
        'test@.com'
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('validatePasswordStrength', () => {
    test('should validate strong passwords', () => {
      const strongPasswords = [
        'MyUniqueSecret123!',
        'ComplexPhrase@789#',
        'SuperSafeCode456$'
      ];

      strongPasswords.forEach(password => {
        const result = validatePasswordStrength(password);
        if (!result.valid) {
          console.log(`Password "${password}" failed validation:`, result.errors);
        }
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should reject passwords that are too short', () => {
      const result = validatePasswordStrength('Short1!');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 12 characters long');
    });

    test('should reject passwords without lowercase', () => {
      const result = validatePasswordStrength('UPPERCASE123!');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    test('should reject passwords without uppercase', () => {
      const result = validatePasswordStrength('lowercase123!');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    test('should reject passwords without numbers', () => {
      const result = validatePasswordStrength('NoNumbersHere!');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    test('should reject passwords without special characters', () => {
      const result = validatePasswordStrength('NoSpecialChars123');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    test('should reject passwords with weak patterns', () => {
      const weakPasswords = [
        'MyPassword123!',
        'Admin123456!',
        'Qwerty123456!'
      ];

      weakPasswords.forEach(password => {
        const result = validatePasswordStrength(password);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Password contains common weak patterns');
      });
    });
  });

  describe('getSecurityHeaders', () => {
    test('should return all required security headers', () => {
      const headers = getSecurityHeaders();
      
      expect(headers).toHaveProperty('X-Content-Type-Options', 'nosniff');
      expect(headers).toHaveProperty('X-Frame-Options', 'DENY');
      expect(headers).toHaveProperty('X-XSS-Protection', '1; mode=block');
      expect(headers).toHaveProperty('Referrer-Policy', 'strict-origin-when-cross-origin');
      expect(headers).toHaveProperty('Content-Security-Policy');
      expect(headers).toHaveProperty('Strict-Transport-Security');
      expect(headers).toHaveProperty('Permissions-Policy');
    });

    test('should have proper CSP header', () => {
      const headers = getSecurityHeaders();
      const csp = headers['Content-Security-Policy'];
      
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self'");
    });
  });

  describe('createAuditLog', () => {
    test('should create audit log with timestamp', () => {
      const baseEntry = {
        userId: 1,
        userEmail: 'test@example.com',
        action: 'LOGIN_SUCCESS',
        resource: 'authentication',
        success: true
      };

      const log = createAuditLog(baseEntry);
      
      expect(log).toHaveProperty('timestamp');
      expect(log.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO format
      expect(log.userId).toBe(1);
      expect(log.action).toBe('LOGIN_SUCCESS');
      expect(log.success).toBe(true);
    });
  });

  describe('logSecurityEvent', () => {
    beforeEach(() => {
      process.env.ENABLE_AUDIT_LOGGING = 'true';
    });

    test('should log security events when enabled', () => {
      const event = createAuditLog({
        action: 'TEST_ACTION',
        resource: 'test',
        success: true
      });

      logSecurityEvent(event);
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[SECURITY AUDIT]')
      );
    });

    test('should not log when audit logging is disabled', () => {
      process.env.ENABLE_AUDIT_LOGGING = 'false';
      
      const event = createAuditLog({
        action: 'TEST_ACTION',
        resource: 'test',
        success: true
      });

      logSecurityEvent(event);
      
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });
  });
});