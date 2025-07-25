import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authOperations } from '@/lib/auth-database';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
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
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Authenticate user
    const result = await authOperations.login({ email, password });

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: 401 }
      );
    }

    // Create response with token in httpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: 'Login successful'
    });

    // Set token in httpOnly cookie
    response.cookies.set('auth-token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 