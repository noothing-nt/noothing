/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // ── Base palette ──
        void:        '#080808',
        'void-2':    '#0e0e0e',
        'void-3':    '#111111',
        surface:     '#161616',
        'surface-2': '#1c1c1c',
        'surface-3': '#222222',
        border:      '#1f1f1f',
        'border-2':  '#2a2a2a',
        'border-3':  '#333333',

        // ── Accent — Indigo/Violet ──
        accent:         '#6366f1',
        'accent-light': '#818cf8',
        'accent-dim':   '#4f46e5',
        'accent-deep':  '#4338ca',
        'accent-glow':  'rgba(99,102,241,0.15)',
        'accent-subtle':'rgba(99,102,241,0.08)',

        // ── Text ──
        'txt-primary':   '#f0f0f0',
        'txt-secondary': '#909090',
        'txt-muted':     '#4a4a4a',
        'txt-ghost':     '#2a2a2a',

        // ── Status ──
        online:    '#22c55e',
        delivered: '#606060',
        read:      '#6366f1',
        error:     '#ef4444',
        warning:   '#f59e0b',

        // ── Special ──
        burner: '#f97316',
      },
      backgroundImage: {
        'gradient-accent':  'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        'gradient-surface': 'linear-gradient(180deg, #161616 0%, #111111 100%)',
        'gradient-radial':  'radial-gradient(circle, var(--tw-gradient-stops))',
        'gradient-mesh':    'radial-gradient(at 20% 50%, rgba(99,102,241,0.05) 0px, transparent 50%)',
        'noise-overlay':    "url(\"data:image/svg+xml,%3Csvg...%3E\")",
      },
      animation: {
        'float-up':      'floatUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-left':    'slideInLeft 0.28s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-right':   'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pop-in':        'popIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':       'fadeIn 0.2s ease both',
        'fade-up':       'floatUp 0.25s ease both',
        'shimmer':       'shimmer 1.8s infinite',
        'pulse-soft':    'pulseSoft 2.5s ease-in-out infinite',
        'gradient-shift':'gradientShift 4s ease infinite',
        'border-glow':   'borderGlow 2s ease-in-out infinite',
        'bounce-dot':    'typingBounce 1.4s infinite ease-in-out',
        'pulse-ring':    'pulseRing 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        floatUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        popIn: {
          '0%':  { opacity: '0', transform: 'scale(0.8)' },
          '70%': { transform: 'scale(1.05)' },
          '100%':{ opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        gradientShift: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(99,102,241,0.3)' },
          '50%':      { borderColor: 'rgba(99,102,241,0.7)' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.0)', opacity: '0' },
        },
        typingBounce: {
          '0%, 60%, 100%': { transform: 'translateY(0)',    opacity: '0.4' },
          '30%':           { transform: 'translateY(-6px)', opacity: '1'   },
        },
      },
      boxShadow: {
        'premium':  '0 1px 0 rgba(255,255,255,0.05) inset, 0 24px 48px rgba(0,0,0,0.5)',
        'card':     '0 0 0 1px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4)',
        'glow-sm':  '0 0 16px rgba(99,102,241,0.2)',
        'glow-md':  '0 0 32px rgba(99,102,241,0.25)',
        'glow-lg':  '0 0 60px rgba(99,102,241,0.3)',
        'message':  '0 2px 12px rgba(0,0,0,0.3)',
        'float':    '0 20px 60px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.3)',
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};