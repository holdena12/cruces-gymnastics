'use client';

import { useState } from 'react';

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'buttons' | 'floating' | 'compact';
}

export default function SocialShare({
  url = typeof window !== 'undefined' ? window.location.href : '',
  title = 'Cruces Gymnastics Center - Premier Gymnastics Training in Las Cruces, NM',
  description = 'Join Cruces Gymnastics Center for world-class gymnastics training! Programs for all ages from toddlers to competitive athletes.',
  hashtags = ['gymnastics', 'fitness', 'kids', 'lascruces', 'newmexico'],
  className = '',
  size = 'md',
  variant = 'buttons'
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const hashtagString = hashtags.map(tag => `#${tag}`).join(' ');

  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedDescription}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${hashtags.join(',')}`,
    instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing URLs
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedDescription}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${url}`,
    sms: `sms:?body=${encodedTitle}%20${encodedUrl}`
  };

  const handleShare = (platform: string) => {
    if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
      return;
    }

    if (platform === 'native' && navigator.share) {
      navigator.share({
        title: title,
        text: description,
        url: url,
      }).catch(console.error);
      return;
    }

    const shareUrl = socialLinks[platform as keyof typeof socialLinks];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }

    // Track sharing event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share', {
        method: platform,
        content_type: 'page',
        item_id: url
      });
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const buttonSizeClass = sizeClasses[size];

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-sm text-gray-600 mobile-hidden">Share:</span>
        <div className="flex space-x-1">
          {['facebook', 'twitter', 'whatsapp', 'copy'].map((platform) => (
            <button
              key={platform}
              onClick={() => handleShare(platform)}
              className={`social-share-button ${buttonSizeClass} ${
                platform === 'facebook' ? 'facebook' :
                platform === 'twitter' ? 'twitter' :
                platform === 'whatsapp' ? 'bg-green-500 hover:bg-green-600 text-white' :
                'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
              title={`Share on ${platform}`}
            >
              {getSocialIcon(platform, platform === 'copy' && copied)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-40 mobile-hidden ${className}`}>
        <div className="flex flex-col space-y-2 bg-white rounded-lg shadow-lg p-2">
          {['facebook', 'twitter', 'linkedin', 'copy'].map((platform) => (
            <button
              key={platform}
              onClick={() => handleShare(platform)}
              className={`social-share-button ${buttonSizeClass} ${
                platform === 'facebook' ? 'facebook' :
                platform === 'twitter' ? 'twitter' :
                platform === 'linkedin' ? 'bg-blue-700 hover:bg-blue-800 text-white' :
                'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
              title={`Share on ${platform}`}
            >
              {getSocialIcon(platform, platform === 'copy' && copied)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Default buttons variant
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">Share This Page</h3>
      
      {/* Native Share API for mobile */}
      {typeof window !== 'undefined' && navigator.share && (
        <button
          onClick={() => handleShare('native')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors mobile-block lg:hidden"
        >
          📱 Share
        </button>
      )}

      {/* Social Platform Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => handleShare('facebook')}
          className="facebook social-share-button py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
        >
          {getSocialIcon('facebook')}
          <span className="mobile-hidden">Facebook</span>
        </button>

        <button
          onClick={() => handleShare('twitter')}
          className="twitter social-share-button py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
        >
          {getSocialIcon('twitter')}
          <span className="mobile-hidden">Twitter</span>
        </button>

        <button
          onClick={() => handleShare('whatsapp')}
          className="bg-green-500 hover:bg-green-600 text-white social-share-button py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
        >
          {getSocialIcon('whatsapp')}
          <span className="mobile-hidden">WhatsApp</span>
        </button>

        <button
          onClick={() => handleShare('email')}
          className="bg-gray-600 hover:bg-gray-700 text-white social-share-button py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
        >
          {getSocialIcon('email')}
          <span className="mobile-hidden">Email</span>
        </button>

        <button
          onClick={() => handleShare('linkedin')}
          className="bg-blue-700 hover:bg-blue-800 text-white social-share-button py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
        >
          {getSocialIcon('linkedin')}
          <span className="mobile-hidden">LinkedIn</span>
        </button>

        <button
          onClick={() => handleShare('pinterest')}
          className="bg-red-600 hover:bg-red-700 text-white social-share-button py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
        >
          {getSocialIcon('pinterest')}
          <span className="mobile-hidden">Pinterest</span>
        </button>

        <button
          onClick={() => handleShare('sms')}
          className="bg-green-600 hover:bg-green-700 text-white social-share-button py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
        >
          {getSocialIcon('sms')}
          <span className="mobile-hidden">SMS</span>
        </button>

        <button
          onClick={() => handleShare('copy')}
          className={`${copied ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-700'} text-white social-share-button py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2`}
        >
          {getSocialIcon('copy', copied)}
          <span className="mobile-hidden">{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>

      {/* Share URL Input */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Share URL:
        </label>
        <div className="flex">
          <input
            type="text"
            value={url}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
          />
          <button
            onClick={() => handleShare('copy')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-r-lg transition-colors"
          >
            {copied ? '✓' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}

function getSocialIcon(platform: string, special = false) {
  const iconClass = "w-5 h-5";
  
  switch (platform) {
    case 'facebook':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'twitter':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      );
    case 'whatsapp':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.520-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.085"/>
        </svg>
      );
    case 'linkedin':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      );
    case 'pinterest':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
        </svg>
      );
    case 'email':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'sms':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case 'copy':
      return special ? (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    default:
      return <span>📱</span>;
  }
}