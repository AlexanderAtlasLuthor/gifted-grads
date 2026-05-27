import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Inky navy — taken from the flyer's deep sky and shadows.
        ink: {
          50: '#eef2fa',
          100: '#cfd8ee',
          200: '#9fb1d8',
          300: '#6a82b6',
          400: '#3f5687',
          500: '#22335b',
          600: '#162446',
          700: '#0e1a36',
          800: '#0a1228',
          900: '#070d1c',
          950: '#040813',
        },
        // Cornflower / sky blue from the flyer's globe.
        brand: {
          50: '#eef6ff',
          100: '#d5e8ff',
          200: '#a9cffd',
          300: '#74b1f5',
          400: '#4992e8',
          500: '#2f78d4',
          600: '#1f5eb4',
          700: '#1c4a8a',
          800: '#173b6c',
          900: '#142e52',
        },
        // Soft sky-glow used behind the globe / for highlights.
        sky: {
          200: '#bfe1f6',
          300: '#9bd0ef',
          400: '#6ec6e8',
          500: '#3fa9d8',
        },
        // The Gifted Grads lightning-bolt yellow.
        accent: {
          50: '#fffbea',
          100: '#fff1c2',
          200: '#ffe18a',
          300: '#ffcf4d',
          400: '#f7c948',
          500: '#eaa90a',
          600: '#bc8400',
          700: '#8a6100',
          800: '#604300',
          900: '#3d2a00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Anton', 'Archivo', 'Inter', 'sans-serif'],
        editorial: ['Archivo', 'Inter', 'sans-serif'],
      },
      letterSpacing: {
        wider: '0.08em',
        widest: '0.22em',
      },
      boxShadow: {
        card: '0 1px 2px rgba(4, 8, 19, 0.4), 0 10px 30px rgba(4, 8, 19, 0.35)',
        cardLg: '0 20px 60px -10px rgba(4, 8, 19, 0.6), 0 4px 18px rgba(4, 8, 19, 0.35)',
        glow: '0 0 60px rgba(110, 198, 232, 0.25)',
        bigGlow: '0 0 140px rgba(63, 169, 216, 0.35)',
      },
      backgroundImage: {
        'underline-accent':
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 12' preserveAspectRatio='none'><path d='M2 8 Q 50 0 100 6 T 198 8' stroke='%23f7c948' stroke-width='4' fill='none' stroke-linecap='round'/></svg>\")",
      },
      keyframes: {
        floatSpark: {
          '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: '0.85' },
          '50%': { transform: 'translateY(-3px) scale(1.08)', opacity: '1' },
        },
        slowDrift: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-10px,0)' },
        },
      },
      animation: {
        floatSpark: 'floatSpark 2.4s ease-in-out infinite',
        slowDrift: 'slowDrift 12s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
