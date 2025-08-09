import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dynamoAuthOperations as authOperations } from '@/lib/dynamodb-auth';
import { rateLimit, getSecurityHeaders, sanitizeInput, logSecurityEvent, createAuditLog } from '@/lib/security';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting to prevent brute force attacks
    const rateLimitResult = rateLimit(request, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes
    if (!rateLimitResult.allowed) {
      logSecurityEvent(createAuditLog({
        action: 'RATE_LIMIT_EXCEEDED',
        resource: 'authentication',
        details: { 
          remaining: rateLimitResult.remaining,
          resetTime: new Date(rateLimitResult.resetTime).toISOString()
        },
        success: false
      }));
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: getSecurityHeaders()
        }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input', 
          details: validationResult.error.issues 
        },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }

    const { email, password } = validationResult.data;
    
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
    const sanitizedPassword = password; // Don't sanitize password as it might remove valid characters

    // Authenticate user
    const result = await authOperations.login({ email: sanitizedEmail, password: sanitizedPassword });

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { 
          status: 401,
          headers: getSecurityHeaders()
        }
      );
    }

    // Create response with token in httpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: 'Login successful'
    });

    // Apply security headers
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Set token in httpOnly cookie with enhanced security
    response.cookies.set('auth-token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours for security
      path: '/',
      domain: process.env.COOKIE_DOMAIN
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    logSecurityEvent(createAuditLog({
      action: 'LOGIN_ERROR',
      resource: 'authentication',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      success: false
    }));
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
} 