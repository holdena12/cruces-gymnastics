'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import MobileNavigation from './MobileNavigation';
import SocialShare from './SocialShare';
import Newsletter from './Newsletter';
import ContactForm from './ContactForm';

interface User {
  id: number;
  email: string;
  role: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

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

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
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
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>
              <Link
                href="/contact"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/contact') ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                }`}
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
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Premier Gymnastics Training in Las Cruces
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Link
                href="/enroll"
                className="bg-white text-red-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Start Your Journey
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-red-600 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
        
        {/* Social Share */}
        <div className="absolute bottom-4 right-4 mobile-hidden">
          <SocialShare variant="compact" />
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Programs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We offer comprehensive gymnastics programs designed for every age and skill level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Pre-School Gymnastics",
                age: "Ages 2-5",
                description: "Fun, safe introduction to movement and basic gymnastics skills through play and exploration.",
                features: ["Parent participation welcome", "Basic motor skills", "Social development", "Safe equipment"],
                price: "Starting at $35/month",
                color: "bg-blue-50 border-blue-200"
              },
              {
                title: "Recreational Gymnastics",
                age: "Ages 6-18",
                description: "Structured classes focusing on fundamental gymnastics skills and physical fitness.",
                features: ["All apparatus training", "Skill progression", "Strength & flexibility", "Team building"],
                price: "Starting at $50/month",
                color: "bg-green-50 border-green-200"
              },
              {
                title: "Competitive Team",
                age: "Ages 8+",
                description: "Advanced training for dedicated athletes pursuing competitive gymnastics excellence.",
                features: ["Elite coaching", "Competition prep", "Advanced skills", "Team travel"],
                price: "Starting at $75/month",
                color: "bg-purple-50 border-purple-200"
              },
              {
                title: "Ninja Classes",
                age: "Ages 5-16",
                description: "Obstacle course training combining gymnastics, martial arts, and parkour movements.",
                features: ["Obstacle courses", "Strength training", "Agility development", "Problem solving"],
                price: "Starting at $40/month",
                color: "bg-orange-50 border-orange-200"
              },
              {
                title: "Adult Classes",
                age: "Ages 18+",
                description: "Gymnastics and fitness classes designed specifically for adult beginners and returners.",
                features: ["Adult-focused curriculum", "Flexibility training", "Strength building", "Stress relief"],
                price: "Starting at $60/month",
                color: "bg-red-50 border-red-200"
              },
              {
                title: "Birthday Parties",
                age: "All Ages",
                description: "Unforgettable birthday celebrations with gymnastics activities and dedicated party hosts.",
                features: ["2-hour party package", "Dedicated host", "Party room included", "Gymnastics activities"],
                price: "Starting at $200",
                color: "bg-pink-50 border-pink-200"
              }
            ].map((program, index) => (
              <div key={index} className={`${program.color} border rounded-lg p-6 transition-transform hover:scale-105`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{program.title}</h3>
                <p className="text-sm font-medium text-gray-600 mb-3">{program.age}</p>
                <p className="text-gray-700 mb-4">{program.description}</p>
                
                <ul className="space-y-2 mb-4">
                  {program.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="border-t pt-4">
                  <p className="text-lg font-semibold text-gray-900 mb-3">{program.price}</p>
                  <Link
                    href="/enroll"
                    className="block w-full text-center bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Newsletter
            title="Stay Connected with Cruces Gymnastics!"
            description="Get the latest updates on classes, events, special offers, and gymnastics tips delivered to your inbox."
          />
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactForm
            variant="compact"
            title="Ready to Get Started?"
            description="Have questions or want to schedule a tour? We'd love to hear from you!"
          />
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
                character, and champions since 2025.
              </p>
              <div className="flex space-x-4">
                <a href="https://facebook.com/crucesgymnastics" className="social-share-button facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://instagram.com/crucesgymnastics" className="social-share-button instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C8.396 0 7.989.013 7.041.072 6.094.131 5.42.333 4.844.63c-.611.32-1.08.703-1.466 1.089S2.677 2.9 2.357 3.511c-.297.576-.499 1.25-.558 2.197C1.74 6.756 1.727 7.163 1.727 10.783c0 3.621.013 4.028.072 4.976.059.947.261 1.621.558 2.197.32.611.703 1.08 1.089 1.466.386.386.855.769 1.466 1.089.576.297 1.25.499 2.197.558.948.059 1.355.072 4.976.072 3.621 0 4.028-.013 4.976-.072.947-.059 1.621-.261 2.197-.558.611-.32 1.08-.703 1.466-1.089.386-.386.769-.855 1.089-1.466.297-.576.499-1.25.558-2.197.059-.948.072-1.355.072-4.976 0-3.621-.013-4.028-.072-4.976-.059-.947-.261-1.621-.558-2.197-.32-.611-.703-1.08-1.089-1.466-.386-.386-.855-.769-1.466-1.089-.576-.297-1.25-.499-2.197-.558C16.045.013 15.638 0 12.017 0zm0 5.838a4.946 4.946 0 110 9.892 4.946 4.946 0 010-9.892zm0 8.157a3.21 3.21 0 100-6.42 3.21 3.21 0 000 6.42zm6.406-8.845a1.155 1.155 0 11-2.31 0 1.155 1.155 0 012.31 0z"/>
                  </svg>
                </a>
                <a href="https://youtube.com/@crucesgymnastics" className="social-share-button youtube">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
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
                <p>TBD</p>
                <p>(575) 527-1111</p>
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

      {/* Floating Contact & Newsletter */}
      <ContactForm variant="floating" />
      <Newsletter variant="floating" />
      
      {/* Floating Social Share */}
      <SocialShare variant="floating" />
    </div>
  );
}