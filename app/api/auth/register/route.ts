import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authOperations } from '@/lib/auth-database';

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
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
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName } = validationResult.data;

    // Create user
    const result = await authOperations.createUser({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      role: 'user' // Default role for registration
    });

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: 409 }
      );
    }

    // Automatically log the user in after registration
    const loginResult = await authOperations.login({ email, password });

    if (!loginResult.success) {
      // User created but login failed - this shouldn't happen
      return NextResponse.json(
        { 
          success: true, 
          user: result.user,
          message: 'Account created successfully. Please log in.' 
        }
      );
    }

    // Create response with token in httpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: loginResult.user,
      message: 'Account created and logged in successfully'
    });

    // Set token in httpOnly cookie
    response.cookies.set('auth-token', loginResult.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 