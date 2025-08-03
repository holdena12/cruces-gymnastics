import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { paymentOperations } from '@/lib/database';
import { authOperations } from '@/lib/auth-database';
import { getSecurityHeaders, rateLimit, logSecurityEvent, createAuditLog } from '@/lib/security';

// Helper function to check if user is admin
async function checkAdmin(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return { isAdmin: false, user: null };
    }

    const token = authHeader.split(' ')[1];
    const user = await authOperations.verifyToken(token);
    
    if (!user || user.role !== 'admin') {
      return { isAdmin: false, user };
    }

    return { isAdmin: true, user };
  } catch (error) {
    console.error('Admin check error:', error);
    return { isAdmin: false, user: null };
  }
}

// Get all payments (admin view)
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(request, 30, 15 * 60 * 1000); // 30 requests per 15 minutes
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.' 
        },
        { 
          status: 429,
          headers: {
            ...getSecurityHeaders(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Check admin authorization
    const { isAdmin, user } = await checkAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentType = searchParams.get('paymentType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Get payments based on filters
    let payments;
    if (startDate && endDate) {
      // Get revenue report if date range provided
      const report = paymentOperations.getRevenueReport(startDate, endDate);
      return NextResponse.json({
        success: true,
        report: report,
        summary: {
          totalRevenue: report.reduce((sum, item) => sum + item.total_amount, 0),
          totalTransactions: report.reduce((sum, item) => sum + item.transaction_count, 0)
        }
      }, { headers: getSecurityHeaders() });
    } else {
      // Get all payments with optional filters
      payments = paymentOperations.getAll();
      
      // Apply filters
      if (status) {
        payments = payments.filter((p: any) => p.payment_status === status);
      }
      if (paymentType) {
        payments = payments.filter((p: any) => p.payment_type === paymentType);
      }

      // Limit results
      payments = payments.slice(0, limit);
    }

    // Get summary statistics
    const allPayments = paymentOperations.getAll();
    const summary = {
      total: allPayments.length,
      completed: allPayments.filter((p: any) => p.payment_status === 'completed').length,
      pending: allPayments.filter((p: any) => p.payment_status === 'pending').length,
      failed: allPayments.filter((p: any) => p.payment_status === 'failed').length,
      totalRevenue: allPayments
        .filter((p: any) => p.payment_status === 'completed')
        .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0),
      recentPayments: allPayments
        .filter((p: any) => {
          const paymentDate = new Date(p.created_at);
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          return paymentDate >= lastWeek;
        }).length
    };

    logSecurityEvent(createAuditLog({
      action: 'ADMIN_PAYMENTS_VIEW',
      resource: 'payments',
      details: { 
        userId: user?.id,
        filtersApplied: { status, paymentType, limit }
      },
      success: true
    }));

    return NextResponse.json({
      success: true,
      payments: payments,
      summary: summary
    }, { headers: getSecurityHeaders() });

  } catch (error) {
    console.error('Admin payments GET error:', error);

    logSecurityEvent(createAuditLog({
      action: 'ADMIN_PAYMENTS_VIEW_ERROR',
      resource: 'payments',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      success: false
    }));

    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// Create payment (admin)
const createPaymentSchema = z.object({
  enrollmentId: z.number().positive(),
  amount: z.number().positive().max(10000),
  paymentType: z.enum(['registration', 'tuition', 'late_fee', 'equipment', 'birthday_party']),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  parentEmail: z.string().email()
});

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = rateLimit(request, 10, 15 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429, headers: getSecurityHeaders() }
      );
    }

    const { isAdmin, user } = await checkAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    const body = await request.json();
    const validatedData = createPaymentSchema.parse(body);

    // Create payment record
    const payment = paymentOperations.create({
      student_id: null,
      enrollment_id: validatedData.enrollmentId,
      amount: validatedData.amount,
      payment_type: validatedData.paymentType,
      payment_method: 'admin_created',
      payment_status: 'pending',
      stripe_payment_intent_id: null,
      stripe_customer_id: null,
      currency: 'usd',
      description: validatedData.description || `${validatedData.paymentType} payment`,
      due_date: validatedData.dueDate || new Date().toISOString().split('T')[0],
      parent_email: validatedData.parentEmail,
      billing_address: null
    });

    logSecurityEvent(createAuditLog({
      action: 'ADMIN_PAYMENT_CREATED',
      resource: 'payments',
      details: { 
        userId: user?.id,
        paymentId: payment.lastInsertRowid,
        enrollmentId: validatedData.enrollmentId,
        amount: validatedData.amount,
        paymentType: validatedData.paymentType
      },
      success: true
    }));

    return NextResponse.json({
      success: true,
      message: 'Payment created successfully',
      paymentId: payment.lastInsertRowid
    }, { headers: getSecurityHeaders() });

  } catch (error) {
    console.error('Admin payment creation error:', error);

    logSecurityEvent(createAuditLog({
      action: 'ADMIN_PAYMENT_CREATION_ERROR',
      resource: 'payments',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      success: false
    }));

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid payment data',
          details: error.errors 
        },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// Update payment status (admin)
