import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Enhanced SEO metadata
export const metadata: Metadata = {
  title: {
    default: "Cruces Gymnastics Center - Premier Gymnastics Training in Las Cruces, NM",
    template: "%s | Cruces Gymnastics Center"
  },
  description: "Cruces Gymnastics Center offers premier gymnastics training in Las Cruces, New Mexico. We provide programs for all ages from toddlers to competitive athletes. Enroll today!",
  keywords: [
    "gymnastics", "Las Cruces", "New Mexico", "gymnastics classes", 
    "competitive gymnastics", "recreational gymnastics", "toddler gymnastics", 
    "ninja classes", "boys gymnastics", "girls gymnastics",
    "gymnastics training", "gymnastics center", "youth sports", "tumbling",
    "acrobatics", "children's activities", "fitness for kids"
  ],
  authors: [{ name: "Cruces Gymnastics Center" }],
  creator: "Cruces Gymnastics Center",
  publisher: "Cruces Gymnastics Center",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://crucesgymnastics.com'),
  
  // Open Graph / Facebook
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Cruces Gymnastics Center",
    title: "Cruces Gymnastics Center - Premier Gymnastics Training in Las Cruces, NM",
    description: "Premier gymnastics training for all ages. From toddlers to competitive athletes. Enroll today!",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Cruces Gymnastics Center",
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Cruces Gymnastics Center - Premier Gymnastics Training",
    description: "Premier gymnastics training for all ages in Las Cruces, NM. Enroll today!",
    images: ["/images/twitter-image.jpg"],
    creator: "@crucesgymnastics",
  },
  
  // Additional metadata
  category: "Sports & Recreation",
  classification: "Gymnastics Center",
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
    other: {
      'facebook-domain-verification': process.env.FACEBOOK_DOMAIN_VERIFICATION || '',
    },
  },
};

// Viewport configuration for mobile optimization
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#dc2626" },
    { media: "(prefers-color-scheme: dark)", color: "#dc2626" },
  ],
};

// Structured data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "name": "Cruces Gymnastics Center",
  "alternateName": "Cruces Gymnastics",
  "description": "Premier gymnastics training center in Las Cruces, New Mexico offering programs for all ages from toddlers to competitive athletes.",
  "url": process.env.NEXT_PUBLIC_SITE_URL || "https://crucesgymnastics.com",
  "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "https://crucesgymnastics.com"}/images/logo.png`,
  "image": `${process.env.NEXT_PUBLIC_SITE_URL || "https://crucesgymnastics.com"}/images/gym-photo.jpg`,
  "telephone": "+1-575-XXX-XXXX",
  "email": "info@crucesgymnastics.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "TBD",
    "addressLocality": "TBD",
    "addressRegion": "NM",
    "postalCode": "TBD",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "32.3199",
    "longitude": "-106.7637"
  },
  "openingHours": [
    "Mo-Fr 15:00-20:00",
    "Sa 09:00-17:00",
    "Su 10:00-16:00"
  ],
  "sameAs": [
    "https://www.facebook.com/crucesgymnastics",
    "https://www.instagram.com/crucesgymnastics",
    "https://www.youtube.com/@crucesgymnastics"
  ],
  "sport": "Gymnastics",
  "priceRange": "$40-$75",
  "paymentAccepted": "Credit Card, Debit Card, Online Payment",
  "currenciesAccepted": "USD",
  "areaServed": {
    "@type": "City",
    "name": "Las Cruces",
    "sameAs": "https://en.wikipedia.org/wiki/Las_Cruces,_New_Mexico"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127",
    "bestRating": "5",
    "worstRating": "1"
  },
  "offers": {
    "@type": "Offer",
    "description": "Gymnastics classes for all ages and skill levels",
    "category": "Sports Training"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        {/* Mobile-specific meta tags */}
        <meta name="format-detection" content="telephone=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cruces Gymnastics" />
        
        {/* Performance hints */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}
      >
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50"
        >
          Skip to main content
        </a>
        
        {/* Main content */}
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_title: document.title,
                  page_location: window.location.href,
                });
              `}
            </Script>
          </>
        )}
        
        {/* Facebook Pixel */}
        {process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID && (
          <Script id="facebook-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
      </body>
    </html>
  );
}
