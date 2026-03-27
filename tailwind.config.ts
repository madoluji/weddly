import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}', // Added from Tremor guide
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-playfair-display)", "serif"],
        body: ["var(--font-montserrat)", "sans-serif"],
      },
      gridTemplateRows: {
        'dashboard': '200px minmax(500px, 1fr) 100px',
      },
      colors: {
     primary: {
  100: '#F4F7F6',
  300: '#AEC2B9',
  400: '#7EA091',
  500: '#2F5F4A', // Your new base color
  600: '#264D3C',
  700: '#1D3B2E',
  800: '#152A21',
  900: '#0D1914',
},
secondary: {
  // Kept these similar but slightly desaturated to pair better with green
  400: '#E8B8BF', 
  500: '#C9919B',
  600: '#A96D77',
},
        success: {
          400: '#DCEADF',
          500: '#2F5F4A',
          600: '#1E4634',
        },
        danger: {
          400: '#F8DEE2',
          500: '#E38A97',
          600: '#C55E6D',
        },
      },
      keyframes: {
        shimmer: {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
        pulse: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.5',
          },
        },
        hide: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        slideDownAndFade: {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeftAndFade: {
          from: { opacity: '0', transform: 'translateX(6px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideUpAndFade: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideRightAndFade: {
          from: { opacity: '0', transform: 'translateX(-6px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        accordionOpen: {
          from: { height: '0px' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        accordionClose: {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0px' },
        },
        dialogOverlayShow: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        dialogContentShow: {
          from: { opacity: '0', transform: 'translate(-50%, -45%) scale(0.95)' },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
        drawerSlideLeftAndFade: {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        drawerSlideRightAndFade: {
          from: { opacity: '1', transform: 'translateX(0)' },
          to: { opacity: '0', transform: 'translateX(100%)' },
        },
      },
      animation: {
        hide: 'hide 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideDownAndFade: 'slideDownAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideLeftAndFade: 'slideLeftAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideUpAndFade: 'slideUpAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideRightAndFade: 'slideRightAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        accordionOpen: 'accordionOpen 150ms cubic-bezier(0.87, 0, 0.13, 1)',
        accordionClose: 'accordionClose 150ms cubic-bezier(0.87, 0, 0.13, 1)',
        dialogOverlayShow: 'dialogOverlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        dialogContentShow: 'dialogContentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        drawerSlideLeftAndFade: 'drawerSlideLeftAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        drawerSlideRightAndFade: 'drawerSlideRightAndFade 150ms ease-in',
      },
    },
  },
  plugins: [forms], // Added Tremor's recommended plugin
};

export default config;
