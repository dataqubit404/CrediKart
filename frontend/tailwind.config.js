/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdfdea',
          100: '#fdf6b2',
          200: '#fce96a',
          300: '#faca15',
          400: '#e3a008',
          500: '#F7D300', // Blinkit Yellow / Primary
          600: '#c27803',
          700: '#9f580a',
        },
        blinkit: {
          green: '#3BB143',
          yellow: '#F7D300',
          dark: '#1C1C1C',
        },
        luxe: {
          900: '#0B0C10',
          800: '#15171F',
          700: '#1F222E',
          600: '#2A2E3D',
          border: 'rgba(255, 255, 255, 0.08)',
          glass: 'rgba(20, 22, 31, 0.65)'
        },
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#F3F4F6',
          border: '#E5E7EB',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'glass-gradient-light': 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
        'glow': '0 0 15px rgba(247, 211, 0, 0.5)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        fadeUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGlow: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.7, boxShadow: '0 0 20px rgba(247, 211, 0, 0.7)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};