const updatePaymentSchema = z.object({
  id: z.number().positive(),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']),
  notes: z.string().optional(),
  refundAmount: z.number().optional()
});

export async function PATCH(request: NextRequest) {
  try {
    const rateLimitResult = rateLimit(request, 15, 15 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429, headers: getSecurityHeaders() }
      );
    }

    const { isAdmin, user } = await checkAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    const body = await request.json();
    const validatedData = updatePaymentSchema.parse(body);

    // Check if payment exists
    const existingPayment = paymentOperations.getById(validatedData.id);
    if (!existingPayment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    // Handle refunds
    if (validatedData.status === 'refunded' && validatedData.refundAmount) {
      paymentOperations.createRefund(
        validatedData.id, 
        validatedData.refundAmount, 
        validatedData.notes || 'Admin refund'
      );
    } else {
      // Regular status update
      const additionalData: any = {};
      if (validatedData.notes) {
        additionalData.notes = existingPayment.notes 
          ? `${existingPayment.notes} | ${validatedData.notes}`
          : validatedData.notes;
      }

      paymentOperations.updateStatus(validatedData.id, validatedData.status, additionalData);
    }

    logSecurityEvent(createAuditLog({
      action: 'ADMIN_PAYMENT_UPDATED',
      resource: 'payments',
      details: { 
        userId: user?.id,
        paymentId: validatedData.id,
        oldStatus: existingPayment.payment_status,
        newStatus: validatedData.status,
        refundAmount: validatedData.refundAmount
      },
      success: true
    }));

    return NextResponse.json({
      success: true,
      message: 'Payment updated successfully'
    }, { headers: getSecurityHeaders() });

  } catch (error) {
    console.error('Admin payment update error:', error);

    logSecurityEvent(createAuditLog({
      action: 'ADMIN_PAYMENT_UPDATE_ERROR',
      resource: 'payments',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      success: false
    }));

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid update data',
          details: error.errors 
        },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update payment' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// Delete payment (admin)
export async function DELETE(request: NextRequest) {
  try {
    const rateLimitResult = rateLimit(request, 5, 15 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429, headers: getSecurityHeaders() }
      );
    }

    const { isAdmin, user } = await checkAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('id');

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment ID required' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    const existingPayment = paymentOperations.getById(parseInt(paymentId));
    if (!existingPayment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    // Only allow deletion of pending payments
    if (existingPayment.payment_status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Can only delete pending payments' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    paymentOperations.delete(parseInt(paymentId));

    logSecurityEvent(createAuditLog({
      action: 'ADMIN_PAYMENT_DELETED',
      resource: 'payments',
      details: { 
        userId: user?.id,
        paymentId: parseInt(paymentId),
        paymentStatus: existingPayment.payment_status,
        amount: existingPayment.amount
      },
      success: true
    }));

    return NextResponse.json({
      success: true,
      message: 'Payment deleted successfully'
    }, { headers: getSecurityHeaders() });

  } catch (error) {
    console.error('Admin payment deletion error:', error);

    logSecurityEvent(createAuditLog({
      action: 'ADMIN_PAYMENT_DELETION_ERROR',
      resource: 'payments',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      success: false
    }));

    return NextResponse.json(
      { success: false, error: 'Failed to delete payment' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}