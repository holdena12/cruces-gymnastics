"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import MobileNavigation from '../components/MobileNavigation';

// Payment amounts by program type
const getRegistrationFee = (programType: string): number => {
  const fees: { [key: string]: number } = {
    'boys_recreational': 50,
    'girls_recreational': 50,
    'boys_competitive': 75,
    'girls_competitive': 75,
    'ninja': 40
  };
  return fees[programType] || 50;
};

interface User {
  id: number;
  email: string;
  role: string;
}

export default function EnrollPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
    type?: 'success' | 'error' | 'info';
    enrollmentId?: number;
    programType?: string;
  } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const result = await response.json();

      if (result.success) {
        setUser(result.user);
      }
    } catch (error) {
      // User not logged in - that's fine
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      student_first_name: formData.get('student_first_name'),
      student_last_name: formData.get('student_last_name'),
      student_date_of_birth: formData.get('student_date_of_birth'),
      student_gender: formData.get('student_gender'),
      previous_experience: formData.get('previous_experience'),
      program_type: formData.get('program'),
      parent_first_name: formData.get('parent_first_name'),
      parent_last_name: formData.get('parent_last_name'),
      parent_email: formData.get('parent_email'),
      parent_phone: formData.get('parent_phone'),
      address: formData.get('address'),
      city: formData.get('city'),
      state: formData.get('state'),
      zip_code: formData.get('zip_code'),
      emergency_contact_name: formData.get('emergency_contact_name'),
      emergency_contact_relationship: formData.get('emergency_contact_relationship'),
      emergency_contact_phone: formData.get('emergency_contact_phone'),
      medical_conditions: formData.get('medical_conditions'),
      medications: formData.get('medications'),
      emergency_medical_treatment: formData.get('emergency_medical_treatment') === 'on',
      liability_waiver: formData.get('liability_waiver') === 'on',
      photo_permission: formData.get('photo_permission') === 'on',
    };

    try {
      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (response.ok) {
        setSubmitStatus({
          success: true,
          message: result.message || 'Enrollment application submitted successfully!',
          type: 'success',
          enrollmentId: result.enrollmentId,
          programType: data.program_type as string
        });
        
        // Reset form
        (e.target as HTMLFormElement).reset();
      } else {
        let errorMessage = result.message || 'Failed to submit enrollment application.';
        let messageType: 'error' | 'info' = 'error';
        
        if (response.status === 409) {
          messageType = 'info';
        }
        
        setSubmitStatus({
          success: false,
          message: errorMessage,
          type: messageType,
        });
      }
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: 'Network error. Please check your connection and try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <MobileNavigation user={user} onLogout={handleLogout} />

      {/* Desktop Navigation */}
      <nav className="bg-white shadow-md border-b border-gray-200 desktop-nav hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">CGC</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Cruces Gymnastics Center
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link
                href="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/contact"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Hello, {user.email}</span>
                  <Link
                    href="/dashboard"
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-red-600 text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Enrollment Form Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Enrollment Application</h1>
            <p className="text-lg text-gray-600">Complete the form below to apply for our gymnastics programs.</p>
          </div>

          {/* Status Message */}
          {submitStatus && (
            <div className={`mb-8 p-4 rounded-lg ${
              submitStatus.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
              submitStatus.type === 'info' ? 'bg-blue-50 border border-blue-200 text-blue-800' :
              'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="font-medium">{submitStatus.message}</p>
            </div>
          )}

          {submitStatus?.success && (
            <div className="mt-4">
              <p className="text-sm mb-4">Your enrollment application has been received. We will contact you within 24 hours to complete the enrollment process and confirm your first class.</p>

              {/* Payment Options */}
              {submitStatus.enrollmentId && submitStatus.programType && (
                <div className="bg-white border border-green-300 rounded-lg p-4 mt-4">
                  <h3 className="font-semibold text-green-800 mb-3">Complete Your Registration</h3>
                  <p className="text-sm text-green-700 mb-4">
                    Secure your spot by paying the registration fee now. You can also pay later if you prefer.
                  </p>

                  <div className="bg-green-50 p-3 rounded-md mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span>Registration Fee:</span>
                      <span className="font-semibold">${getRegistrationFee(submitStatus.programType).toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      One-time fee to secure enrollment
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/payment?enrollmentId=${submitStatus.enrollmentId}&type=registration`}
                      className="flex-1 bg-green-600 text-white text-center py-2 px-4 rounded-md hover:bg-green-700 text-sm font-medium"
                    >
                      Pay Registration Fee Now
                    </Link>
                    <button
                      onClick={() => setSubmitStatus(null)}
                      className="flex-1 bg-white border border-green-600 text-green-600 py-2 px-4 rounded-md hover:bg-green-50 text-sm font-medium"
                    >
                      I'll Pay Later
                    </button>
                  </div>

                  <p className="text-xs text-green-600 mt-3 text-center">
                    💳 Secure payment powered by Stripe • No additional fees
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Enrollment Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Student Information */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Student Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="student_first_name" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="student_first_name"
                      name="student_first_name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="student_last_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="student_last_name"
                      name="student_last_name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="student_date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      id="student_date_of_birth"
                      name="student_date_of_birth"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="student_gender" className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      id="student_gender"
                      name="student_gender"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Program Selection */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Program Selection</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Select Program Type *
                  </label>
                  <div className="space-y-3">

                    <div className="flex items-center">
                      <input
                        id="boys_recreational"
                        name="program"
                        type="radio"
                        value="boys_recreational"
                        required
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                      />
                      <label htmlFor="boys_recreational" className="ml-3 text-sm font-medium text-gray-700">
                        Boys Recreational Gymnastics
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="girls_recreational"
                        name="program"
                        type="radio"
                        value="girls_recreational"
                        required
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                      />
                      <label htmlFor="girls_recreational" className="ml-3 text-sm font-medium text-gray-700">
                        Girls Recreational Gymnastics
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="boys_competitive"
                        name="program"
                        type="radio"
                        value="boys_competitive"
                        required
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                      />
                      <label htmlFor="boys_competitive" className="ml-3 text-sm font-medium text-gray-700">
                        Boys Competitive Gymnastics
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="girls_competitive"
                        name="program"
                        type="radio"
                        value="girls_competitive"
                        required
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                      />
                      <label htmlFor="girls_competitive" className="ml-3 text-sm font-medium text-gray-700">
                        Girls Competitive Gymnastics
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="ninja"
                        name="program"
                        type="radio"
                        value="ninja"
                        required
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                      />
                      <label htmlFor="ninja" className="ml-3 text-sm font-medium text-gray-700">
                        Ninja Classes
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="previous_experience" className="block text-sm font-medium text-gray-700 mb-2">
                    Previous Gymnastics Experience
                  </label>
                  <select
                    id="previous_experience"
                    name="previous_experience"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select experience level</option>
                    <option value="none">No experience</option>
                    <option value="beginner">Beginner (some classes)</option>
                    <option value="intermediate">Intermediate (1-2 years)</option>
                    <option value="advanced">Advanced (3+ years)</option>
                    <option value="competitive">Competitive experience</option>
                  </select>
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Parent/Guardian Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="parent_first_name" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="parent_first_name"
                      name="parent_first_name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="parent_last_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="parent_last_name"
                      name="parent_last_name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="parent_email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="parent_email"
                      name="parent_email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="parent_phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="parent_phone"
                      name="parent_phone"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Address Information</h2>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <select
                        id="state"
                        name="state"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Select State</option>
                        <option value="NM">New Mexico</option>
                        <option value="TX">Texas</option>
                        <option value="AZ">Arizona</option>
                        <option value="CO">Colorado</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        id="zip_code"
                        name="zip_code"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Emergency Contact</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="emergency_contact_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="emergency_contact_name"
                      name="emergency_contact_name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="emergency_contact_relationship" className="block text-sm font-medium text-gray-700 mb-2">
                      Relationship *
                    </label>
                    <input
                      type="text"
                      id="emergency_contact_relationship"
                      name="emergency_contact_relationship"
                      required
                      placeholder="e.g., Grandparent, Uncle, Friend"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="emergency_contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="emergency_contact_phone"
                      name="emergency_contact_phone"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Medical Information</h2>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="medical_conditions" className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Conditions, Allergies, or Special Needs
                    </label>
                    <textarea
                      id="medical_conditions"
                      name="medical_conditions"
                      rows={3}
                      placeholder="Please list any medical conditions, allergies, or special needs we should be aware of."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="medications" className="block text-sm font-medium text-gray-700 mb-2">
                      Current Medications
                    </label>
                    <textarea
                      id="medications"
                      name="medications"
                      rows={2}
                      placeholder="List any medications your child is currently taking."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Waivers and Permissions */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Waivers and Permissions</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <input
                      id="emergency_medical_treatment"
                      name="emergency_medical_treatment"
                      type="checkbox"
                      required
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="emergency_medical_treatment" className="ml-3 text-sm text-gray-700">
                      I give permission for emergency medical treatment if needed. *
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input
                      id="liability_waiver"
                      name="liability_waiver"
                      type="checkbox"
                      required
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="liability_waiver" className="ml-3 text-sm text-gray-700">
                      I acknowledge and accept the liability waiver and understand the risks involved in gymnastics activities. *
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input
                      id="photo_permission"
                      name="photo_permission"
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="photo_permission" className="ml-3 text-sm text-gray-700">
                      I give permission for my child's photo to be used for promotional purposes.
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Enrollment Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">CGC</span>
                </div>
                <span className="text-xl font-bold">Cruces Gymnastics Center</span>
              </div>
              <p className="text-gray-300 mb-4">
                2025 Premier gymnastics training in Las Cruces, New Mexico. Building confidence,
                character, and champions since 2025.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/enroll" className="text-gray-300 hover:text-white transition-colors">Enroll Now</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-gray-300">
                <p>📍 TBD</p>
                <p>📞 (575) XXX-XXXX</p>
                <p>✉️ info@crucesgymnastics.com</p>
                <div className="mt-4">
                  <h4 className="font-semibold text-white mb-2">Hours</h4>
                  <p className="text-sm">Mon-Fri: 3:00 PM - 8:00 PM</p>
                  <p className="text-sm">Saturday: 9:00 AM - 5:00 PM</p>
                  <p className="text-sm">Sunday: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Cruces Gymnastics Center. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}