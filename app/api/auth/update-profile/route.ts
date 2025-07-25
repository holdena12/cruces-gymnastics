import { NextRequest, NextResponse } from 'next/server';
import { authOperations } from '@/lib/auth-database';

export async function PUT(request: NextRequest) {
  try {
    // Get auth token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user
    const authResult = authOperations.verifyToken(token);
    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const body = await request.json();
    
    // Basic validation
    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json(
        { success: false, error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    // Update user profile
    const updateResult = authOperations.updateUserProfile(user.id, {
      first_name: body.firstName.trim(),
      last_name: body.lastName.trim(),
      email: body.email.toLowerCase().trim()
    });

    if (!updateResult.success) {
      return NextResponse.json(
        { success: false, error: updateResult.error },
        { status: 400 }
      );
    }

    // Get updated user data
    const updatedUser = authOperations.getUserById(user.id);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 