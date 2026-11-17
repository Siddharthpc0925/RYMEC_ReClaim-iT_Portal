/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Obsidian Titanium Canvas Palette (Distinct from navy-950) ──
        navy: {
          950: '#050811',
          900: '#090F1B',
          850: '#0D1525',
          800: '#121D31',
          700: '#1A2942',
          600: '#263B5D',
        },
        obsidian: {
          950: '#04070D',
          900: '#070D18',
          850: '#0B1322',
          800: '#101B2E',
          700: '#17253D',
          600: '#223454',
        },
        slate: {
          850: '#0F1626',
        },
        // ── ReClaim-iT Brand Palette: Aurora Emerald & Cyber Mint ──
        brand: {
          emerald: '#10B981',
          teal: '#0D9488',
          mint: '#14B8A6',
          cyan: '#06B6D4',
          royal: '#059669', // Vibrant Emerald Primary CTA
          accent: '#10B981', // Luminescent Mint Accent
          blue: '#047857',   // Deep Forest Emerald
          subtle: '#0D9488', // Subtle Teal Shimmer
        },
        // ── Primary Action Palette: Emerald (Replaces legacy Indigo) ──
        indigo: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        // ── Secondary Accent Palette: Electric Mint & Cyan (Replaces legacy Sky) ──
        sky: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E',
        },
        silver: {
          100: '#F8FAFC',
          200: '#F1F5F9',
          300: '#E2E8F0',
          400: '#94A3B8',
          500: '#64748B',
        },
        status: {
          lost: '#f43f5e',
          found: '#10b981',
          matched: '#f59e0b',
          claimed: '#06b6d4',
          returned: '#10b981',
          archived: '#64748b'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
        glass: '16px',
        pebble: '24px',
      },
      boxShadow: {
        'glass-subtle': '0 8px 30px rgba(0, 0, 0, 0.32)',
        'glass-card': '0 12px 32px -4px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(45, 212, 191, 0.15)',
        'pebble-floating': '0 16px 36px -8px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(45, 212, 191, 0.2)',
        'pebble-pill': '0 4px 14px rgba(0, 0, 0, 0.25)',
        'glass-glow': '0 0 35px rgba(16, 185, 129, 0.42)',
      },
    },
  },
  plugins: [],
}
