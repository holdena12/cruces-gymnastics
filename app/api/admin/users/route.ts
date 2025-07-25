import { NextRequest, NextResponse } from 'next/server';
import { authOperations } from '@/lib/auth-database';

// Verify admin authentication
async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  const result = authOperations.verifyToken(token);
  if (!result.valid || result.user.role !== 'admin') {
    return null;
  }

  return result.user;
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get all users
    const users = authOperations.getAllUsers();

    return NextResponse.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify admin access
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, action, role, adminPassword } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'User ID and action are required' },
        { status: 400 }
      );
    }

    let success = false;

    switch (action) {
      case 'updateRole':
        if (!role || !['user', 'admin'].includes(role)) {
          return NextResponse.json(
            { success: false, error: 'Valid role is required' },
            { status: 400 }
          );
        }
        
        // If promoting to admin, verify the current admin's password
        if (role === 'admin') {
          if (!adminPassword) {
            return NextResponse.json(
              { success: false, error: 'Admin password is required to promote users' },
              { status: 400 }
            );
          }
          
          // Verify the admin's password
          const loginResult = await authOperations.login({
            email: admin.email,
            password: adminPassword
          });
          
          if (!loginResult.success) {
            return NextResponse.json(
              { success: false, error: 'Invalid admin password' },
              { status: 401 }
            );
          }
        }
        
        success = authOperations.updateUserRole(userId, role);
        break;

      case 'deactivate':
        success = authOperations.deactivateUser(userId);
        break;

      case 'activate':
        success = authOperations.activateUser(userId);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: `User ${action} completed successfully`
      });
    } else {
      return NextResponse.json(
        { success: false, error: `Failed to ${action} user` },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Admin users update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 