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
    <div className="min-h-screen bg-gradient-mesh">
      {/* Mobile Navigation */}
      <MobileNavigation user={user} onLogout={handleLogout} />

      {/* Desktop Navigation - Apple Inspired */}
      <nav className="apple-glass sticky top-0 z-50 desktop-nav hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">CGC</span>
              </div>
              <span className="text-xl font-bold text-gradient">
                Cruces Gymnastics Center
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/') ? 'text-primary-600 bg-primary-50' : 'text-neutral-700 hover:text-primary-600 hover:bg-neutral-100'
                }`}
              >
                Home
              </Link>
              <Link
                href="/enroll"
                className="text-neutral-700 hover:text-primary-600 transition-colors font-medium"
              >
                Enroll
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-neutral-600">Hello, {user.email}</span>
                  <Link
                    href="/dashboard"
                    className="apple-button"
                  >
                    Dashboard
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="btn btn-secondary"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="btn btn-ghost"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="btn btn-ghost"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/enroll"
                    className="apple-button"
                  >
                    Enroll Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Netflix Inspired */}
      <section className="hero-modern py-24 lg:py-32 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <h1 className="spotify-heading text-5xl md:text-7xl mb-6 animate-fade-in-up">
            Home of the most successful mens gymnastics program in southern NM
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-balance text-white animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            Building champions through excellence, dedication, and world-class training
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <Link
              href="/enroll"
              className="apple-button btn-lg magnetic-button"
            >
              <span>Start Your Journey</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 floating-element opacity-20">
          <div className="w-20 h-20 bg-accent-400 rounded-full blur-xl"></div>
        </div>
        <div className="absolute bottom-20 right-10 floating-element opacity-20" style={{animationDelay: '2s'}}>
          <div className="w-32 h-32 bg-highlight-400 rounded-full blur-xl"></div>
        </div>
        
        {/* Social Share */}
        <div className="absolute bottom-6 right-6 mobile-hidden z-20">
          <SocialShare variant="compact" />
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Our Programs
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              We offer comprehensive gymnastics programs designed for every age and skill level, 
              building strength, confidence, and athletic excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[

              {
                title: "Recreational Gymnastics",
                age: "Ages 6-18",
                description: "Structured classes focusing on fundamental gymnastics skills and physical fitness.",
                features: ["All apparatus training", "Skill progression", "Strength & flexibility", "Team building"],
                price: "Starting at $50/month",
                icon: "🤸‍♀️",
                gradient: "bg-accent-50 border-accent-200"
              },
              {
                title: "Competitive Team",
                age: "Ages 8+",
                description: "Advanced training for dedicated athletes pursuing competitive gymnastics excellence.",
                features: ["Elite coaching", "Competition prep", "Advanced skills", "Team travel"],
                price: "Starting at $75/month",
                icon: "🏆",
                gradient: "bg-primary-50 border-primary-200"
              },
              {
                title: "Ninja Classes",
                age: "Ages 5-16",
                description: "Obstacle course training combining gymnastics, martial arts, and parkour movements.",
                features: ["Obstacle courses", "Strength training", "Agility development", "Problem solving"],
                price: "Starting at $40/month",
                icon: "🥷",
                gradient: "bg-highlight-50 border-highlight-200"
              },
              {
                title: "Birthday Parties",
                age: "All Ages",
                description: "Unforgettable birthday celebrations with gymnastics activities and dedicated party hosts.",
                features: ["2-hour party package", "Dedicated host", "Party room included", "Gymnastics activities"],
                price: "Starting at $200",
                icon: "🎉",
                gradient: "bg-neutral-50 border-neutral-200"
              }
            ].map((program, index) => (
              <div key={index} className={`apple-card p-8 ${program.gradient} border-2 gpu-accelerated animate-fade-in-scale`} style={{animationDelay: `${index * 0.1}s`}}>
                <div className="text-4xl mb-4">{program.icon}</div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">{program.title}</h3>
                <div className="badge badge-primary mb-4">{program.age}</div>
                <p className="text-neutral-700 mb-6 leading-relaxed">{program.description}</p>
                
                <ul className="space-y-3 mb-6">
                  {program.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-neutral-600">
                      <div className="w-2 h-2 bg-accent-500 rounded-full mr-3 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="border-t border-neutral-200 pt-6">
                  <p className="text-lg font-bold text-neutral-900 mb-4">{program.price}</p>
                  <Link
                    href="/enroll"
                    className="apple-button w-full justify-center"
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
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="max-w-4xl mx-auto px-6">
          <Newsletter
            title="Stay Connected with Cruces Gymnastics!"
            description="Get the latest updates on classes, events, special offers, and gymnastics tips delivered to your inbox."
          />
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactForm
            variant="compact"
            title="Ready to Get Started?"
            description="Have questions or want to schedule a tour? We'd love to hear from you!"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">CGC</span>
                </div>
                <span className="text-xl font-bold">Cruces Gymnastics Center</span>
              </div>
              <p className="text-neutral-300 mb-4">
                2025 Premier gymnastics training in Las Cruces, New Mexico. Building confidence,
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
                <li><Link href="/" className="text-neutral-300 hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/enroll" className="text-neutral-300 hover:text-white transition-colors">Enroll Now</Link></li>
                <li><Link href="/privacy" className="text-neutral-300 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-neutral-300 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>


          </div>

          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
            <p>&copy; 2025 Cruces Gymnastics Center. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Contact */}
      <ContactForm variant="floating" />
      
      {/* Floating Social Share */}
      <SocialShare variant="floating" />
    </div>
  );
}