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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const validateField = (name: string, value: string) => {
    const errors: {[key: string]: string} = {};
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          errors.name = 'Name must be at least 2 characters';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (value && !/^[\d\s\-\(\)\+]+$/.test(value)) {
          errors.phone = 'Please enter a valid phone number';
        }
        break;
      case 'message':
        if (!value.trim()) {
          errors.message = 'Message is required';
        } else if (value.trim().length < 10) {
          errors.message = 'Message must be at least 10 characters';
        }
        break;
    }
    
    return errors;
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate all fields
    const allErrors: {[key: string]: string} = {};
    Object.keys(contactForm).forEach(key => {
      const fieldErrors = validateField(key, contactForm[key as keyof typeof contactForm]);
      Object.assign(allErrors, fieldErrors);
    });

    if (Object.keys(allErrors).length > 0) {
      setFormErrors(allErrors);
      return;
    }

    setIsSubmittingContact(true);
    setContactStatus(null);
    setFormErrors({});
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setContactStatus({ success: true, message: 'Thank you for your message! We\'ll get back to you within 24 hours.' });
    setContactForm({ name: '', email: '', phone: '', message: '' });
    setIsSubmittingContact(false);
    setTimeout(() => setContactStatus(null), 5000);
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm({
      ...contactForm,
      [name]: value
    });

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }

    // Real-time validation
    if (value.trim()) {
      const fieldErrors = validateField(name, value);
      setFormErrors({
        ...formErrors,
        ...fieldErrors
      });
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen" style={{background: 'var(--gray-50)'}}>
      {/* Header/Navigation */}
      <header className="glass sticky top-0 z-50" style={{background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                Cruces Gymnastics Center
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-300 hover:text-red-400 transition-all duration-300 font-medium">Home</a>
              <a href="#programs" className="text-gray-300 hover:text-red-400 transition-all duration-300 font-medium">Programs</a>
              <a href="#contact" className="text-gray-300 hover:text-red-400 transition-all duration-300 font-medium">Contact</a>
            </div>
            
            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login" className="text-gray-300 hover:text-red-400 transition-all duration-300 font-medium">
                Login
              </Link>
              <Link href="/register" 
                className="px-6 py-2.5 rounded-xl font-semibold transition-all duration-300" 
                style={{
                  background: 'var(--gray-700)', 
                  color: 'white',
                  boxShadow: 'var(--shadow-md)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--gray-600)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--gray-700)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                Register
              </Link>
              <Link href="/enroll" 
                className="btn-primary px-8 py-2.5 rounded-xl font-semibold text-white transition-all duration-300"
                style={{
                  background: 'var(--gradient-primary)',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                Enroll Now
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-xl transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
                aria-label="Toggle mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div 
              className="px-4 py-6 space-y-4"
              style={{
                background: 'rgba(15, 23, 42, 0.98)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="space-y-4">
                <a 
                  href="#home" 
                  onClick={closeMobileMenu}
                  className="block text-gray-300 hover:text-red-400 transition-all duration-300 font-medium text-lg py-2"
                >
                  Home
                </a>
                <a 
                  href="#programs" 
                  onClick={closeMobileMenu}
                  className="block text-gray-300 hover:text-red-400 transition-all duration-300 font-medium text-lg py-2"
                >
                  Programs
                </a>
                <a 
                  href="#contact" 
                  onClick={closeMobileMenu}
                  className="block text-gray-300 hover:text-red-400 transition-all duration-300 font-medium text-lg py-2"
                >
                  Contact
                </a>
              </div>
              
              <div className="pt-4 border-t border-gray-600 space-y-3">
                <Link 
                  href="/login" 
                  onClick={closeMobileMenu}
                  className="block text-gray-300 hover:text-red-400 transition-all duration-300 font-medium text-lg py-2"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  onClick={closeMobileMenu}
                  className="block w-full text-center py-3 rounded-xl font-semibold transition-all duration-300"
                  style={{
                    background: 'var(--gray-700)', 
                    color: 'white',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  Register
                </Link>
                <Link 
                  href="/enroll" 
                  onClick={closeMobileMenu}
                  className="block w-full text-center py-3 rounded-xl font-semibold text-white transition-all duration-300"
                  style={{
                    background: 'var(--gradient-primary)',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  Enroll Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="py-24 relative overflow-hidden" style={{background: 'var(--gradient-hero)'}}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-fade-in-up">
            <h2 className="text-6xl font-bold mb-8 text-white leading-tight">
              Welcome to <span className="bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">Cruces Gymnastics</span> Center
            </h2>
            <p className="text-xl mb-12 max-w-4xl mx-auto text-gray-200 leading-relaxed">
              Quality gymnastics training for all ages in Las Cruces. 
              We offer recreational and competitive programs for beginners through advanced athletes.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/enroll" 
                className="btn-primary px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
                style={{
                  background: 'white',
                  color: 'var(--primary-600)',
                  boxShadow: 'var(--shadow-xl)'
                }}
              >
                Enroll Today
              </Link>
              <Link href="#contact" 
                className="glass px-12 py-4 rounded-xl font-semibold text-lg text-white transition-all duration-300 hover:bg-white/20"
                style={{
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-24" style={{background: 'var(--gray-50)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-in-up">
            <h3 className="text-5xl font-bold mb-6" style={{color: 'var(--gray-900)'}}>Our Programs</h3>
            <p className="text-xl max-w-3xl mx-auto" style={{color: 'var(--gray-600)'}}>
              From toddlers to competitive athletes, we offer programs designed to meet every gymnast where they are.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Pre-School Gymnastics */}
            <div className="card-modern overflow-hidden group">
              <div className="h-56 relative flex items-center justify-center" style={{background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)'}}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300"></div>
                <div className="text-center text-white z-10">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <p className="text-sm font-medium opacity-90">Add Pre-School Program Photo</p>
                </div>
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-semibold mb-3" style={{color: 'var(--gray-900)'}}>Pre-School Gymnastics</h4>
                <p className="mb-6 leading-relaxed" style={{color: 'var(--gray-600)'}}>Ages 18 months - 5 years. Fun introduction to movement and basic gymnastics skills.</p>
                <p className="text-2xl font-bold" style={{color: 'var(--primary-600)'}}>$80/month</p>
              </div>
            </div>

            {/* Recreational Gymnastics */}
            <div className="card-modern overflow-hidden group">
              <div className="h-56 relative flex items-center justify-center" style={{background: 'linear-gradient(135deg, var(--gray-600) 0%, var(--gray-800) 100())'}}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300"></div>
                <div className="text-center text-white z-10">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-sm font-medium opacity-90">Add Recreational Program Photo</p>
                </div>
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-semibold mb-3" style={{color: 'var(--gray-900)'}}>Recreational Gymnastics</h4>
                <p className="mb-6 leading-relaxed" style={{color: 'var(--gray-600)'}}>Ages 6-12. Learn fundamental skills on all events in a fun environment.</p>
                <p className="text-2xl font-bold" style={{color: 'var(--primary-600)'}}>$95/month</p>
              </div>
            </div>

            {/* Competitive Team */}
            <div className="card-modern overflow-hidden group">
              <div className="h-56 relative flex items-center justify-center" style={{background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100())'}}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300"></div>
                <div className="text-center text-white z-10">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <p className="text-sm font-medium opacity-90">Add Competitive Team Photo</p>
                </div>
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-semibold mb-3" style={{color: 'var(--gray-900)'}}>Competitive Team</h4>
                <p className="mb-6 leading-relaxed" style={{color: 'var(--gray-600)'}}>Ages 7+. Train to compete at local, state, and regional levels.</p>
                <p className="text-2xl font-bold" style={{color: 'var(--primary-600)'}}>$150+/month</p>
              </div>
            </div>

            {/* Ninja Classes */}
            <div className="card-modern overflow-hidden group">
              <div className="h-56 relative flex items-center justify-center" style={{background: 'linear-gradient(135deg, var(--gray-700) 0%, var(--gray-900) 100())'}}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300"></div>
                <div className="text-center text-white z-10">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <p className="text-sm font-medium opacity-90">Add Ninja Classes Photo</p>
                </div>
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-semibold mb-3" style={{color: 'var(--gray-900)'}}>Ninja Classes</h4>
                <p className="mb-6 leading-relaxed" style={{color: 'var(--gray-600)'}}>Ages 4-16. Obstacle courses, agility training, and parkour-style movements.</p>
                <p className="text-2xl font-bold" style={{color: 'var(--primary-600)'}}>$85/month</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24" style={{background: 'var(--gray-50)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h3 className="text-5xl font-bold mb-6" style={{color: 'var(--gray-900)'}}>Get In Touch</h3>
            <p className="text-xl" style={{color: 'var(--gray-600)'}}>Have questions about our programs? We're here to help.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h4 className="text-3xl font-semibold mb-8" style={{color: 'var(--gray-900)'}}>Contact Information</h4>
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-6" style={{background: 'var(--primary-600)'}}>
                    <span className="text-white text-lg">📍</span>
                  </div>
                  <span className="text-lg" style={{color: 'var(--gray-700)'}}>123 Gymnastics Way, Las Cruces, NM 88001</span>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-6" style={{background: 'var(--primary-600)'}}>
                    <span className="text-white text-lg">📞</span>
                  </div>
                  <span className="text-lg" style={{color: 'var(--gray-700)'}}>{'(575) 123-4567'}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-6" style={{background: 'var(--primary-600)'}}>
                    <span className="text-white text-lg">✉️</span>
                  </div>
                  <span className="text-lg" style={{color: 'var(--gray-700)'}}>info@crucesgymnastics.com</span>
                </div>
              </div>
              
              <div className="mt-12">
                <h5 className="text-xl font-semibold mb-6" style={{color: 'var(--gray-900)'}}>Hours of Operation</h5>
                <div className="space-y-3 text-lg" style={{color: 'var(--gray-600)'}}>
                  <p>Monday - Thursday: 4:00 PM - 8:00 PM</p>
                  <p>Friday: 4:00 PM - 7:00 PM</p>
                  <p>Saturday: 9:00 AM - 3:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
            
            <div className="card-modern p-10">
              <h4 className="text-3xl font-semibold mb-8" style={{color: 'var(--gray-900)'}}>Send us a Message</h4>
              
              {contactStatus && (
                <div 
                  className={`mb-8 p-6 rounded-xl ${contactStatus.success ? 'border' : 'border'}`}
                  style={{
                    background: contactStatus.success ? 'var(--accent-50)' : 'var(--primary-50)',
                    color: contactStatus.success ? 'var(--accent-800)' : 'var(--primary-800)',
                    borderColor: contactStatus.success ? 'var(--accent-200)' : 'var(--primary-200)'
                  }}
                >
                  {contactStatus.message}
                </div>
              )}
              
              <form className="space-y-6" onSubmit={handleContactSubmit}>
                <div>
                  <label className="block text-lg font-semibold mb-3" style={{color: 'var(--gray-700)'}}>Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    required
                    className={`w-full px-6 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                      formErrors.name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-500'
                    }`}
                    style={{
                      borderColor: formErrors.name ? 'var(--primary-500)' : 'var(--gray-300)',
                      fontSize: '1.1rem'
                    }}
                    placeholder="Enter your full name"
                  />
                  {formErrors.name && (
                    <p className="mt-2 text-sm" style={{color: 'var(--primary-600)'}}>
                      {formErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-lg font-semibold mb-3" style={{color: 'var(--gray-700)'}}>Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required
                    className={`w-full px-6 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                      formErrors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-500'
                    }`}
                    style={{
                      borderColor: formErrors.email ? 'var(--primary-500)' : 'var(--gray-300)',
                      fontSize: '1.1rem'
                    }}
                    placeholder="Enter your email address"
                  />
                  {formErrors.email && (
                    <p className="mt-2 text-sm" style={{color: 'var(--primary-600)'}}>
                      {formErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-lg font-semibold mb-3" style={{color: 'var(--gray-700)'}}>Phone <span className="text-sm font-normal">(optional)</span></label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={contactForm.phone}
                    onChange={handleContactChange}
                    className={`w-full px-6 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                      formErrors.phone ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-500'
                    }`}
                    style={{
                      borderColor: formErrors.phone ? 'var(--primary-500)' : 'var(--gray-300)',
                      fontSize: '1.1rem'
                    }}
                    placeholder="(575) 123-4567"
                  />
                  {formErrors.phone && (
                    <p className="mt-2 text-sm" style={{color: 'var(--primary-600)'}}>
                      {formErrors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-lg font-semibold mb-3" style={{color: 'var(--gray-700)'}}>Message</label>
                  <textarea 
                    rows={5} 
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    required
                    className={`w-full px-6 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 resize-none ${
                      formErrors.message ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-500'
                    }`}
                    style={{
                      borderColor: formErrors.message ? 'var(--primary-500)' : 'var(--gray-300)',
                      fontSize: '1.1rem'
                    }}
                    placeholder="Tell us about your gymnastics goals or ask any questions..."
                  ></textarea>
                  {formErrors.message && (
                    <p className="mt-2 text-sm" style={{color: 'var(--primary-600)'}}>
                      {formErrors.message}
                    </p>
                  )}
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmittingContact}
                  className="btn-primary w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: isSubmittingContact ? 'var(--gray-400)' : 'var(--gradient-primary)',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  {isSubmittingContact ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Message...
                    </div>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16" style={{background: 'var(--gray-900)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
              Cruces Gymnastics Center
            </h2>
            <p className="text-xl mb-8" style={{color: 'var(--gray-400)'}}>Quality gymnastics training in Las Cruces.</p>
            <div className="flex justify-center space-x-8 mb-8">
              <a href="https://facebook.com/crucesgymnastics" target="_blank" rel="noopener noreferrer" 
                className="text-xl transition-all duration-300" 
                style={{color: 'var(--gray-400)'}}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-500)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gray-400)'}
              >
                Facebook
              </a>
              <a href="https://instagram.com/crucesgymnastics" target="_blank" rel="noopener noreferrer" 
                className="text-xl transition-all duration-300" 
                style={{color: 'var(--gray-400)'}}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-500)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gray-400)'}
              >
                Instagram
              </a>
              <a href="https://youtube.com/@crucesgymnastics" target="_blank" rel="noopener noreferrer" 
                className="text-xl transition-all duration-300" 
                style={{color: 'var(--gray-400)'}}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-500)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gray-400)'}
              >
                YouTube
              </a>
            </div>
            <div className="pt-8 border-t" style={{borderColor: 'var(--gray-800)', color: 'var(--gray-400)'}}>
              <p>&copy; 2025 Cruces Gymnastics Center. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
