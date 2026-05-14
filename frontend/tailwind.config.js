/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#d9e2ff',
          200: '#b3c5ff',
          300: '#8ca8ff',
          400: '#668bff',
          500: '#3366FF', // Premium Tech Blue
          600: '#2952cc',
          700: '#1f3d99',
          800: '#142966',
          900: '#0a1433',
        },
        midnight: {
          DEFAULT: '#0B0F1A',
          lighter: '#161B2B',
          lightest: '#21293D',
          accent: '#3366FF',
        },
        luxury: {
          gold: '#FFD700',
          silver: '#C0C0C0',
          rose: '#E0115F',
        },
        blinkit: {
          green: '#3BB143',
          yellow: '#F7D300',
          dark: '#1C1C1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Sora', 'sans-serif'],
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'premium-gradient': 'linear-gradient(135deg, #3366FF 0%, #E0115F 100%)',
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
        'premium-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.4)',
        'neon-blue': '0 0 15px rgba(51, 102, 255, 0.4)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        shimmer: 'shimmer 2s infinite linear',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        fadeIn: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};
