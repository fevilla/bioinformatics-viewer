/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [],
  theme: {
    fontFamily: {
      circular: ['circular', 'sans-serif'],
    },
    colors: {
      gray: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
        950: '#0a0a0a',
      },
      blue: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554',
      },
      red: {
        50: '#FEF2F2',
        100: '#FEE2E2',
        200: '#FECACA',
        300: '#FCA5A5',
        400: '#F87171',
        500: '#EF4444',
        600: '#DC2626',
        700: '#B91C1C',
        800: '#991B1B',
        900: '#7F1D1D',
      },
      green: {
        '050': '#E3F9E5',
        100: '#C1EAC5',
        200: '#A3D9A5',
        300: '#7BC47F',
        400: '#57AE5B',
        500: '#18981D',
        600: '#2F8132',
        700: '#207227',
        800: '#0E5814',
        900: '#05400A',
      },
      purple: '#3B0066',
      yellow: '#FDBF07',
      orange: '#FF6B01',
      white: '#FFFFFF',
      black: '#000000',
    },
    extend: {
      fontWeight: {
        book: 450,
        extrablack: 950,
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '4rem',
      },
      boxShadow: {
        inset00: 'inset 0 0 0 0px',
        inset02: 'inset 0 0 0 2px',
        paper: '-4px 4px 0px 0px rgba(0, 0, 0, 1)',
        dropdown: '0 0 40px rgba(69,71,69,.2)',
        off: 'inset 0 0 0 1px',
        in: 'inset 0 0 0 2px',
        on: 'inset 0 0 0 3px',
      },
      borderWidth: {
        3: '3px',
      },
      ringWidth: {
        3: '3px',
      },
    },
  },
};
