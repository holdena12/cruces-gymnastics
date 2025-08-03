import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { paymentOperations } from '@/lib/database';
import { logSecurityEvent, createAuditLog, getSecurityHeaders } from '@/lib/security';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
}) : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    if (!stripe || !webhookSecret) {
      console.log('Stripe webhook received but Stripe not configured - ignoring');
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      logSecurityEvent(createAuditLog({
        action: 'WEBHOOK_SIGNATURE_VERIFICATION_FAILED',
        resource: 'payments',
        details: { error: err instanceof Error ? err.message : 'Unknown error' },
        success: false
      }));
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    console.log(`Received Stripe webhook: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.processing':
        await handlePaymentIntentProcessing(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'charge.dispute.created':
        await handleChargeDisputeCreated(event.data.object as Stripe.Dispute);
        break;
      
      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    logSecurityEvent(createAuditLog({
      action: 'WEBHOOK_PROCESSING_ERROR',
      resource: 'payments',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      success: false
    }));
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = paymentOperations.getByStripePaymentIntentId(paymentIntent.id);
    if (!payment) {
      console.error(`Payment not found for PaymentIntent: ${paymentIntent.id}`);
      return;
    }

    // Get charge information for receipt
    const charges = paymentIntent.charges?.data || [];
    const charge = charges[0];
    const receiptUrl = charge?.receipt_url || null;

    paymentOperations.updateStatus(payment.id, 'completed', {
      paid_date: new Date(paymentIntent.created * 1000).toISOString(),
      receipt_url: receiptUrl,
      stripe_payment_method_id: paymentIntent.payment_method as string,
      processing_fee: charge ? (charge.application_fee_amount || 0) / 100 : 0
    });

    logSecurityEvent(createAuditLog({
      action: 'PAYMENT_WEBHOOK_SUCCESS',
      resource: 'payments',
      details: { 
        paymentId: payment.id,
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100
      },
      success: true
    }));

    console.log(`Payment ${payment.id} marked as completed via webhook`);
  } catch (error) {
    console.error('Error handling payment_intent.succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = paymentOperations.getByStripePaymentIntentId(paymentIntent.id);
    if (!payment) {
      console.error(`Payment not found for PaymentIntent: ${paymentIntent.id}`);
      return;
    }

    const lastPaymentError = paymentIntent.last_payment_error;
    const failureReason = lastPaymentError 
      ? `${lastPaymentError.type}: ${lastPaymentError.message}` 
      : 'Payment failed';

    paymentOperations.updateStatus(payment.id, 'failed', {
      failure_reason: failureReason
    });

    logSecurityEvent(createAuditLog({
      action: 'PAYMENT_WEBHOOK_FAILED',
      resource: 'payments',
      details: { 
        paymentId: payment.id,
        stripePaymentIntentId: paymentIntent.id,
        failureReason: failureReason
      },
      success: false
    }));

    console.log(`Payment ${payment.id} marked as failed via webhook: ${failureReason}`);
  } catch (error) {
    console.error('Error handling payment_intent.payment_failed:', error);
  }
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = paymentOperations.getByStripePaymentIntentId(paymentIntent.id);
    if (!payment) {
      console.error(`Payment not found for PaymentIntent: ${paymentIntent.id}`);
      return;
    }

    paymentOperations.updateStatus(payment.id, 'cancelled', {
      failure_reason: 'Payment canceled'
    });

    logSecurityEvent(createAuditLog({
      action: 'PAYMENT_WEBHOOK_CANCELED',
      resource: 'payments',
      details: { 
        paymentId: payment.id,
        stripePaymentIntentId: paymentIntent.id
      },
      success: true
    }));

    console.log(`Payment ${payment.id} marked as canceled via webhook`);
  } catch (error) {
    console.error('Error handling payment_intent.canceled:', error);
  }
}

async function handlePaymentIntentProcessing(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = paymentOperations.getByStripePaymentIntentId(paymentIntent.id);
    if (!payment) {
      console.error(`Payment not found for PaymentIntent: ${paymentIntent.id}`);
      return;
    }

    paymentOperations.updateStatus(payment.id, 'processing');

    console.log(`Payment ${payment.id} marked as processing via webhook`);
  } catch (error) {
    console.error('Error handling payment_intent.processing:', error);
  }
}

async function handleChargeDisputeCreated(dispute: Stripe.Dispute) {
  try {
    // Find payment by charge ID
    const chargeId = dispute.charge as string;
    // Note: You might need to store charge IDs in your database to handle this properly
    // For now, we'll log the dispute
    
    logSecurityEvent(createAuditLog({
      action: 'PAYMENT_DISPUTE_CREATED',
      resource: 'payments',
      details: { 
        disputeId: dispute.id,
        chargeId: chargeId,
        amount: dispute.amount / 100,
        reason: dispute.reason,
        status: dispute.status
      },
      success: false
    }));

    console.log(`Dispute created for charge ${chargeId}: ${dispute.reason}`);
    // TODO: Implement admin notification system for disputes
  } catch (error) {
    console.error('Error handling charge.dispute.created:', error);
  }
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  try {
    logSecurityEvent(createAuditLog({
      action: 'STRIPE_CUSTOMER_CREATED',
      resource: 'payments',
      details: { 
        customerId: customer.id,
        email: customer.email
      },
      success: true
    }));

    console.log(`Stripe customer created: ${customer.id} (${customer.email})`);
  } catch (error) {
    console.error('Error handling customer.created:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    // Handle subscription/recurring payments
    logSecurityEvent(createAuditLog({
      action: 'INVOICE_PAYMENT_SUCCEEDED',
      resource: 'payments',
      details: { 
        invoiceId: invoice.id,
        customerId: invoice.customer,
        amount: invoice.amount_paid / 100,
        subscriptionId: invoice.subscription
      },
      success: true
    }));

    console.log(`Invoice payment succeeded: ${invoice.id}`);
    // TODO: Create payment record for subscription payments
  } catch (error) {
    console.error('Error handling invoice.payment_succeeded:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    logSecurityEvent(createAuditLog({
      action: 'INVOICE_PAYMENT_FAILED',
      resource: 'payments',
      details: { 
        invoiceId: invoice.id,
        customerId: invoice.customer,
        amount: invoice.amount_due / 100,
        subscriptionId: invoice.subscription
      },
      success: false
    }));

    console.log(`Invoice payment failed: ${invoice.id}`);
    // TODO: Implement failed payment handling (retry, notifications, etc.)
  } catch (error) {
    console.error('Error handling invoice.payment_failed:', error);
  }
}