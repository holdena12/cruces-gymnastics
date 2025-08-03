import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authOperations } from '@/lib/auth-database';
import { rateLimit, getSecurityHeaders, sanitizeInput, logSecurityEvent, createAuditLog, validatePasswordStrength } from '@/lib/security';

// Enhanced validation schema
const registerSchema = z.object({
  email: z.string().email('Valid email is required').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for registration attempts
    const rateLimitResult = rateLimit(request, 3, 15 * 60 * 1000); // 3 attempts per 15 minutes
    if (!rateLimitResult.allowed) {
      logSecurityEvent(createAuditLog({
        action: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
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
          error: 'Too many registration attempts. Please try again later.',
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
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }

    const { email, password, firstName, lastName } = validationResult.data;
    
    // Additional password strength validation removed to match auth-database.ts configuration
    // NOTE: This maintains consistency with the coach creation system
    /*
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Password does not meet security requirements',
          details: passwordValidation.errors
        },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }
    */

    // Sanitize inputs
    const sanitizedData = {
      email: sanitizeInput(email.toLowerCase().trim()),
      password: password, // Don't sanitize password
      first_name: sanitizeInput(firstName),
      last_name: sanitizeInput(lastName),
      role: 'user' as const // Default role for registration
    };

    // Create user
    const result = await authOperations.createUser(sanitizedData);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { 
          status: 409,
          headers: getSecurityHeaders()
        }
      );
    }

    // Automatically log the user in after registration
    const loginResult = await authOperations.login({ email: sanitizedData.email, password: sanitizedData.password });

    if (!loginResult.success) {
      // User created but login failed - this shouldn't happen
      return NextResponse.json(
        { 
          success: true, 
          user: result.user,
          message: 'Account created successfully. Please log in.' 
        },
        { 
          status: 200,
          headers: getSecurityHeaders()
        }
      );
    }

    // Create response with token in httpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: loginResult.user,
      message: 'Account created and logged in successfully'
    });

    // Apply security headers
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Set token in httpOnly cookie with enhanced security
    response.cookies.set('auth-token', loginResult.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours for security
      path: '/',
      domain: process.env.COOKIE_DOMAIN
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    logSecurityEvent(createAuditLog({
      action: 'REGISTRATION_ERROR',
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