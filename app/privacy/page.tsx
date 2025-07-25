import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header/Navigation */}
      <header className="bg-gray-900 shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-red-600">Cruces Gymnastics Center</Link>
            </div>
            <div className="flex space-x-4">
              <Link href="/login" className="text-gray-300 hover:text-red-500 transition-colors">Login</Link>
              <Link href="/register" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                Register
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Privacy Policy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, enroll in programs, or contact us. This may include:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Name, email address, phone number, and address</li>
                <li>Student information including age, medical conditions, and emergency contacts</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Communications and feedback you provide to us</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Provide and manage our gymnastics programs and services</li>
                <li>Process enrollment applications and payments</li>
                <li>Communicate with you about classes, events, and updates</li>
                <li>Ensure the safety and well-being of our students</li>
                <li>Improve our services and customer experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Information Sharing</h2>
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties except:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>With your consent</li>
                <li>To trusted service providers who assist us in operations</li>
                <li>When required by law or to protect rights and safety</li>
                <li>In emergency situations involving student safety</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Security</h2>
              <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Access and update your personal information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt out of non-essential communications</li>
                <li>Request a copy of your personal information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us at:</p>
              <div className="mt-2">
                <p>Email: info@crucesgymnastics.com</p>
                <p>Phone: (575) 123-4567</p>
                <p>Address: 123 Gymnastics Way, Las Cruces, NM 88001</p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link href="/register" className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
              Back to Registration
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2 text-red-500">Cruces Gymnastics Center</h2>
            <p className="text-gray-400 text-sm">Building champions, one flip at a time.</p>
            <div className="mt-4 text-gray-400 text-xs">
              <p>&copy; 2024 Cruces Gymnastics Center. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 