'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavigationProps {
  user?: any;
  onLogout?: () => void;
}

export default function MobileNavigation({ user, onLogout }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.mobile-nav')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isOpen]);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/enroll', label: 'Enroll Now' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden mobile-nav relative z-50">
        {/* Mobile Header */}
        <div className="apple-glass border-b border-white/10 relative z-50">
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">CGC</span>
              </div>
              <span className="text-lg font-semibold text-gradient">
                Cruces Gymnastics
              </span>
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-700 hover:text-neutral-900 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-neutral-900"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`${isOpen ? 'block' : 'hidden'} apple-glass border-b border-white/10 relative z-50`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-neutral-900 bg-neutral-100 border-l-4 border-neutral-900'
                    : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* User Authentication */}
            <div className="border-t border-neutral-200 pt-4 mt-4">
              {user ? (
                <div className="space-y-1">
                  <div className="px-3 py-2">
                    <div className="text-sm text-neutral-500">Signed in as</div>
                    <div className="text-base font-medium text-neutral-900">{user.email}</div>
                  </div>
                  
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                  >
                    Dashboard
                  </Link>
                  
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                    >
                      Admin Panel
                    </Link>
                  )}
                  
                  <button
                    onClick={onLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-neutral-900 text-white hover:bg-neutral-800"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Call-to-Action Bar */}
        <div className="bg-neutral-900 text-white">
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="text-sm font-medium">Ready to start?</div>
            <Link
              href="/enroll"
              className="bg-white text-neutral-900 px-3 py-1 rounded-full text-sm font-medium hover:bg-neutral-100 transition-colors"
            >
              Enroll Today
            </Link>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

/* Mobile-specific styles */
export const mobileStyles = `
  @media (max-width: 1024px) {
    .desktop-nav {
      display: none !important;
    }
  }
  
  @media (min-width: 1025px) {
    .mobile-nav {
      display: none !important;
    }
  }
  
  /* Mobile form improvements */
  @media (max-width: 768px) {
    input[type="text"],
    input[type="email"],
    input[type="tel"],
    input[type="date"],
    input[type="password"],
    select,
    textarea {
      font-size: 16px !important; /* Prevents zoom on iOS */
      min-height: 44px; /* iOS minimum touch target */
    }
    
    button {
      min-height: 44px;
      min-width: 44px;
    }
    
    .form-grid {
      grid-template-columns: 1fr !important;
      gap: 1rem !important;
    }
    
    .mobile-stack {
      flex-direction: column !important;
      gap: 0.75rem !important;
    }
    
    .mobile-full-width {
      width: 100% !important;
    }
    
    .mobile-text-center {
      text-align: center !important;
    }
    
    .mobile-hidden {
      display: none !important;
    }
    
    .mobile-p-4 {
      padding: 1rem !important;
    }
    
    .mobile-px-4 {
      padding-left: 1rem !important;
      padding-right: 1rem !important;
    }
    
    .mobile-text-sm {
      font-size: 0.875rem !important;
    }
    
    .mobile-text-base {
      font-size: 1rem !important;
    }
  }
  
  /* Touch-friendly improvements */
  @media (hover: none) and (pointer: coarse) {
    .hover\\:scale-105 {
      transform: none !important;
    }
    
    .hover\\:shadow-lg {
      box-shadow: none !important;
    }
    
    button:active,
    .button:active {
      transform: scale(0.98);
      transition: transform 0.1s;
    }
  }
`;