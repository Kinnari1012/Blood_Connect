/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C62828',
          dark: '#8E0000',
          light: '#EF5350',
        },
        emergency: '#D32F2F',
        success: {
          DEFAULT: '#2E7D32',
          light: '#E8F5E9',
        },
        warning: {
          DEFAULT: '#F9A825',
          light: '#FFF8E1',
        },
        background: '#F8F9FA',
        card: '#FFFFFF',
        'text-primary': '#212121',
        'text-secondary': '#616161',
        border: '#E0E0E0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        gujarati: ['Noto Sans Gujarati', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.10)',
        'modal': '0 20px 60px rgba(0,0,0,0.15)',
      },
      zIndex: {
        '1': '1',
        '10': '10',
        '100': '100',
        '500': '500',
        '900': '900',
        '1000': '1000',
        '1100': '1100',
      },
    },
  },
  plugins: [],
}
