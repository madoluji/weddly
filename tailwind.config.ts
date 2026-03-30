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
        body: ["var(--font-inter)", "var(--font-montserrat)", "sans-serif"],
        headline: ["var(--font-noto-serif)", "serif"],
        label: ["var(--font-inter)", "sans-serif"],
      },
      gridTemplateRows: {
        'dashboard': '200px minmax(500px, 1fr) 100px',
      },
      colors: {
        primary: {
          DEFAULT: '#154734',
          100: '#F4F7F6',
          300: '#AEC2B9',
          400: '#7EA091',
          500: '#2F5F4A',
          600: '#264D3C',
          700: '#1D3B2E',
          800: '#152A21',
          900: '#0D1914',
        },
        secondary: {
          DEFAULT: '#506358',
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
        'on-surface': '#1b1c1a',
        'on-primary': '#ffffff',
        'on-primary-fixed': '#002114',
        'on-secondary-fixed': '#0d1f17',
        'inverse-on-surface': '#f3f0ed',
        'on-error-container': '#93000a',
        'surface-container-lowest': '#ffffff',
        'on-secondary-container': '#56695e',
        'on-secondary-fixed-variant': '#394b41',
        'on-surface-variant': '#414944',
        'on-tertiary-fixed-variant': '#6a3838',
        'surface-variant': '#e5e2df',
        'tertiary-container': '#7c4746',
        tertiary: { DEFAULT: '#613130' },
        'tertiary-fixed-dim': '#fbb5b2',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#ffbab8',
        'inverse-primary': '#9fd2b7',
        'primary-fixed': '#baeed3',
        'surface-bright': '#fcf9f6',
        'on-primary-fixed-variant': '#1e4f3b',
        'outline-variant': '#c0c9c2',
        'secondary-fixed-dim': '#b7cbbf',
        'on-primary-container': '#a4d7bc',
        'surface-container-low': '#f6f3f0',
        'primary-fixed-dim': '#9fd2b7',
        'secondary-fixed': '#d3e8da',
        'surface-container-highest': '#e5e2df',
        'inverse-surface': '#31302f',
        'tertiary-fixed': '#ffdad8',
        'on-tertiary-fixed': '#350e0f',
        'primary-container': '#2f5f4a',
        'error-container': '#ffdad6',
        'on-background': '#1b1c1a',
        'on-secondary': '#ffffff',
        'surface-container': '#f0edea',
        'secondary-container': '#d3e8da',
        outline: '#717973',
        'surface-container-high': '#eae8e5',
        surface: '#fcf9f6',
        'surface-dim': '#dcdad7',
        error: '#ba1a1a',
        'surface-tint': '#386852',
        'on-error': '#ffffff',
        background: '#fcf9f6',
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
