import { NextRequest, NextResponse } from 'next/server';
import { authOperations } from '@/lib/auth-database';
import { paymentOperations } from '@/lib/database';

// Helper function to verify admin
async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;

  const authResult = authOperations.verifyToken(token);
  if (!authResult.valid || authResult.user.role !== 'admin') return null;

  return authResult.user;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    const type = url.searchParams.get('type'); // 'all', 'overdue', 'pending'

    let payments;
    if (studentId) {
      payments = paymentOperations.getByStudent(parseInt(studentId));
    } else if (type === 'overdue') {
      payments = paymentOperations.getOverdue();
    } else {
      payments = paymentOperations.getAll();
    }

    return NextResponse.json({ success: true, payments });
  } catch (error) {
    console.error('Payment fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { student_id, enrollment_id, amount, payment_type, payment_method, due_date, notes } = body;

    if (!student_id || !amount || !payment_type) {
      return NextResponse.json(
        { success: false, error: 'Student ID, amount, and payment type are required' },
        { status: 400 }
      );
    }

    const result = paymentOperations.create({
      student_id,
      enrollment_id,
      amount: parseFloat(amount),
      payment_type,
      payment_method: payment_method || 'pending',
      payment_status: 'pending',
      due_date,
      notes
    });

    return NextResponse.json({
      success: true,
      message: 'Payment record created successfully',
      paymentId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { paymentId, status, paidDate } = body;

    if (!paymentId || !status) {
      return NextResponse.json(
        { success: false, error: 'Payment ID and status are required' },
        { status: 400 }
      );
    }

    const result = paymentOperations.updateStatus(paymentId, status, paidDate);

    if (result.changes > 0) {
      return NextResponse.json({ success: true, message: 'Payment status updated' });
    } else {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Payment update error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 