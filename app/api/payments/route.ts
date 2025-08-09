import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { paymentOperations, enrollmentOperations } from '@/lib/dynamodb-data';
import { dynamoAuthOperations as authOperations } from '@/lib/dynamodb-auth';
import { getSecurityHeaders, rateLimit, sanitizeInput, logSecurityEvent, createAuditLog } from '@/lib/security';

// Helper to create Stripe client only when payments are enabled
async function getStripe() {
  const { default: Stripe } = await import('stripe');
  return new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2025-07-30.basil' });
}

// Payment creation schema
const createPaymentSchema = z.object({
  enrollmentId: z.number().positive(),
  amount: z.number().positive().max(10000), // Max $10,000
  paymentType: z.enum(['registration', 'tuition', 'late_fee', 'equipment', 'birthday_party']),
  description: z.string().optional(),
  customerEmail: z.string().email().optional(),
  billingAddress: z.object({
    line1: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().default('US')
  }).optional()
});

// Payment confirmation schema
const confirmPaymentSchema = z.object({
  paymentIntentId: z.string(),
  paymentMethodId: z.string().optional()
});

async function verifyUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    return await authOperations.verifyToken(token);
  } catch (error) {
    return null;
  }
}

// Create payment intent (for checkout process)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(request, 10, 15 * 60 * 1000); // 10 requests per 15 minutes
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many payment requests. Please try again later.' 
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

    // Parse and validate request
    const body = await request.json();
    const validatedData = createPaymentSchema.parse(body);

    // Get enrollment details
    const enrollment = await enrollmentOperations.getById(validatedData.enrollmentId);
    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    // Check if payments are enabled
    const paymentsEnabled = process.env.ENABLE_PAYMENTS === 'true';
    
    if (!paymentsEnabled) {
      // Mock payment for testing
      const mockPayment = await paymentOperations.create({
        student_id: null,
        enrollment_id: validatedData.enrollmentId,
        amount: validatedData.amount,
        payment_type: validatedData.paymentType,
        payment_method: 'mock',
        payment_status: 'pending',
        stripe_payment_intent_id: `mock_pi_${Date.now()}`,
        stripe_customer_id: null,
        currency: 'usd',
        description: validatedData.description || `${validatedData.paymentType} payment for ${enrollment.student_first_name} ${enrollment.student_last_name}`,
        due_date: new Date().toISOString().split('T')[0],
        parent_email: enrollment.parent_email,
        billing_address: validatedData.billingAddress ? JSON.stringify(validatedData.billingAddress) : null
      });

      logSecurityEvent(createAuditLog({
        action: 'MOCK_PAYMENT_CREATED',
        resource: 'payments',
        details: { 
          paymentId: mockPayment.lastInsertRowid,
          enrollmentId: validatedData.enrollmentId,
          amount: validatedData.amount,
          paymentType: validatedData.paymentType
        },
        success: true
      }));

      return NextResponse.json({
        success: true,
        paymentId: mockPayment.lastInsertRowid,
        clientSecret: 'mock_secret_for_testing',
        message: 'Mock payment created (payments disabled)',
        mockMode: true
      }, { headers: getSecurityHeaders() });
    }

    // Real Stripe payment intent creation
    const stripe = await getStripe();

    // Create Stripe customer if needed
    let customerId = null;
    try {
      const customers = await stripe.customers.list({
        email: enrollment.parent_email,
        limit: 1
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: enrollment.parent_email,
          name: `${enrollment.parent_first_name} ${enrollment.parent_last_name}`,
          metadata: {
            enrollment_id: validatedData.enrollmentId.toString(),
            student_name: `${enrollment.student_first_name} ${enrollment.student_last_name}`
          }
        });
        customerId = customer.id;
      }
    } catch (error) {
      console.error('Error creating/finding Stripe customer:', error);
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(validatedData.amount * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      description: validatedData.description || `${validatedData.paymentType} payment for ${enrollment.student_first_name} ${enrollment.student_last_name}`,
      metadata: {
        enrollment_id: validatedData.enrollmentId.toString(),
        payment_type: validatedData.paymentType,
        student_name: `${enrollment.student_first_name} ${enrollment.student_last_name}`,
        parent_email: enrollment.parent_email
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Save payment record to database
    const payment = await paymentOperations.create({
      student_id: null,
      enrollment_id: validatedData.enrollmentId,
      amount: validatedData.amount,
      payment_type: validatedData.paymentType,
      payment_method: 'stripe',
      payment_status: 'pending',
      stripe_payment_intent_id: paymentIntent.id,
      stripe_customer_id: customerId,
      currency: 'usd',
      description: paymentIntent.description,
      due_date: new Date().toISOString().split('T')[0],
      parent_email: enrollment.parent_email,
      billing_address: validatedData.billingAddress ? JSON.stringify(validatedData.billingAddress) : null
    });

    logSecurityEvent(createAuditLog({
      action: 'PAYMENT_INTENT_CREATED',
      resource: 'payments',
      details: { 
        paymentId: payment.lastInsertRowid,
        stripePaymentIntentId: paymentIntent.id,
        enrollmentId: validatedData.enrollmentId,
        amount: validatedData.amount,
        paymentType: validatedData.paymentType
      },
      success: true
    }));

    return NextResponse.json({
      success: true,
      paymentId: payment.lastInsertRowid,
      clientSecret: paymentIntent.client_secret,
      customerId: customerId
    }, { headers: getSecurityHeaders() });

  } catch (error) {
    console.error('Payment creation error:', error);
    
    logSecurityEvent(createAuditLog({
      action: 'PAYMENT_CREATION_ERROR',
      resource: 'payments',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      success: false
    }));

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid payment data',
          details: (error as any).issues || [] 
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

// Confirm payment (after successful frontend processing)
export async function PATCH(request: NextRequest) {
  try {
    const rateLimitResult = rateLimit(request, 10, 15 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429, headers: getSecurityHeaders() }
      );
    }

    const body = await request.json();
    const validatedData = confirmPaymentSchema.parse(body);

    // Find payment in database
    const payment = await paymentOperations.getByStripePaymentIntentId(validatedData.paymentIntentId);
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    // Check if this is a mock payment
    if (validatedData.paymentIntentId.startsWith('mock_pi_')) {
      // Simulate successful payment
      await paymentOperations.updateStatus(payment.id, 'completed', {
        paid_date: new Date().toISOString(),
        receipt_url: `${process.env.NEXTAUTH_URL}/receipts/mock_${payment.id}`
      });

      logSecurityEvent(createAuditLog({
        action: 'MOCK_PAYMENT_COMPLETED',
        resource: 'payments',
        details: { paymentId: payment.id },
        success: true
      }));

      return NextResponse.json({
        success: true,
        message: 'Mock payment completed successfully',
        mockMode: true
      }, { headers: getSecurityHeaders() });
    }

    // Verify payment with Stripe
    const stripe = await getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(validatedData.paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Update payment status
      await paymentOperations.updateStatus(payment.id, 'completed', {
        paid_date: new Date(paymentIntent.created * 1000).toISOString(),
        stripe_payment_method_id: validatedData.paymentMethodId,
        receipt_url: paymentIntent.receipt_email ? `https://dashboard.stripe.com/receipts/${paymentIntent.charges.data[0]?.receipt_url}` : null
      });

      logSecurityEvent(createAuditLog({
        action: 'PAYMENT_COMPLETED',
        resource: 'payments',
        details: { 
          paymentId: payment.id,
          stripePaymentIntentId: validatedData.paymentIntentId,
          amount: payment.amount
        },
        success: true
      }));

      return NextResponse.json({
        success: true,
        message: 'Payment completed successfully'
      }, { headers: getSecurityHeaders() });
    } else {
      // Update payment with failure info
      await paymentOperations.updateStatus(payment.id, 'failed', {
        failure_reason: `Payment status: ${paymentIntent.status}`
      });

      return NextResponse.json(
        { success: false, error: 'Payment not completed' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

  } catch (error) {
    console.error('Payment confirmation error:', error);
    
    logSecurityEvent(createAuditLog({
      action: 'PAYMENT_CONFIRMATION_ERROR',
      resource: 'payments',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      success: false
    }));

    return NextResponse.json(
      { success: false, error: 'Failed to confirm payment' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// Get payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const enrollmentId = searchParams.get('enrollmentId');

    if (!paymentId && !enrollmentId) {
      return NextResponse.json(
        { success: false, error: 'Payment ID or Enrollment ID required' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    let payments;
    if (paymentId) {
      const payment = await paymentOperations.getById(parseInt(paymentId));
      payments = payment ? [payment] : [];
    } else if (enrollmentId) {
      payments = await paymentOperations.getByEnrollmentId(parseInt(enrollmentId));
    }

    return NextResponse.json({
      success: true,
      payments: payments
    }, { headers: getSecurityHeaders() });

  } catch (error) {
    console.error('Get payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve payment' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}