import { Metadata } from 'next';
import ContactForm from '../components/ContactForm';
import MobileNavigation from '../components/MobileNavigation';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Cruces Gymnastics Center. Schedule a tour, ask questions about our programs, or get enrollment information.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <MobileNavigation />

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
                className="px-3 py-2 rounded-md text-sm font-medium text-red-600 bg-red-50 transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
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
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Contact Cruces Gymnastics Center
            </h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              We'd love to hear from you! Get in touch to learn more about our programs, schedule a tour, or ask any questions.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-12 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phone */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600 mb-4">Speak with our friendly staff</p>
              <span className="text-red-600 font-semibold">
                [PHONE NUMBER NEEDED]</span>
            </div>

            {/* Email */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600 mb-4">Send us a message anytime</p>
              <a href="mailto:info@crucesgymnastics.com" className="text-red-600 font-semibold hover:text-red-700">
                info@crucesgymnastics.com
              </a>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-600 mb-4">Come see our facility</p>
              <address className="text-red-600 font-semibold not-italic">
                3200 W. Picacho Ave<br />
                Las Cruces, NM 88001
              </address>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactForm
            title="Send Us a Message"
            description="Fill out the form below and we'll get back to you within 24 hours. For urgent matters, please call us directly."
            showSubject={true}
            subjects={[
              'General Inquiry',
              'Class Information',
              'Enrollment Question',
              'Schedule Information',
              'Pricing Question',
              'Birthday Party Inquiry',
              'Competitive Team Info',
              'Tour Request',
              'Other'
            ]}
          />
        </div>
      </section>

      {/* Hours and Additional Info */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Hours */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Hours of Operation</h2>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Monday - Friday</span>
                  <span className="text-gray-600">3:00 PM - 8:00 PM</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Saturday</span>
                  <span className="text-gray-600">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Sunday</span>
                  <span className="text-gray-600">10:00 AM - 4:00 PM</span>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Holiday Hours</h3>
                <p className="text-gray-600">
                  We observe major holidays and may have modified hours. Please call ahead during holiday weeks to confirm our schedule.
                </p>
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Do you offer trial classes?</h3>
                  <p className="text-gray-600">
                    Yes! We offer trial classes for new students. Contact us to schedule your child's first class.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What should my child wear?</h3>
                  <p className="text-gray-600">
                    Comfortable athletic clothing that allows for movement. Bare feet or gymnastics shoes are recommended.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Can parents watch classes?</h3>
                  <p className="text-gray-600">
                    We have a viewing area for parents. For preschool classes, parent participation is welcome!
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Do you have makeup classes?</h3>
                  <p className="text-gray-600">
                    Yes, we offer makeup classes for missed sessions. Please contact us to schedule.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Join our gymnastics family today and watch your child grow in confidence and skill!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/enroll"
              className="bg-white text-red-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Enroll Now
            </Link>
            <a
              href="tel:+1575XXXXXXX"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-red-600 transition-colors"
            >
              Call Us Today
            </a>
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
                <p>3200 W. Picacho Ave<br />Las Cruces, NM 88001</p>
                <p>📞 [PHONE NUMBER NEEDED]</p>
                <p>✉️ [EMAIL ADDRESS NEEDED]</p>
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