import Link from "next/link";

export default function TermsOfServicePage() {
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

      {/* Terms of Service Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Acceptance of Terms</h2>
              <p>By enrolling in programs at Cruces Gymnastics Center, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Program Enrollment</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>All enrollments are subject to availability and approval by our staff</li>
                <li>Students must meet age and skill requirements for their selected program</li>
                <li>Medical forms and waivers must be completed before participation</li>
                <li>We reserve the right to move students to more appropriate class levels</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Payment Terms</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Monthly tuition is due on the 1st of each month</li>
                <li>A late fee of $25 will be applied to payments received after the 10th</li>
                <li>Registration fees are non-refundable</li>
                <li>Monthly tuition is non-refundable after the 15th of the month</li>
                <li>NSF check fee is $35</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Attendance and Make-up Policy</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Regular attendance is important for student progress and safety</li>
                <li>Make-up classes may be available for excused absences with advance notice</li>
                <li>No make-ups are provided for unexcused absences</li>
                <li>Make-up classes must be used within the same month</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Safety and Behavior</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Students must follow all safety rules and instructor directions</li>
                <li>Appropriate gymnastics attire is required (see dress code)</li>
                <li>Disruptive behavior may result in removal from class without refund</li>
                <li>Parents/guardians are responsible for student behavior and safety</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Liability and Risk</h2>
              <p className="font-semibold text-red-600 mb-3">IMPORTANT: PLEASE READ CAREFULLY</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Gymnastics involves inherent risks of injury</li>
                <li>Participants assume all risks associated with gymnastics activities</li>
                <li>Cruces Gymnastics Center is not liable for injuries or accidents</li>
                <li>Participants must have adequate health insurance coverage</li>
                <li>A signed liability waiver is required for all participants</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Facility Rules</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Parents/guardians must supervise children in lobby areas</li>
                <li>Food and drinks are not allowed in the gym area</li>
                <li>No unauthorized use of gymnastics equipment</li>
                <li>Cell phones should be silenced during classes</li>
                <li>Photography/videotaping requires permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Termination</h2>
              <p>We reserve the right to terminate services for:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Non-payment of fees</li>
                <li>Violation of facility rules or safety policies</li>
                <li>Disruptive or inappropriate behavior</li>
                <li>Any reason deemed necessary for the safety and well-being of our community</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Information</h2>
              <p>Questions about these terms should be directed to:</p>
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
              <p>&copy; 2025 Cruces Gymnastics Center. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 