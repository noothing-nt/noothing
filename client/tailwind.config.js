/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'SF Pro Display',
               'Segoe UI', 'sans-serif'],
      },

      colors: {
        // ── Core Palette ──────────────────────────────
        accent: {
          DEFAULT: '#6366f1',
          light:   '#a5b4fc',
          dark:    '#4338ca',
        },
        void: {
          DEFAULT: '#080808',
          1:       '#0d0d0d',
          2:       '#111111',
          3:       '#161616',
        },
        surface:  '#1a1a1a',
        border: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          hover:   'rgba(255,255,255,0.12)',
        },
        txt: {
          primary:   '#f0f0f0',
          secondary: '#a0a0a0',
          muted:     '#606060',
        },
      },

      backgroundImage: {
        'mesh-bg': `
          radial-gradient(ellipse 80% 80% at 50% -20%, rgba(99,102,241,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 60% 60% at 80% 80%, rgba(139,92,246,0.05) 0%, transparent 50%),
          linear-gradient(180deg, #080808 0%, #0a0a0f 100%)
        `,
        'gradient-text': 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #6366f1 100%)',
      },

      boxShadow: {
        'premium':   '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        'glow-sm':   '0 0 20px rgba(99,102,241,0.15)',
        'glow-md':   '0 0 40px rgba(99,102,241,0.2)',
        'glow-lg':   '0 0 60px rgba(99,102,241,0.25)',
        'inner-top': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },

      animation: {
        'pulse-soft':  'pulseSoft 4s ease-in-out infinite',
        'float-up':    'floatUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in':     'fadeIn 0.3s ease forwards',
        'slide-up':    'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down':  'slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shake':       'shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'spin-slow':   'spin 3s linear infinite',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
      },

      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%':      { opacity: '1',   transform: 'scale(1.05)' },
        },
        floatUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':      { transform: 'translateX(-6px)' },
          '40%':      { transform: 'translateX(6px)' },
          '60%':      { transform: 'translateX(-4px)' },
          '80%':      { transform: 'translateX(4px)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '18':  '4.5rem',
      },

      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },

      backdropBlur: {
        xs: '2px',
      },

      transitionTimingFunction: {
        'spring':   'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [
    // Custom utilities plugin
    function({ addUtilities, addComponents, theme }) {
      addUtilities({
        // Gradient text utility
        '.gradient-text': {
          background:              'linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #6366f1 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip':         'text',
        },

        // Mesh background
        '.mesh-bg': {
          background: `
            radial-gradient(ellipse 80% 80% at 50% -20%, rgba(99,102,241,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 60% at 80% 80%, rgba(139,92,246,0.05) 0%, transparent 50%),
            linear-gradient(180deg, #080808 0%, #0a0a0f 100%)
          `,
        },

        // Scrollbar hide
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width':    'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },

        // Scrollbar thin
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'rgba(255,255,255,0.08) transparent',
          '&::-webkit-scrollbar':       { width: '4px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background:    'rgba(255,255,255,0.08)',
            borderRadius:  '999px',
          },
        },

        // Glass effect
        '.glass': {
          background:    'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          border:        '1px solid rgba(255,255,255,0.06)',
        },

        // Text shadow glow
        '.text-glow': {
          textShadow: '0 0 20px rgba(99,102,241,0.4)',
        },

        // Tap highlight removal
        '.tap-none': {
          '-webkit-tap-highlight-color': 'transparent',
        },
      });

      // Card component
      addComponents({
        '.card': {
          background: 'linear-gradient(180deg, rgba(22,22,22,0.95) 0%, rgba(14,14,14,0.98) 100%)',
          border:      '1px solid rgba(255,255,255,0.06)',
          borderRadius: '1.5rem',
          boxShadow:   '0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.6)',
        },

        '.btn-primary': {
          position:        'relative',
          display:         'inline-flex',
          alignItems:      'center',
          justifyContent:  'center',
          padding:         '0.875rem 1.5rem',
          borderRadius:    '0.75rem',
          fontSize:        '0.875rem',
          fontWeight:      '700',
          color:           '#ffffff',
          background:      'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
          boxShadow:       '0 4px 20px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
          transition:      'all 0.2s ease',
          cursor:          'pointer',
          overflow:        'hidden',
          '&:hover': {
            boxShadow: '0 0 30px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
          '&:disabled': {
            opacity: '0.5',
            cursor:  'not-allowed',
          },
        },

        '.input-field': {
          width:          '100%',
          padding:        '0.75rem 1rem',
          borderRadius:   '0.75rem',
          fontSize:       '0.875rem',
          color:          '#f0f0f0',
          background:     '#111111',
          border:         '1px solid rgba(255,255,255,0.06)',
          outline:        'none',
          transition:     'all 0.2s ease',
          '&::placeholder': { color: 'rgba(96,96,96,0.5)' },
          '&:hover': { borderColor: 'rgba(255,255,255,0.12)' },
          '&:focus': {
            borderColor: 'rgba(99,102,241,0.5)',
            background:  '#1a1a1a',
            boxShadow:   '0 0 0 3px rgba(99,102,241,0.08)',
          },
        },
      });
    },
  ],
};