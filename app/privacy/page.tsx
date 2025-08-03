'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Metadata } from 'next';
import MobileNavigation from '../components/MobileNavigation';

interface User {
  id: number;
  email: string;
  role: string;
}

export default function PrivacyPolicyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
                    href="/enroll"
                    className="bg-red-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Enroll Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              Learn how we collect, use, and protect your personal information at Cruces Gymnastics Center.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="prose max-w-none text-gray-700 space-y-8">
              <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
              
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We collect information you provide directly to us, such as when you create an account, 
                  enroll in programs, or contact us. This may include:
                </p>
                <ul className="list-disc list-inside space-y-3 text-gray-700">
                  <li>Name, email address, phone number, and address</li>
                  <li>Student information including age, medical conditions, and emergency contacts</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Communications and feedback you provide to us</li>
                  <li>Usage data and analytics from our website</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-3 text-gray-700">
                  <li>Provide and manage our gymnastics programs and services</li>
                  <li>Process enrollment applications and payments</li>
                  <li>Communicate with you about classes, events, and updates</li>
                  <li>Ensure the safety and well-being of our students</li>
                  <li>Improve our services and customer experience</li>
                  <li>Send you marketing communications (with your consent)</li>
                  <li>Comply with legal obligations and protect our rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Sharing</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-3 text-gray-700">
                  <li><strong>With your consent:</strong> When you explicitly agree to share information</li>
                  <li><strong>Service providers:</strong> With trusted partners who help us operate our business</li>
                  <li><strong>Legal requirements:</strong> When required by law or to protect our legal rights</li>
                  <li><strong>Emergency situations:</strong> To protect the safety of our students and staff</li>
                  <li><strong>Business transfers:</strong> In the event of a merger, sale, or restructuring</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement appropriate security measures to protect your personal information against unauthorized access, 
                  alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc list-inside space-y-3 text-gray-700">
                  <li>Encryption of sensitive data during transmission and storage</li>
                  <li>Regular security audits and updates to our systems</li>
                  <li>Limited access to personal information on a need-to-know basis</li>
                  <li>Secure payment processing through certified payment providers</li>
                  <li>Employee training on data protection and privacy practices</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies and Tracking</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our website uses cookies and similar technologies to enhance your browsing experience. We use:
                </p>
                <ul className="list-disc list-inside space-y-3 text-gray-700">
                  <li><strong>Essential cookies:</strong> Required for basic website functionality</li>
                  <li><strong>Analytics cookies:</strong> To understand how visitors use our website</li>
                  <li><strong>Marketing cookies:</strong> To show relevant advertisements (with your consent)</li>
                  <li><strong>Preference cookies:</strong> To remember your settings and preferences</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-4">You have the right to:</p>
                <ul className="list-disc list-inside space-y-3 text-gray-700">
                  <li><strong>Access:</strong> Request copies of your personal information</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                  <li><strong>Portability:</strong> Request transfer of your information to another organization</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                  <li><strong>Restriction:</strong> Request limitation of how we process your information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We take special care to protect the privacy of children under 13. We only collect personal information 
                  about children with parental consent and for legitimate business purposes related to our gymnastics programs. 
                  Parents have the right to review, delete, or refuse further collection of their child's information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain personal information for as long as necessary to provide our services, comply with legal obligations, 
                  resolve disputes, and enforce our agreements. When information is no longer needed, we securely delete or 
                  anonymize it according to our data retention policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Links</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our website may contain links to third-party websites. We are not responsible for the privacy practices 
                  of these external sites. We encourage you to review the privacy policies of any third-party websites you visit.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this privacy policy from time to time to reflect changes in our practices or legal requirements. 
                  We will notify you of significant changes by posting the updated policy on our website and updating the 
                  "Last updated" date at the top of this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have questions about this privacy policy or how we handle your personal information, please contact us:
                </p>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Cruces Gymnastics Center</strong><br />
                    123 Gymnastics Way<br />
                    Las Cruces, NM 88001<br />
                    Phone: (575) XXX-XXXX<br />
                    Email: privacy@crucesgymnastics.com
                  </p>
                </div>
              </section>
            </div>

            {/* Navigation Links */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <Link
                  href="/terms"
                  className="text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  ← View Terms of Service
                </Link>
                <Link
                  href="/"
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
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
                Premier gymnastics training in Las Cruces, New Mexico. Building confidence, 
                character, and champions since 2020.
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
                <p>📍 123 Gymnastics Way<br />Las Cruces, NM 88001</p>
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
            <p>&copy; 2024 Cruces Gymnastics Center. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}