'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Initialize Stripe (only if publishable key is available)
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface PaymentFormProps {
  enrollmentId: number;
  amount: number;
  paymentType: 'registration' | 'tuition' | 'late_fee' | 'equipment' | 'birthday_party';
  description?: string;
  customerEmail?: string;
  onSuccess: (paymentResult: any) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

interface CheckoutFormProps extends PaymentFormProps {
  clientSecret: string;
  mockMode?: boolean;
}

// Main payment form wrapper
export default function PaymentForm(props: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [mockMode, setMockMode] = useState(false);

  // Create payment intent when component mounts
  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId: props.enrollmentId,
          amount: props.amount,
          paymentType: props.paymentType,
          description: props.description,
          customerEmail: props.customerEmail
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      setClientSecret(data.clientSecret);
      setMockMode(data.mockMode || false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment';
      setError(errorMessage);
      props.onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Initializing payment...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button 
              onClick={createPaymentIntent}
              className="mt-2 text-sm text-red-800 underline hover:text-red-900"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center p-4 text-gray-500">
        Unable to load payment form. Please try again.
      </div>
    );
  }

  // Mock payment form (when Stripe is disabled)
  if (mockMode) {
    return <MockPaymentForm {...props} clientSecret={clientSecret} mockMode={true} />;
  }

  // Real Stripe payment form
  if (!stripePromise) {
    return <MockPaymentForm {...props} clientSecret={clientSecret} mockMode={true} />;
  }

  const elementsOptions: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, sans-serif',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <CheckoutForm {...props} clientSecret={clientSecret} />
    </Elements>
  );
}

// Mock payment form for testing
function MockPaymentForm({ amount, paymentType, onSuccess, onCancel }: CheckoutFormProps) {
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      onSuccess({
        mockMode: true,
        message: 'Mock payment completed successfully',
        paymentType,
        amount
      });
      setProcessing(false);
    }, 2000);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <h3 className="ml-2 text-lg font-semibold text-yellow-800">Demo Payment Mode</h3>
      </div>
      
      <p className="text-yellow-700 mb-4">
        This is a demonstration payment form. No real charges will be made.
        In production, this would connect to Stripe for secure payment processing.
      </p>

      <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">
        <h4 className="font-semibold text-gray-900 mb-2">Payment Summary</h4>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Type:</span>
          <span className="capitalize">{paymentType.replace('_', ' ')}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold text-gray-900">
          <span>Total:</span>
          <span>${amount.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information (Demo)
          </label>
          <div className="bg-gray-100 border border-gray-300 rounded-md p-3 text-gray-500">
            Demo card: 4242 4242 4242 4242
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={processing}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </span>
            ) : (
              `Pay $${amount.toFixed(2)} (Demo)`
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// Real Stripe checkout form
function CheckoutForm({ amount, paymentType, enrollmentId, onSuccess, onError, onCancel }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onError('Payment system not loaded');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card information not loaded');
      return;
    }

    setProcessing(true);

    try {
      // Confirm the payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        '', // clientSecret is handled by Elements
        {
          payment_method: {
            card: cardElement,
          }
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        const response = await fetch('/api/payments', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            paymentMethodId: paymentIntent.payment_method
          }),
        });

        const data = await response.json();

        if (response.ok) {
          onSuccess({
            paymentIntent,
            message: 'Payment completed successfully'
          });
        } else {
          throw new Error(data.error || 'Payment confirmation failed');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      onError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>

      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
        <h4 className="font-semibold text-gray-900 mb-2">Payment Summary</h4>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Type:</span>
          <span className="capitalize">{paymentType.replace('_', ' ')}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold text-gray-900">
          <span>Total:</span>
          <span>${amount.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-md p-3">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
              onChange={(e) => setCardComplete(e.complete)}
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={!stripe || processing || !cardComplete}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </span>
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={processing}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}