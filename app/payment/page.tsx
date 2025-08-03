'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PaymentForm from '../components/PaymentForm';

interface Enrollment {
  id: number;
  student_first_name: string;
  student_last_name: string;
  parent_first_name: string;
  parent_last_name: string;
  parent_email: string;
  program_type: string;
  status: string;
  submission_date: string;
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get('enrollmentId');
  const paymentType = searchParams.get('type') as 'registration' | 'tuition' | 'late_fee' | 'equipment' | 'birthday_party' || 'registration';
  
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  // Payment amounts by type
  const getPaymentAmount = (type: string, programType: string): number => {
    const defaultAmounts = {
      registration: parseFloat(process.env.NEXT_PUBLIC_REGISTRATION_FEE || '50'),
      tuition: parseFloat(process.env.NEXT_PUBLIC_MONTHLY_TUITION_DEFAULT || '120'),
      late_fee: 25,
      equipment: 0, // Will be specified by admin
      birthday_party: 200
    };

    // You could adjust amounts based on program type
    const programAdjustments: { [key: string]: { [key: string]: number } } = {
      'boys_competitive': { tuition: 150, registration: 75 },
      'girls_competitive': { tuition: 150, registration: 75 },
      'ninja': { tuition: 100, registration: 40 },
      'preschool': { tuition: 80, registration: 35 }
    };

    const adjustment = programAdjustments[programType];
    if (adjustment && adjustment[type]) {
      return adjustment[type];
    }

    return defaultAmounts[type as keyof typeof defaultAmounts] || 50;
  };

  useEffect(() => {
    if (enrollmentId) {
      fetchEnrollment();
    } else {
      setError('No enrollment ID provided');
      setLoading(false);
    }
  }, [enrollmentId]);

  const fetchEnrollment = async () => {
    try {
      // For demo purposes, we'll create a mock enrollment
      // In production, you'd fetch from your API
      const mockEnrollment: Enrollment = {
        id: parseInt(enrollmentId || '1'),
        student_first_name: 'Emma',
        student_last_name: 'Wilson',
        parent_first_name: 'Sarah',
        parent_last_name: 'Wilson',
        parent_email: 'sarah.wilson@example.com',
        program_type: 'girls_recreational',
        status: 'accepted',
        submission_date: new Date().toISOString()
      };

      setEnrollment(mockEnrollment);
    } catch (err) {
      setError('Failed to load enrollment information');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (result: any) => {
    setPaymentResult(result);
    setPaymentComplete(true);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleStartOver = () => {
    setPaymentComplete(false);
    setPaymentResult(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (error && !enrollment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Error Loading Payment</h3>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-2xl font-bold text-gray-900">Payment Successful!</h3>
            <p className="mt-2 text-gray-600">
              {paymentResult?.mockMode 
                ? 'Your demo payment has been processed successfully.' 
                : 'Your payment has been processed and you will receive a receipt via email.'}
            </p>
            
            {enrollment && (
              <div className="mt-6 bg-gray-50 p-4 rounded-md text-left">
                <h4 className="font-semibold text-gray-900 mb-2">Payment Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Student: {enrollment.student_first_name} {enrollment.student_last_name}</div>
                  <div>Program: {enrollment.program_type.replace('_', ' ')}</div>
                  <div>Type: {paymentType.replace('_', ' ')}</div>
                  <div>Amount: ${getPaymentAmount(paymentType, enrollment.program_type).toFixed(2)}</div>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleStartOver}
                className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
              >
                Make Another Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!enrollment) return null;

  const amount = getPaymentAmount(paymentType, enrollment.program_type);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Payment</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Student Information</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Name: {enrollment.student_first_name} {enrollment.student_last_name}</div>
                <div>Program: {enrollment.program_type.replace('_', ' ')}</div>
                <div>Status: <span className="capitalize">{enrollment.status}</span></div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Parent/Guardian</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Name: {enrollment.parent_first_name} {enrollment.parent_last_name}</div>
                <div>Email: {enrollment.parent_email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <PaymentForm
            enrollmentId={enrollment.id}
            amount={amount}
            paymentType={paymentType}
            description={`${paymentType.replace('_', ' ')} payment for ${enrollment.student_first_name} ${enrollment.student_last_name}`}
            customerEmail={enrollment.parent_email}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={() => window.history.back()}
          />
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Secure Payment</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your payment information is encrypted and secure. We never store your card details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}