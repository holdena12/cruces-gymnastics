import { NextRequest, NextResponse } from 'next/server';
import { dynamoAuthOperations as authOperations } from '@/lib/dynamodb-auth';

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
    const authResult = await authOperations.verifyToken(token);
    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = authResult.user!;
    const body = await request.json();
    
    // Basic validation
    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json(
        { success: false, error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    // Update user profile
    const updateResult = await authOperations.updateUserProfile(user.id, {
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.toLowerCase().trim()
    });

    if (!updateResult.success) {
      return NextResponse.json(
        { success: false, error: updateResult.error },
        { status: 400 }
      );
    }

    // Get updated user data
    const verifyAgain = await authOperations.verifyToken(token);
    const updatedUser = verifyAgain.valid ? verifyAgain.user : user;

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