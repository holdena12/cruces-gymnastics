import crypto from 'crypto';
import { NextRequest } from 'next/server';

// Environment variable validation
export function validateSecurityConfig() {
  const requiredEnvVars = ['JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.error('🚨 SECURITY WARNING: Missing required environment variables:', missing);
    console.error('Please set these variables in your .env.local file');
  }
  
  // Check for default/weak values
  if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
    console.error('🚨 SECURITY WARNING: Using default JWT_SECRET! Change this immediately!');
  }
  
  if (process.env.ADMIN_PASSWORD === 'TempAdmin123!') {
    console.error('🚨 SECURITY WARNING: Using default admin password! Change this immediately!');
  }
}

// Rate limiting implementation
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

export function rateLimit(request: NextRequest, maxRequests: number = 5, windowMs: number = 15 * 60 * 1000) {
  const clientId = getClientIdentifier(request);
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean up old entries
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < windowStart) {
      delete rateLimitStore[key];
    }
  });
  
  // Check current client
  if (!rateLimitStore[clientId]) {
    rateLimitStore[clientId] = { count: 1, resetTime: now + windowMs };
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }
  
  const clientData = rateLimitStore[clientId];
  
  if (clientData.resetTime < now) {
    // Window has expired, reset
    clientData.count = 1;
    clientData.resetTime = now + windowMs;
    return { allowed: true, remaining: maxRequests - 1, resetTime: clientData.resetTime };
  }
  
  if (clientData.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: clientData.resetTime };
  }
  
  clientData.count++;
  return { allowed: true, remaining: maxRequests - clientData.count, resetTime: clientData.resetTime };
}

// Get client identifier for rate limiting
function getClientIdentifier(request: NextRequest): string {
  // Prefer X-Forwarded-For for real IP behind proxy
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  // Include User-Agent to make it harder to bypass
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return crypto.createHash('sha256').update(ip + userAgent).digest('hex').substring(0, 16);
}

// Data encryption utilities
const ENCRYPTION_KEY = process.env.DATABASE_ENCRYPTION_KEY || 'default-key-change-this';
const IV_LENGTH = 16; // For AES, this is always 16

export function encryptSensitiveData(text: string): string {
  if (!text) return text;
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Return original if encryption fails
  }
}

export function decryptSensitiveData(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
  
  try {
    const [ivHex, encrypted] = encryptedText.split(':');
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // Return original if decryption fails
  }
}

// Input sanitization
export function sanitizeInput(input: string): string {
  if (!input) return input;
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .substring(0, 1000); // Limit length
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password strength validation
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common weak passwords
  const weakPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (weakPasswords.some(weak => password.toLowerCase().includes(weak))) {
    errors.push('Password contains common weak patterns');
  }
  
  return { valid: errors.length === 0, errors };
}

// Security headers
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };
}

// Audit logging
export interface AuditLogEntry {
  timestamp: string;
  userId?: number;
  userEmail?: string;
  action: string;
  resource: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
}

export function createAuditLog(entry: Omit<AuditLogEntry, 'timestamp'>): AuditLogEntry {
  return {
    timestamp: new Date().toISOString(),
    ...entry
  };
}

export function logSecurityEvent(event: AuditLogEntry) {
  if (process.env.ENABLE_AUDIT_LOGGING !== 'true') return;
  
  // In production, you'd want to send this to a secure logging service
  console.log(`[SECURITY AUDIT] ${JSON.stringify(event)}`);
  
  // TODO: In production, implement proper audit logging to external service
  // Examples: AWS CloudTrail, Splunk, ELK Stack, etc.
}

// Initialize security configuration check
if (typeof window === 'undefined') {
  validateSecurityConfig();
} 