"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [contactStatus, setContactStatus] = useState<{success: boolean; message: string} | null>(null);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setContactStatus({ success: true, message: 'Thank you for your message! We\'ll get back to you within 24 hours.' });
    setContactForm({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setContactStatus(null), 5000);
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="bg-gray-900 shadow-md sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-red-600">Cruces Gymnastics Center</h1>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-300 hover:text-red-500 transition-colors">Home</a>
              <a href="#programs" className="text-gray-300 hover:text-red-500 transition-colors">Programs</a>
              <a href="#schedule" className="text-gray-300 hover:text-red-500 transition-colors">Schedule</a>
              <a href="#coaches" className="text-gray-300 hover:text-red-500 transition-colors">Coaches</a>
              <a href="#contact" className="text-gray-300 hover:text-red-500 transition-colors">Contact</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-300 hover:text-red-500 transition-colors">
                Login
              </Link>
              <Link href="/register" className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                Register
              </Link>
              <Link href="/enroll" className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                Enroll Now
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-r from-gray-900 to-red-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-6">Welcome to Cruces Gymnastics Center</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Inspiring excellence, building confidence, and fostering a love for gymnastics in Las Cruces. 
              Join our community of dedicated athletes and discover your potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/enroll" className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Your Journey
              </Link>
              <Link href="#coaches" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors text-center">
                Meet Our Coaches
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Our Programs</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From toddlers to competitive athletes, we offer programs designed to meet every gymnast where they are.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Pre-School Gymnastics */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-200">
              <div className="h-48 bg-gradient-to-br from-red-500 to-red-700"></div>
              <div className="p-6">
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Pre-School Gymnastics</h4>
                <p className="text-gray-600 mb-4">Ages 18 months - 5 years. Fun introduction to movement and basic gymnastics skills.</p>
                <p className="text-red-600 font-semibold">$80/month</p>
              </div>
            </div>

            {/* Recreational Gymnastics */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-200">
              <div className="h-48 bg-gradient-to-br from-gray-600 to-gray-800"></div>
              <div className="p-6">
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Recreational Gymnastics</h4>
                <p className="text-gray-600 mb-4">Ages 6-12. Learn fundamental skills on all events in a fun environment.</p>
                <p className="text-red-600 font-semibold">$95/month</p>
              </div>
            </div>

            {/* Competitive Team */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-200">
              <div className="h-48 bg-gradient-to-br from-red-600 to-red-800"></div>
              <div className="p-6">
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Competitive Team</h4>
                <p className="text-gray-600 mb-4">Ages 7+. Train to compete at local, state, and regional levels.</p>
                <p className="text-red-600 font-semibold">$150+/month</p>
              </div>
            </div>

            {/* Adult Classes */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-200">
              <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-900"></div>
              <div className="p-6">
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Adult Classes</h4>
                <p className="text-gray-600 mb-4">18+. Stay fit and learn new skills in our adult gymnastics classes.</p>
                <p className="text-red-600 font-semibold">$70/month</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Class Schedule</h3>
            <p className="text-lg text-gray-600">Find the perfect class time for your schedule</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left">Time</th>
                    <th className="px-6 py-3 text-left">Monday</th>
                    <th className="px-6 py-3 text-left">Tuesday</th>
                    <th className="px-6 py-3 text-left">Wednesday</th>
                    <th className="px-6 py-3 text-left">Thursday</th>
                    <th className="px-6 py-3 text-left">Friday</th>
                    <th className="px-6 py-3 text-left">Saturday</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 font-medium text-gray-900">4:00 PM</td>
                    <td className="px-6 py-4 text-gray-700">Pre-School</td>
                    <td className="px-6 py-4 text-gray-700">Beginner</td>
                    <td className="px-6 py-4 text-gray-700">Pre-School</td>
                    <td className="px-6 py-4 text-gray-700">Beginner</td>
                    <td className="px-6 py-4 text-gray-700">Team Practice</td>
                    <td className="px-6 py-4 text-gray-700">Open Gym</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">5:00 PM</td>
                    <td className="px-6 py-4 text-gray-700">Intermediate</td>
                    <td className="px-6 py-4 text-gray-700">Advanced</td>
                    <td className="px-6 py-4 text-gray-700">Intermediate</td>
                    <td className="px-6 py-4 text-gray-700">Advanced</td>
                    <td className="px-6 py-4 text-gray-700">Team Practice</td>
                    <td className="px-6 py-4 text-gray-700">Birthday Parties</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-gray-900">6:00 PM</td>
                    <td className="px-6 py-4 text-gray-700">Team Practice</td>
                    <td className="px-6 py-4 text-gray-700">Adult Class</td>
                    <td className="px-6 py-4 text-gray-700">Team Practice</td>
                    <td className="px-6 py-4 text-gray-700">Adult Class</td>
                    <td className="px-6 py-4 text-gray-700">-</td>
                    <td className="px-6 py-4 text-gray-700">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Coaches Section */}
      <section id="coaches" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Coaches</h3>
            <p className="text-lg text-gray-600">Our experienced and certified coaches are passionate about helping every gymnast reach their full potential</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Coach 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="h-64 bg-gradient-to-br from-red-500 to-red-700"></div>
              <div className="p-6">
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Sarah Martinez</h4>
                <p className="text-red-600 font-medium mb-3">Head Coach & Owner</p>
                <p className="text-gray-600 text-sm">15+ years experience, USAG certified. Specializes in competitive team training and recreational programs.</p>
              </div>
            </div>

            {/* Coach 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="h-64 bg-gradient-to-br from-gray-600 to-gray-800"></div>
              <div className="p-6">
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Jessica Chen</h4>
                <p className="text-red-600 font-medium mb-3">Pre-School Specialist</p>
                <p className="text-gray-600 text-sm">Former collegiate gymnast with 8 years coaching experience. Expert in early childhood development and movement.</p>
              </div>
            </div>

            {/* Coach 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="h-64 bg-gradient-to-br from-red-600 to-red-800"></div>
              <div className="p-6">
                <h4 className="text-xl font-semibold mb-2 text-gray-900">Mike Rodriguez</h4>
                <p className="text-red-600 font-medium mb-3">Competitive Coach</p>
                <p className="text-gray-600 text-sm">Regional championship coach with 12 years experience. Specializes in advanced skills and competition preparation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h3>
            <p className="text-lg text-gray-600">Ready to start your gymnastics journey? Contact us today!</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h4 className="text-2xl font-semibold mb-6 text-gray-900">Contact Information</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-sm">📍</span>
                  </div>
                  <span className="text-gray-700">123 Gymnastics Way, Las Cruces, NM 88001</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-sm">📞</span>
                  </div>
                  <span className="text-gray-700">(575) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-sm">✉️</span>
                  </div>
                  <span className="text-gray-700">info@crucesgymnastics.com</span>
                </div>
              </div>
              
              <div className="mt-8">
                <h5 className="text-lg font-semibold mb-4 text-gray-900">Hours of Operation</h5>
                <div className="space-y-2 text-gray-600">
                  <p>Monday - Thursday: 4:00 PM - 8:00 PM</p>
                  <p>Friday: 4:00 PM - 7:00 PM</p>
                  <p>Saturday: 9:00 AM - 3:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
              <h4 className="text-2xl font-semibold mb-6 text-gray-900">Send us a Message</h4>
              
              {contactStatus && (
                <div className={`mb-6 p-4 rounded-lg ${contactStatus.success ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                  {contactStatus.message}
                </div>
              )}
              
              <form className="space-y-4" onSubmit={handleContactSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={contactForm.phone}
                    onChange={handleContactChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea 
                    rows={4} 
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  ></textarea>
                </div>
                <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-500">Cruces Gymnastics Center</h2>
            <p className="text-gray-400 mb-6">Building champions, one flip at a time.</p>
            <div className="flex justify-center space-x-6">
              <a href="https://facebook.com/crucesgymnastics" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors">Facebook</a>
              <a href="https://instagram.com/crucesgymnastics" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors">Instagram</a>
              <a href="https://youtube.com/@crucesgymnastics" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors">YouTube</a>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-gray-400">
              <p>&copy; 2024 Cruces Gymnastics Center. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
