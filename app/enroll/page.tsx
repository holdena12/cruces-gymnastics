"use client";
import Link from "next/link";
import { useState } from "react";

export default function EnrollPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

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
      emergency_contact_alt_phone: formData.get('emergency_contact_alt_phone'),
      allergies: formData.get('allergies'),
      medical_conditions: formData.get('medical_conditions'),
      medications: formData.get('medications'),
      physician_name: formData.get('physician_name'),
      physician_phone: formData.get('physician_phone'),
      payment_method: formData.get('payment-method'),
      terms_accepted: formData.get('terms_accepted') === 'on',
      photo_permission: formData.get('photo_permission') === 'on',
      email_updates: formData.get('email_updates') === 'on',
      signature_name: formData.get('signature_name'),
      signature_date: formData.get('signature_date'),
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

      if (result.success) {
        setSubmitStatus({
          success: true,
          message: result.message,
        });
        // Reset form
        e.currentTarget.reset();
      } else {
        setSubmitStatus({
          success: false,
          message: result.error || 'An error occurred while submitting your enrollment.',
        });
      }
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header/Navigation */}
      <header className="bg-gray-900 shadow-md sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-red-600">Cruces Gymnastics Center</Link>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="/#home" className="text-gray-300 hover:text-red-500 transition-colors">Home</Link>
              <Link href="/#programs" className="text-gray-300 hover:text-red-500 transition-colors">Programs</Link>
              <Link href="/#coaches" className="text-gray-300 hover:text-red-500 transition-colors">Coaches</Link>
              <Link href="/#contact" className="text-gray-300 hover:text-red-500 transition-colors">Contact</Link>
            </div>
            <Link href="/enroll" className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
              Enroll Now
            </Link>
          </div>
        </nav>
      </header>

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
              submitStatus.success 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              <p className="font-medium">{submitStatus.message}</p>
              {submitStatus.success && (
                <p className="text-sm mt-2">Your enrollment application has been received. We will contact you within 24 hours to complete the enrollment process and confirm your first class.</p>
              )}
            </div>
          )}

          {/* Enrollment Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form className="space-y-8" onSubmit={handleSubmit}>
              
              {/* Student Information Section */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Student Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input type="text" name="student_first_name" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="Enter first name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input type="text" name="student_last_name" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="Enter last name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                    <input type="date" name="student_date_of_birth" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select name="student_gender" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent">
                      <option value="">Select gender</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Previous Gymnastics Experience</label>
                    <textarea rows={3} name="previous_experience" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="Describe any previous gymnastics experience, skills learned, etc."></textarea>
                  </div>
                </div>
              </div>

              {/* Program Selection Section */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Program Selection</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Select Program Type *</label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input type="radio" name="program" value="preschool" required className="text-red-600 focus:ring-red-600" />
                        <div>
                          <span className="font-medium">Pre-School Gymnastics</span>
                          <p className="text-sm text-gray-600">Ages 18 months - 5 years | $80/month</p>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input type="radio" name="program" value="recreational" required className="text-red-600 focus:ring-red-600" />
                        <div>
                          <span className="font-medium">Recreational Gymnastics</span>
                          <p className="text-sm text-gray-600">Ages 6-12 | $95/month</p>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input type="radio" name="program" value="competitive" required className="text-red-600 focus:ring-red-600" />
                        <div>
                          <span className="font-medium">Competitive Team</span>
                          <p className="text-sm text-gray-600">Ages 7+ | $150+/month</p>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input type="radio" name="program" value="ninja" required className="text-red-600 focus:ring-red-600" />
                        <div>
                          <span className="font-medium">Ninja Classes</span>
                          <p className="text-sm text-gray-600">Ages 4-16 | $85/month</p>
                        </div>
                      </label>
                    </div>
                  </div>

                </div>
              </div>

              {/* Parent/Guardian Information Section */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Parent/Guardian Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent/Guardian First Name *</label>
                    <input type="text" name="parent_first_name" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="Enter first name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent/Guardian Last Name *</label>
                    <input type="text" name="parent_last_name" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="Enter last name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input type="email" name="parent_email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="Enter email address" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input type="tel" name="parent_phone" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="(575) 123-4567" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <input type="text" name="address" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="Enter street address" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input type="text" name="city" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="Las Cruces" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input type="text" name="state" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="NM" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code *</label>
                    <input type="text" name="zip_code" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="88001" />
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Emergency Contact</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name *</label>
                    <input type="text" name="emergency_contact_name" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="Enter emergency contact name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relationship to Student *</label>
                    <input type="text" name="emergency_contact_relationship" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="e.g., Grandparent, Aunt, Family Friend" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Phone *</label>
                    <input type="tel" name="emergency_contact_phone" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="(575) 123-4567" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alternative Phone</label>
                    <input type="tel" name="emergency_contact_alt_phone" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="(575) 123-4567" />
                  </div>
                </div>
              </div>

              {/* Medical Information Section */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Medical Information</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Known Allergies</label>
                    <textarea rows={3} name="allergies" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="List any known allergies or write 'None'"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
                    <textarea rows={3} name="medical_conditions" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="List any medical conditions we should be aware of or write 'None'"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medications</label>
                    <textarea rows={3} name="medications" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="List any medications currently being taken or write 'None'"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Physician Name</label>
                    <input type="text" name="physician_name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="Enter physician name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Physician Phone</label>
                    <input type="tel" name="physician_phone" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="(575) 123-4567" />
                  </div>
                </div>
              </div>

              {/* Payment Information Section */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Payment Information</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method *</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3">
                        <input type="radio" name="payment-method" value="monthly" className="text-red-600 focus:ring-red-600" />
                        <span>Monthly Auto-Pay (Credit/Debit Card)</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="radio" name="payment-method" value="check" className="text-red-600 focus:ring-red-600" />
                        <span>Monthly Check</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="radio" name="payment-method" value="cash" className="text-red-600 focus:ring-red-600" />
                        <span>Monthly Cash Payment</span>
                      </label>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-4">Additional Fees (if applicable)</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• Registration Fee: $[AMOUNT] (one-time)</p>
                      <p>• Equipment Fee: $[AMOUNT] (annual)</p>
                      <p>• Competition Fees: $[AMOUNT] (competitive team only)</p>
                      <p>• Late Payment Fee: $[AMOUNT]</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions Section */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Terms and Conditions</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Please review and acknowledge:</h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <p>• I understand the cancellation policy [DETAILS TO BE FILLED]</p>
                      <p>• I agree to the payment terms and policies [DETAILS TO BE FILLED]</p>
                      <p>• I understand the make-up class policy [DETAILS TO BE FILLED]</p>
                      <p>• I acknowledge the risk and liability policy [DETAILS TO BE FILLED]</p>
                      <p>• I agree to the dress code and behavior expectations [DETAILS TO BE FILLED]</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3">
                      <input type="checkbox" name="terms_accepted" required className="mt-1 text-red-600 focus:ring-red-600" />
                      <span className="text-sm text-gray-700">I have read and agree to the terms and conditions, liability waiver, and all policies of Cruces Gymnastics Center. *</span>
                    </label>
                    <label className="flex items-start space-x-3">
                      <input type="checkbox" name="photo_permission" className="mt-1 text-red-600 focus:ring-red-600" />
                      <span className="text-sm text-gray-700">I give permission for my child to be photographed/videotaped for promotional purposes.</span>
                    </label>
                    <label className="flex items-start space-x-3">
                      <input type="checkbox" name="email_updates" className="mt-1 text-red-600 focus:ring-red-600" />
                      <span className="text-sm text-gray-700">I would like to receive email updates about events, camps, and special programs.</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Signature Section */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Electronic Signature</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent/Guardian Signature (Type Full Name) *</label>
                    <input type="text" name="signature_name" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="Type your full name as electronic signature" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input type="date" name="signature_date" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">By typing your name above, you are providing your electronic signature and agree that it has the same legal effect as a handwritten signature.</p>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`px-12 py-4 rounded-lg font-semibold text-lg transition-colors ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Enrollment Application'}
                </button>
                <p className="text-sm text-gray-600 mt-4">After submitting, we will contact you within 24 hours to complete the enrollment process.</p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-500">Cruces Gymnastics Center</h2>
            <p className="text-gray-400 mb-6">Quality gymnastics training in Las Cruces.</p>
            <div className="flex justify-center space-x-6">
              <a href="https://facebook.com/crucesgymnastics" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors">Facebook</a>
              <a href="https://instagram.com/crucesgymnastics" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors">Instagram</a>
              <a href="https://youtube.com/@crucesgymnastics" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors">YouTube</a>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-gray-400">
              <p>&copy; 2025 Cruces Gymnastics Center. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 