import { NextRequest, NextResponse } from 'next/server';
import { enrollmentOperations } from '@/lib/dynamodb-data';
import { dynamoAuthOperations as authOperations } from '@/lib/dynamodb-auth';
import { logSecurityEvent, createAuditLog } from '@/lib/security';

// Helper to check for admin privileges
async function checkAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return null;
  }
  const { valid, user } = await authOperations.verifyToken(token);
  if (valid && user?.role === 'admin') {
    return user;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const user = await checkAdmin(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const enrollments = await enrollmentOperations.getAll();
    return NextResponse.json({ success: true, enrollments });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch enrollments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await checkAdmin(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing id or status' }, { status: 400 });
    }

    await enrollmentOperations.updateStatus(id, status);

    logSecurityEvent(createAuditLog({
      action: 'ENROLLMENT_STATUS_UPDATE',
      resource: `enrollment:${id}`,
      userId: Number(user.id),
      details: { status },
      success: true,
    }));

    return NextResponse.json({ success: true, message: 'Enrollment status updated' });
  } catch (error) {
    console.error('Error updating enrollment status:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    logSecurityEvent(createAuditLog({
      action: 'ENROLLMENT_STATUS_UPDATE_ERROR',
      resource: 'enrollments',
      userId: Number(user.id),
      details: { error: message },
      success: false,
    }));
    return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await checkAdmin(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { enrollmentId, action, status } = await request.json();
    
    // Handle the frontend format (enrollmentId instead of id)
    const id = Number(enrollmentId);
    
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing enrollmentId or status' }, { status: 400 });
    }

    await enrollmentOperations.updateStatus(id, status);

    logSecurityEvent(createAuditLog({
      action: 'ENROLLMENT_STATUS_UPDATE',
      resource: `enrollment:${id}`,
      userId: Number(user.id),
      details: { status, action },
      success: true,
    }));

    return NextResponse.json({ success: true, message: 'Enrollment status updated' });
  } catch (error) {
    console.error('Error updating enrollment status:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    logSecurityEvent(createAuditLog({
      action: 'ENROLLMENT_STATUS_UPDATE_ERROR',
      resource: 'enrollments',
      userId: Number(user.id),
      details: { error: message },
      success: false,
    }));
    return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await checkAdmin(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Enrollment ID is required' }, { status: 400 });
    }

    const result = await enrollmentOperations.delete(Number(id));

    if (result.changes === 0) {
      return NextResponse.json({ success: false, error: 'Enrollment not found or already deleted' }, { status: 404 });
    }

    logSecurityEvent(createAuditLog({
      action: 'ENROLLMENT_DELETE',
      resource: `enrollment:${id}`,
      userId: Number(user.id),
      details: { enrollmentId: id },
      success: true,
    }));

    return NextResponse.json({ success: true, message: 'Enrollment deleted successfully' });
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    logSecurityEvent(createAuditLog({
      action: 'ENROLLMENT_DELETE_ERROR',
      resource: 'enrollments',
      userId: Number(user.id),
      details: { error: message },
      success: false,
    }));
    return NextResponse.json({ success: false, error: 'Failed to delete enrollment' }, { status: 500 });
  }
} 