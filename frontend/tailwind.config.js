/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF3FC',
          100: '#D4E0F6',
          200: '#A9C1ED',
          300: '#7DA2E4',
          400: '#5283DB',
          500: '#2E6BC8',
          600: '#2454B8',
          700: '#1D4498',
          800: '#163378',
          900: '#0F2358',
        },
        ink: {
          900: '#14181F',
          700: '#2C3441',
          500: '#5B6473',
          300: '#8C95A3',
          100: '#C5CAD1',
        },
        surface: {
          0: '#FFFFFF',
          100: '#F5F7FA',
          200: '#ECEEF2',
        },
        success: {
          50: '#E8F7F0',
          100: '#C5EBD8',
          200: '#A3DFC3',
          600: '#1E8E5A',
          700: '#177A4C',
        },
        danger: {
          50: '#FCEBEA',
          100: '#F5CECB',
          200: '#E8AEA8',
          600: '#D5372B',
          700: '#B52D23',
        },
        warning: {
          50: '#FBF1E0',
          100: '#F4DCA8',
          200: '#E8C876',
          600: '#B8790F',
          700: '#9A640C',
        },
        neutral: {
          50: '#F8F9FB',
          100: '#F1F3F5',
          200: '#E3E7ED',
          300: '#D0D5DD',
          400: '#B0B8C4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.15s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'scale-in': 'scale-in 0.15s ease-out',
      },
    },
  },
  plugins: [],
}
