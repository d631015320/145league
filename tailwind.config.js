/** @type {import('tailwindcss').Config} */
// 为了确保 Electron 和 Vite 环境兼容性最稳，我们统一使用 export default (ESM)
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // 1. 保留你的自定义字体
      fontFamily: {
        sans: ['Inter', 'Microsoft YaHei', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      // 2. 保留你的 Brand 品牌色
      colors: {
        brand: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
          400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
          800: '#065f46', 900: '#064e3b', 950: '#022c22',
        }
      },
      // 3. 修复并保留动画配置
      animation: {
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'modal': 'modalShow 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-highlight': 'pulseHighlight 2s cubic-bezier(0.4, 0, 0.6, 1) 2',
        'scale-in': 'scaleIn 0.3s ease-out forwards', // 我补加的，GTO界面用到了
      },
      // 4. 修复 Keyframes 语法 (注意括号位置)
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
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      // 5. 🔥 GTO 核心配置 (移出来了，放在 extend 下面)
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      }
    },
  },
  plugins: [],
}