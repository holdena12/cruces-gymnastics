/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      'max-sm': {'max': '639px'},
      'max-md': {'max': '767px'},
      'max-lg': {'max': '1023px'},
      'max-xl': {'max': '1279px'},
    },
    extend: {
      // Modern Color Palette
      colors: {
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
          950: 'var(--primary-950)',
        },
        accent: {
          50: 'var(--accent-50)',
          100: 'var(--accent-100)',
          200: 'var(--accent-200)',
          300: 'var(--accent-300)',
          400: 'var(--accent-400)',
          500: 'var(--accent-500)',
          600: 'var(--accent-600)',
          700: 'var(--accent-700)',
          800: 'var(--accent-800)',
          900: 'var(--accent-900)',
        },
        highlight: {
          50: 'var(--highlight-50)',
          100: 'var(--highlight-100)',
          200: 'var(--highlight-200)',
          300: 'var(--highlight-300)',
          400: 'var(--highlight-400)',
          500: 'var(--highlight-500)',
          600: 'var(--highlight-600)',
          700: 'var(--highlight-700)',
          800: 'var(--highlight-800)',
          900: 'var(--highlight-900)',
          950: 'var(--highlight-950)',
        },
        secondary: {
          50: 'var(--secondary-50)',
          100: 'var(--secondary-100)',
          200: 'var(--secondary-200)',
          300: 'var(--secondary-300)',
          400: 'var(--secondary-400)',
          500: 'var(--secondary-500)',
          600: 'var(--secondary-600)',
          700: 'var(--secondary-700)',
          800: 'var(--secondary-800)',
          900: 'var(--secondary-900)',
          950: 'var(--secondary-950)',
        },
        tertiary: {
          50: 'var(--tertiary-50)',
          100: 'var(--tertiary-100)',
          200: 'var(--tertiary-200)',
          300: 'var(--tertiary-300)',
          400: 'var(--tertiary-400)',
          500: 'var(--tertiary-500)',
          600: 'var(--tertiary-600)',
          700: 'var(--tertiary-700)',
          800: 'var(--tertiary-800)',
          900: 'var(--tertiary-900)',
          950: 'var(--tertiary-950)',
        },
        neutral: {
          50: 'var(--neutral-50)',
          100: 'var(--neutral-100)',
          200: 'var(--neutral-200)',
          300: 'var(--neutral-300)',
          400: 'var(--neutral-400)',
          500: 'var(--neutral-500)',
          600: 'var(--neutral-600)',
          700: 'var(--neutral-700)',
          800: 'var(--neutral-800)',
          900: 'var(--neutral-900)',
          950: 'var(--neutral-950)',
        },
      },
      
      // Modern Typography
      fontFamily: {
        sans: ['var(--font-family-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-family-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-family-mono)', 'monospace'],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      // Harmonized Spacing - 8px Grid System
      spacing: {
        '0': 'var(--space-0)',
        'px': 'var(--space-px)',
        '0.5': 'var(--space-0-5)',
        '1': 'var(--space-1)',
        '1.5': 'var(--space-1-5)',
        '2': 'var(--space-2)',
        '2.5': 'var(--space-2-5)',
        '3': 'var(--space-3)',
        '3.5': 'var(--space-3-5)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '7': 'var(--space-7)',
        '8': 'var(--space-8)',
        '9': 'var(--space-9)',
        '10': 'var(--space-10)',
        '11': 'var(--space-11)',
        '12': 'var(--space-12)',
        '14': 'var(--space-14)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
        '24': 'var(--space-24)',
        '28': 'var(--space-28)',
        '32': 'var(--space-32)',
        // Legacy aliases
        'xs': 'var(--space-xs)',
        'sm': 'var(--space-sm)',
        'md': 'var(--space-md)',
        'lg': 'var(--space-lg)',
        'xl': 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
        '3xl': 'var(--space-3xl)',
        '4xl': 'var(--space-4xl)',
      },
      
      // Modern Border Radius
      borderRadius: {
        'xs': 'var(--radius-xs)',
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        'full': 'var(--radius-full)',
      },
      
      // Modern Box Shadows
      boxShadow: {
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'inner': 'var(--shadow-inner)',
      },
      
      // Modern Backdrop Blur
      backdropBlur: {
        'sm': 'var(--blur-sm)',
        'md': 'var(--blur-md)',
        'lg': 'var(--blur-lg)',
        'xl': 'var(--blur-xl)',
      },
      
      // Modern Animations
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.33, 1, 0.68, 1)',
        'fade-in-scale': 'fadeInScale 0.5s cubic-bezier(0.33, 1, 0.68, 1)',
        'slide-in-left': 'slideInLeft 0.7s cubic-bezier(0.33, 1, 0.68, 1)',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      
      // Enhanced 5-Color Gradients
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-highlight': 'var(--gradient-highlight)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-tertiary': 'var(--gradient-tertiary)',
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-glass': 'var(--gradient-glass)',
        'gradient-mesh': 'var(--gradient-mesh)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      
      // Modern Transitions
      transitionTimingFunction: {
        'ease-spring': 'var(--ease-spring)',
        'ease-out-cubic': 'var(--ease-out-cubic)',
        'ease-in-cubic': 'var(--ease-in-cubic)',
        'ease-in-out-cubic': 'var(--ease-in-out-cubic)',
      },
      
      // Modern Grid
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(0, 1fr))',
        'auto-fill': 'repeat(auto-fill, minmax(0, 1fr))',
        'auto-fit-xs': 'repeat(auto-fit, minmax(16rem, 1fr))',
        'auto-fit-sm': 'repeat(auto-fit, minmax(20rem, 1fr))',
        'auto-fit-md': 'repeat(auto-fit, minmax(24rem, 1fr))',
        'auto-fit-lg': 'repeat(auto-fit, minmax(28rem, 1fr))',
      },
      
      // Modern Aspect Ratios
      aspectRatio: {
        'auto': 'auto',
        'square': '1 / 1',
        'video': '16 / 9',
        'portrait': '3 / 4',
        'landscape': '4 / 3',
        'ultrawide': '21 / 9',
      },
      
      // Modern Z-index Scale
      zIndex: {
        '1': '1',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    // Custom plugin for modern utilities
    function({ addUtilities, addComponents, theme }) {
      addUtilities({
        // Glass morphism utilities
        '.glass': {
          background: 'var(--gradient-glass)',
          backdropFilter: 'blur(var(--blur-lg))',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: 'var(--shadow-lg)',
        },
        '.glass-intense': {
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(var(--blur-xl))',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: 'var(--shadow-2xl)',
        },
        
        // Text utilities
        '.text-balance': {
          textWrap: 'balance',
        },
        '.text-pretty': {
          textWrap: 'pretty',
        },
        '.text-gradient': {
          background: 'var(--gradient-primary)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        },
        
        // Focus utilities
        '.focus-ring': {
          outline: 'none',
          transition: 'all 0.3s var(--ease-out-cubic)',
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 3px var(--primary-100)',
            borderColor: 'var(--primary-500)',
          },
          '&:focus-visible': {
            outline: '2px solid var(--primary-500)',
            outlineOffset: '2px',
          },
        },
        
        // Loading utilities
        '.loading': {
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
            animation: 'shimmer 2s infinite',
          },
        },
        
        // Skeleton utilities
        '.skeleton': {
          background: 'linear-gradient(90deg, var(--neutral-200) 25%, var(--neutral-300) 50%, var(--neutral-200) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 'var(--radius-md)',
        },
        
        // Mobile utilities
        '.mobile-stack': {
          '@screen max-md': {
            flexDirection: 'column',
            gap: '1rem',
          },
        },
        '.mobile-full': {
          '@screen max-md': {
            width: '100%',
          },
        },
        '.mobile-center': {
          '@screen max-md': {
            textAlign: 'center',
          },
        },
        '.mobile-hidden': {
          '@screen max-md': {
            display: 'none',
          },
        },
      });
      
      addComponents({
        // Modern button components
        '.btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontFamily: 'var(--font-family-sans)',
          fontWeight: '600',
          textDecoration: 'none',
          border: 'none',
          borderRadius: 'var(--radius-lg)',
          cursor: 'pointer',
          transition: 'all 0.3s var(--ease-out-cubic)',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '44px',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
        },
        '.btn-primary': {
          background: 'var(--gradient-primary)',
          color: 'white',
          boxShadow: 'var(--shadow-md)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 'var(--shadow-xl)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: 'var(--shadow-lg)',
          },
        },
        '.btn-secondary': {
          background: 'var(--neutral-100)',
          color: 'var(--neutral-900)',
          border: '1px solid var(--neutral-200)',
          boxShadow: 'var(--shadow-sm)',
          '&:hover': {
            background: 'var(--neutral-200)',
            transform: 'translateY(-1px)',
            boxShadow: 'var(--shadow-md)',
          },
        },
        '.btn-ghost': {
          background: 'transparent',
          color: 'var(--neutral-700)',
          border: '1px solid transparent',
          '&:hover': {
            background: 'var(--neutral-100)',
            color: 'var(--neutral-900)',
          },
        },
        '.btn-glass': {
          background: 'var(--gradient-glass)',
          backdropFilter: 'blur(var(--blur-md))',
          color: 'var(--neutral-900)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.25)',
            transform: 'translateY(-1px)',
          },
        },
        
        // Modern card components
        '.card': {
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--neutral-200)',
          transition: 'all 0.3s var(--ease-out-cubic)',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 'var(--shadow-2xl)',
            borderColor: 'var(--primary-200)',
          },
        },
        '.card-elevated': {
          background: 'white',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--neutral-100)',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: 'var(--shadow-2xl)',
          },
        },
        '.card-glass': {
          background: 'var(--gradient-glass)',
          backdropFilter: 'blur(var(--blur-lg))',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 'var(--radius-xl)',
        },
        
        // Modern input components
        '.input': {
          width: '100%',
          padding: '0.75rem 1rem',
          border: '2px solid var(--neutral-200)',
          borderRadius: 'var(--radius-lg)',
          fontSize: '1rem',
          fontFamily: 'var(--font-family-sans)',
          background: 'white',
          color: 'var(--neutral-900)',
          transition: 'all 0.3s var(--ease-out-cubic)',
          outline: 'none',
          minHeight: '44px',
          '&:focus': {
            borderColor: 'var(--primary-500)',
            boxShadow: '0 0 0 3px var(--primary-100)',
            transform: 'translateY(-1px)',
          },
          '&::placeholder': {
            color: 'var(--neutral-400)',
          },
        },
      });
    },
  ],
} 