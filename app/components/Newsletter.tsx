'use client';

import { useState } from 'react';

interface NewsletterProps {
  variant?: 'default' | 'compact' | 'inline' | 'floating';
  className?: string;
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  showPrivacy?: boolean;
}

export default function Newsletter({
  variant = 'default',
  className = '',
  title = 'Stay Updated!',
  description = 'Get the latest news about classes, events, and special offers.',
  placeholder = 'Enter your email address',
  buttonText = 'Subscribe',
  showPrivacy = true
}: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const inputId = `${variant}-newsletter-email`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'website',
          timestamp: new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Thank you! You\'ve been subscribed to our newsletter.');
        setEmail('');
        
        // Track newsletter signup
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'newsletter_signup', {
            event_category: 'engagement',
            event_label: 'website'
          });
        }
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`rounded-2xl bg-gradient-primary text-white p-6 shadow-xl ring-1 ring-white/10 ${className}`}>
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex mobile-stack gap-2">
            <label htmlFor={inputId} className="sr-only">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              id={inputId}
              aria-label="Email address"
              className="flex-1 px-3 py-2 rounded-lg bg-white text-neutral-900 border-2 border-white/20 focus:border-white focus:ring-2 focus:ring-white/30 placeholder-neutral-600"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-white text-primary-600 rounded-lg hover:bg-white/95 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              {loading ? '...' : buttonText}
            </button>
          </div>
          {status !== 'idle' && (
            <p className={`text-sm font-semibold rounded-md px-3 py-2 ${
              status === 'success'
                ? 'bg-white/15 text-white'
                : 'bg-white/15 text-white'
            }`}>
              {message}
            </p>
          )}
        </form>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        <span className="text-sm font-medium text-neutral-800 mobile-hidden">{title}</span>
        <form onSubmit={handleSubmit} className="flex mobile-stack">
          <label htmlFor={inputId} className="sr-only">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            id={inputId}
            aria-label="Email address"
            className="px-3 py-1 text-sm border border-neutral-300 rounded-l-md mobile-w-full mobile-rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent text-neutral-900 placeholder-neutral-700"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded-r-md mobile-w-full mobile-rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '...' : '→'}
          </button>
        </form>
        {status !== 'idle' && (
          <span className={`text-xs ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {status === 'success' ? '✓' : '!'}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'floating') {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
      <div className={`fixed bottom-4 right-4 z-50 max-w-sm mobile-max-w-xs mobile-bottom-20 ${className}`}>
        <div className="newsletter-form relative bg-gradient-primary text-white p-4 rounded-xl shadow-xl ring-1 ring-white/10">
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm mb-4 text-white/95">{description}</p>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              id={inputId}
              aria-label="Email address"
              className="newsletter-input w-full px-3 py-2 rounded-md bg-white text-neutral-900 border-2 border-white/20 focus:border-white focus:ring-2 focus:ring-white/30 placeholder-neutral-600"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="newsletter-button w-full py-2 px-4 rounded-md font-medium transition-colors bg-white text-primary-600 hover:bg-white/95"
            >
              {loading ? 'Subscribing...' : buttonText}
            </button>
          </form>

          {status !== 'idle' && (
            <p className={`text-sm mt-2 font-semibold rounded-md px-3 py-2 ${
              status === 'success'
                ? 'bg-white/15 text-white'
                : 'bg-white/15 text-white'
            }`}>
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`rounded-2xl bg-gradient-primary text-white p-8 shadow-xl ring-1 ring-white/10 ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-4 text-white">{title}</h2>
        <p className="text-white text-lg leading-relaxed">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={inputId} className="sr-only">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            id={inputId}
            aria-label="Email address"
            className="w-full px-4 py-3 rounded-lg text-lg bg-white text-neutral-900 border-2 border-white/20 focus:border-white focus:ring-2 focus:ring-white/30 placeholder-neutral-600"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 rounded-lg font-semibold text-lg bg-white text-primary-700 hover:bg-white/95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="loading-spinner mr-2"></div>
              Subscribing...
            </span>
          ) : (
            buttonText
          )}
        </button>

        {status !== 'idle' && (
          <div className={`p-3 rounded-lg ${
            status === 'success' 
              ? 'bg-green-100 border border-green-200 text-green-800' 
              : 'bg-red-100 border border-red-200 text-red-800'
          }`}>
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        {showPrivacy && (
          <p className="text-sm text-white text-center leading-relaxed">
            By subscribing, you agree to receive emails from Cruces Gymnastics Center. 
            You can unsubscribe at any time. 
            <a href="/privacy" className="underline text-white font-medium hover:opacity-90">
              Privacy Policy
            </a>
          </p>
        )}
      </form>

      {/* Benefits list */}
      <div className="mt-8 text-center">
        <p className="text-lg font-semibold text-white mb-6">What you'll get:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center space-y-2 p-4 bg-black/30 rounded-lg backdrop-blur ring-1 ring-white/20">
            <span className="text-2xl drop-shadow">📅</span>
            <span className="text-white font-semibold">Class schedules</span>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 bg-black/30 rounded-lg backdrop-blur ring-1 ring-white/20">
            <span className="text-2xl drop-shadow">🎉</span>
            <span className="text-white font-semibold">Special events</span>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 bg-black/30 rounded-lg backdrop-blur ring-1 ring-white/20">
            <span className="text-2xl drop-shadow">💰</span>
            <span className="text-white font-semibold">Exclusive offers</span>
          </div>
        </div>
      </div>
    </div>
  );
}