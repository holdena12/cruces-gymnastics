'use client';

import { useState, useEffect } from 'react';

interface ReferralProgramProps {
  variant?: 'default' | 'compact' | 'banner';
  className?: string;
  userEmail?: string;
}

export default function ReferralProgram({
  variant = 'default',
  className = '',
  userEmail
}: ReferralProgramProps) {
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    successfulReferrals: 0,
    rewardsEarned: 0
  });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userEmail) {
      generateReferralCode();
      loadReferralStats();
    }
  }, [userEmail]);

  const generateReferralCode = () => {
    // Generate a simple referral code based on email
    const code = userEmail 
      ? `CRUCES${userEmail.slice(0, 3).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      : 'CRUCESGYMNASTICS';
    setReferralCode(code);
  };

  const loadReferralStats = async () => {
    if (!userEmail) return;

    try {
      const response = await fetch(`/api/referrals?email=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setReferralStats(data.stats || referralStats);
      }
    } catch (error) {
      console.error('Failed to load referral stats:', error);
    }
  };

  const copyReferralLink = () => {
    const referralUrl = `${window.location.origin}/enroll?ref=${referralCode}`;
    navigator.clipboard.writeText(referralUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Track copy event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'referral_link_copied', {
          event_category: 'referral',
          event_label: referralCode
        });
      }
    });
  };

  const shareReferral = (platform: string) => {
    const referralUrl = `${window.location.origin}/enroll?ref=${referralCode}`;
    const message = `Check out Cruces Gymnastics Center! Use my referral link to get started: ${referralUrl}`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}&quote=${encodeURIComponent(message)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
      email: `mailto:?subject=Join Cruces Gymnastics Center&body=${encodeURIComponent(message)}`,
      sms: `sms:?body=${encodeURIComponent(message)}`
    };

    const url = shareUrls[platform as keyof typeof shareUrls];
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }

    // Track share event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'referral_shared', {
        event_category: 'referral',
        event_label: platform,
        value: referralCode
      });
    }
  };

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 rounded-lg ${className}`}>
        <div className="flex items-center justify-between mobile-stack">
          <div>
            <h3 className="font-semibold">🎉 Refer Friends & Earn Rewards!</h3>
            <p className="text-sm text-green-100">Get $25 off when friends join using your link</p>
          </div>
          <button
            onClick={copyReferralLink}
            className="bg-white text-green-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors mobile-w-full mobile-mt-3"
          >
            {copied ? 'Copied!' : 'Get Link'}
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    if (!userEmail) {
      return (
        <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
          <h3 className="font-semibold text-blue-900 mb-2">Referral Program</h3>
          <p className="text-sm text-blue-700 mb-3">
            Sign in to access your personal referral link and start earning rewards!
          </p>
          <a
            href="/login"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      );
    }

    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <h3 className="font-semibold text-green-900 mb-2">Your Referral Link</h3>
        <div className="flex mobile-stack mobile-space-y-2">
          <input
            type="text"
            value={`${window.location.origin}/enroll?ref=${referralCode}`}
            readOnly
            className="flex-1 px-3 py-2 text-sm border border-green-300 rounded-l-md mobile-w-full mobile-rounded-md bg-white"
          />
          <button
            onClick={copyReferralLink}
            className="px-4 py-2 bg-green-600 text-white rounded-r-md mobile-w-full mobile-rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-green-700 mt-2">
          You've referred {referralStats.successfulReferrals} students and earned ${referralStats.rewardsEarned}!
        </p>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-white rounded-lg shadow-lg p-8 ${className}`}>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Refer Friends & Get Rewards!</h2>
        <p className="text-lg text-gray-600">
          Share the joy of gymnastics and earn rewards for every friend who joins
        </p>
      </div>

      {!userEmail ? (
        <div className="text-center">
          <p className="text-gray-600 mb-6">Sign in to access your personal referral link and start earning rewards!</p>
          <a
            href="/login"
            className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Sign In to Get Started
          </a>
        </div>
      ) : (
        <div>
          {/* How It Works */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share Your Link</h3>
              <p className="text-sm text-gray-600">Send your unique referral link to friends and family</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">They Join</h3>
              <p className="text-sm text-gray-600">Your friend enrolls using your referral link</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Both Get Rewards</h3>
              <p className="text-sm text-gray-600">You both receive account credits and special offers</p>
            </div>
          </div>

          {/* Rewards */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-3">Referral Rewards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">👥 For You</h4>
                <ul className="text-sm space-y-1">
                  <li>• $25 account credit per successful referral</li>
                  <li>• Bonus rewards for multiple referrals</li>
                  <li>• Exclusive member perks</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🎁 For Your Friend</h4>
                <ul className="text-sm space-y-1">
                  <li>• 50% off first month tuition</li>
                  <li>• Free registration fee waiver</li>
                  <li>• Welcome package included</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Your Referral Link */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Link</h3>
            <div className="flex mobile-stack mobile-space-y-3">
              <input
                type="text"
                value={`${window.location.origin}/enroll?ref=${referralCode}`}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg mobile-w-full mobile-rounded-lg bg-gray-50"
              />
              <button
                onClick={copyReferralLink}
                className="px-6 py-3 bg-blue-600 text-white rounded-r-lg mobile-w-full mobile-rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Your referral code: <span className="font-mono font-semibold">{referralCode}</span>
            </p>
          </div>

          {/* Share Buttons */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Your Link</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button
                onClick={() => shareReferral('facebook')}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>📘</span>
                <span className="mobile-hidden">Facebook</span>
              </button>
              <button
                onClick={() => shareReferral('twitter')}
                className="flex items-center justify-center space-x-2 bg-blue-400 text-white py-3 px-4 rounded-lg hover:bg-blue-500 transition-colors"
              >
                <span>🐦</span>
                <span className="mobile-hidden">Twitter</span>
              </button>
              <button
                onClick={() => shareReferral('whatsapp')}
                className="flex items-center justify-center space-x-2 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
              >
                <span>💬</span>
                <span className="mobile-hidden">WhatsApp</span>
              </button>
              <button
                onClick={() => shareReferral('email')}
                className="flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <span>📧</span>
                <span className="mobile-hidden">Email</span>
              </button>
              <button
                onClick={() => shareReferral('sms')}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                <span>📱</span>
                <span className="mobile-hidden">SMS</span>
              </button>
            </div>
          </div>

          {/* Your Stats */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{referralStats.totalReferrals}</div>
                <div className="text-sm text-gray-600">Total Referrals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{referralStats.successfulReferrals}</div>
                <div className="text-sm text-gray-600">Successful Referrals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">${referralStats.rewardsEarned}</div>
                <div className="text-sm text-gray-600">Rewards Earned</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}