/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Microsoft YaHei', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 
          400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 
          800: '#065f46', 900: '#064e3b', 950: '#022c22',
        }
      },
      animation: {
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'modal': 'modalShow 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-highlight': 'pulseHighlight 2s cubic-bezier(0.4, 0, 0.6, 1) 2',
      },
      keyframes: {
        slideUp: {
          'from': { opacity: 0, transform: 'translateY(15px)' },
          'to': { opacity: 1, transform: 'translateY(0)' },
        },
        modalShow: {
          'from': { opacity: 0, transform: 'scale(0.95)' },
          'to': { opacity: 1, transform: 'scale(1)' },
        },
        pulseHighlight: {
          '0%, 100%': { boxShadow: '0 0 0 0px rgba(16, 185, 129, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)' },
        }
      }
    },
  },
  plugins: [],
}