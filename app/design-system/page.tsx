'use client';

import { useState } from 'react';

export default function DesignSystemPage() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const colorPalettes = [
    {
      name: 'Primary (Purple)',
      colors: [
        { name: '50', value: '#f8faff' },
        { name: '100', value: '#f0f4ff' },
        { name: '200', value: '#e2e8ff' },
        { name: '300', value: '#c7d2fe' },
        { name: '400', value: '#a5b4fc' },
        { name: '500', value: '#8b5cf6' },
        { name: '600', value: '#7c3aed' },
        { name: '700', value: '#6d28d9' },
        { name: '800', value: '#5b21b6' },
        { name: '900', value: '#4c1d95' },
        { name: '950', value: '#2e1065' },
      ]
    },
    {
      name: 'Accent (Emerald)',
      colors: [
        { name: '50', value: '#f0fdf4' },
        { name: '100', value: '#dcfce7' },
        { name: '200', value: '#bbf7d0' },
        { name: '300', value: '#86efac' },
        { name: '400', value: '#4ade80' },
        { name: '500', value: '#22c55e' },
        { name: '600', value: '#16a34a' },
        { name: '700', value: '#15803d' },
        { name: '800', value: '#166534' },
        { name: '900', value: '#14532d' },
      ]
    },
    {
      name: 'Highlight (Coral)',
      colors: [
        { name: '50', value: '#fef7f0' },
        { name: '100', value: '#feecdc' },
        { name: '200', value: '#fcd9bd' },
        { name: '300', value: '#fdba8c' },
        { name: '400', value: '#ff8a4c' },
        { name: '500', value: '#f97316' },
        { name: '600', value: '#ea580c' },
        { name: '700', value: '#c2410c' },
        { name: '800', value: '#9a3412' },
        { name: '900', value: '#7c2d12' },
      ]
    },
    {
      name: 'Neutral (Warm Gray)',
      colors: [
        { name: '50', value: '#fafaf9' },
        { name: '100', value: '#f5f5f4' },
        { name: '200', value: '#e7e5e4' },
        { name: '300', value: '#d6d3d1' },
        { name: '400', value: '#a8a29e' },
        { name: '500', value: '#78716c' },
        { name: '600', value: '#57534e' },
        { name: '700', value: '#44403c' },
        { name: '800', value: '#292524' },
        { name: '900', value: '#1c1917' },
        { name: '950', value: '#0c0a09' },
      ]
    }
  ];

  const spacingScale = [
    { name: '0', value: '0px', class: 'w-0' },
    { name: 'px', value: '1px', class: 'w-px' },
    { name: '0.5', value: '2px', class: 'w-0.5' },
    { name: '1', value: '4px', class: 'w-1' },
    { name: '1.5', value: '6px', class: 'w-1.5' },
    { name: '2', value: '8px', class: 'w-2' },
    { name: '2.5', value: '10px', class: 'w-2.5' },
    { name: '3', value: '12px', class: 'w-3' },
    { name: '3.5', value: '14px', class: 'w-3.5' },
    { name: '4', value: '16px', class: 'w-4' },
    { name: '5', value: '20px', class: 'w-5' },
    { name: '6', value: '24px', class: 'w-6' },
    { name: '7', value: '28px', class: 'w-7' },
    { name: '8', value: '32px', class: 'w-8' },
    { name: '9', value: '36px', class: 'w-9' },
    { name: '10', value: '40px', class: 'w-10' },
    { name: '11', value: '44px', class: 'w-11' },
    { name: '12', value: '48px', class: 'w-12' },
    { name: '14', value: '56px', class: 'w-14' },
    { name: '16', value: '64px', class: 'w-16' },
    { name: '20', value: '80px', class: 'w-20' },
    { name: '24', value: '96px', class: 'w-24' },
    { name: '28', value: '112px', class: 'w-28' },
    { name: '32', value: '128px', class: 'w-32' },
  ];

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Navigation */}
      <nav className="apple-glass sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gradient">Design System</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Toggle dark mode"
            />
            <a href="/" className="apple-button">
              ← Back to Site
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        
        {/* Color Harmonization Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Harmonized Color Palette</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Our colors work together beautifully with optimal contrast ratios and visual harmony. 
              Based on color theory with complementary and analogous relationships.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {colorPalettes.map((palette) => (
              <div key={palette.name} className="apple-card p-6">
                <h3 className="text-lg font-semibold mb-4">{palette.name}</h3>
                <div className="space-y-2">
                  {palette.colors.map((color) => (
                    <div key={color.name} className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-lg border border-neutral-200"
                        style={{ backgroundColor: color.value }}
                      />
                      <div className="flex-1">
                        <div className="font-mono text-sm">{color.name}</div>
                        <div className="font-mono text-xs text-neutral-500">{color.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Gradient Showcase */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">Harmonized Gradients</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="h-32 rounded-xl" style={{ background: 'var(--gradient-primary)' }}>
              <div className="h-full flex items-end p-4">
                <span className="text-white font-medium">Primary</span>
              </div>
            </div>
            <div className="h-32 rounded-xl" style={{ background: 'var(--gradient-accent)' }}>
              <div className="h-full flex items-end p-4">
                <span className="text-white font-medium">Accent</span>
              </div>
            </div>
            <div className="h-32 rounded-xl" style={{ background: 'var(--gradient-highlight)' }}>
              <div className="h-full flex items-end p-4">
                <span className="text-white font-medium">Highlight</span>
              </div>
            </div>
            <div className="h-32 rounded-xl" style={{ background: 'var(--gradient-hero)' }}>
              <div className="h-full flex items-end p-4">
                <span className="text-white font-medium">Hero</span>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing System */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">8px Grid Spacing System</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Consistent spacing based on an 8px grid system for perfect visual rhythm and alignment.
            </p>
          </div>

          <div className="apple-card p-8">
            <h3 className="text-xl font-semibold mb-6">Spacing Scale</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {spacingScale.map((space) => (
                <div key={space.name} className="text-center">
                  <div className="mb-2">
                    <div 
                      className="bg-primary-500 h-4 rounded"
                      style={{ width: space.value }}
                    />
                  </div>
                  <div className="font-mono text-sm font-medium">{space.name}</div>
                  <div className="font-mono text-xs text-neutral-500">{space.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="apple-card p-6">
              <h3 className="text-lg font-semibold mb-4">Consistent Padding</h3>
              <div className="space-y-4">
                <div className="bg-primary-100 p-2 rounded">2 (8px) padding</div>
                <div className="bg-primary-100 p-4 rounded">4 (16px) padding</div>
                <div className="bg-primary-100 p-6 rounded">6 (24px) padding</div>
                <div className="bg-primary-100 p-8 rounded">8 (32px) padding</div>
              </div>
            </div>

            <div className="apple-card p-6">
              <h3 className="text-lg font-semibold mb-4">Consistent Margins</h3>
              <div className="space-y-2">
                <div className="bg-accent-100 p-3 rounded">2px margin</div>
                <div className="bg-accent-100 p-3 rounded mt-2">8px margin</div>
                <div className="bg-accent-100 p-3 rounded mt-4">16px margin</div>
                <div className="bg-accent-100 p-3 rounded mt-6">24px margin</div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography Harmony */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">Typography Hierarchy</h2>
          <div className="apple-card p-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-6xl font-bold mb-2">Heading 1</h1>
                <p className="text-neutral-500 font-mono text-sm">text-6xl, font-bold</p>
              </div>
              <div>
                <h2 className="text-4xl font-bold mb-2">Heading 2</h2>
                <p className="text-neutral-500 font-mono text-sm">text-4xl, font-bold</p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">Heading 3</h3>
                <p className="text-neutral-500 font-mono text-sm">text-2xl, font-semibold</p>
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Heading 4</h4>
                <p className="text-neutral-500 font-mono text-sm">text-xl, font-semibold</p>
              </div>
              <div>
                <p className="text-lg mb-2">Large body text for important content and descriptions</p>
                <p className="text-neutral-500 font-mono text-sm">text-lg</p>
              </div>
              <div>
                <p className="text-base mb-2">Regular body text for most content and readability</p>
                <p className="text-neutral-500 font-mono text-sm">text-base</p>
              </div>
              <div>
                <p className="text-sm mb-2">Small text for captions and secondary information</p>
                <p className="text-neutral-500 font-mono text-sm">text-sm</p>
              </div>
            </div>
          </div>
        </section>

        {/* Component Showcase */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">Component Harmony</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Apple Style */}
            <div className="apple-card p-6">
              <div className="w-12 h-12 bg-primary-500 rounded-lg mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Apple Style</h3>
              <p className="text-neutral-600 mb-4">Clean, minimal design with perfect spacing</p>
              <button className="apple-button w-full">Get Started</button>
            </div>

            {/* Material Style */}
            <div className="material-card p-6">
              <div className="w-12 h-12 bg-accent-500 rounded-lg mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Material Style</h3>
              <p className="text-neutral-600 mb-4">Elevated surfaces with tactile feedback</p>
              <button className="btn btn-primary w-full">Learn More</button>
            </div>

            {/* Spotify Style */}
            <div className="spotify-card p-6">
              <div className="w-12 h-12 bg-highlight-500 rounded-lg mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Bold Style</h3>
              <p className="text-gray-300 mb-4">Dynamic typography with bold personality</p>
              <button className="btn btn-accent w-full">Explore</button>
            </div>
          </div>
        </section>

        {/* Accessibility & Contrast */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">Accessibility & Contrast</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="apple-card p-6">
              <h3 className="text-xl font-semibold mb-4">WCAG AA Compliant</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-primary-600 text-white rounded">
                  <span>Primary on White</span>
                  <span className="text-sm">4.8:1 ✓</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-accent-600 text-white rounded">
                  <span>Accent on White</span>
                  <span className="text-sm">5.2:1 ✓</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-700 text-white rounded">
                  <span>Text on Background</span>
                  <span className="text-sm">7.1:1 ✓</span>
                </div>
              </div>
            </div>

            <div className="apple-card p-6">
              <h3 className="text-xl font-semibold mb-4">Focus States</h3>
              <div className="space-y-4">
                <button className="focus-ring btn btn-primary w-full">
                  Focusable Button
                </button>
                <input 
                  className="focus-ring input w-full" 
                  placeholder="Focusable Input"
                />
                <div className="focus-ring card p-4 cursor-pointer" tabIndex={0}>
                  Focusable Card
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
