import { NextRequest, NextResponse } from 'next/server';
import { authOperations } from '@/lib/auth-database';
import { enrollmentOperations } from '@/lib/database';

// Helper function to verify admin
async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;

  const authResult = authOperations.verifyToken(token);
  if (!authResult.valid || authResult.user.role !== 'admin') return null;

  return authResult.user;
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { enrollmentId, action, status } = body;

    if (!enrollmentId || !action || !status) {
      return NextResponse.json(
        { success: false, error: 'Enrollment ID, action, and status are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be approve or reject' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be approved or rejected' },
        { status: 400 }
      );
    }

    // Update enrollment status
    const result = enrollmentOperations.updateStatus(enrollmentId, status);
    const success = result.changes > 0;

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Enrollment ${action}d successfully`
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to update enrollment status' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Admin enrollment update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 