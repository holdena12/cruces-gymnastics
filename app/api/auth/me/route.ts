import { NextRequest, NextResponse } from 'next/server';
import { authOperations } from '@/lib/auth-database';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Not authenticated' 
        },
        { status: 401 }
      );
    }

    // Verify token and get user
    const result = authOperations.verifyToken(token);

    if (!result.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Invalid token' 
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.user
    });

  } catch (error) {
    console.error('User info error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 