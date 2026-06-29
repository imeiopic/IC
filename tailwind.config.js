import plugin from 'tailwindcss/plugin';
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette';

/** @type {import('tailwindcss').Config} */
export default {
  prefix: 'tw-',
  // Boosts specificity to ensure Tailwind overrides Bootstrap within the app
  important: '#app',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  safelist: [
    // Only generate specific variants for specific patterns
    {
      pattern: /bg-red-500/,
      variants: ['hover'], 
    },
    {
      pattern: /bg-red-950/,
      variants: ['lg'], // No hover/focus generated for 950
    },
  ],
  corePlugins: {
    // Disable Preflight if Bootstrap's reset (Reboot) is preferred
    preflight: false,
  },
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {
      fontFamily: {
        terminal: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
      colors: {
        red: {
          950: '#450a0a',
        },
      },
      boxShadow: {
        'info': '0 0 20px rgb(var(--bs-info-rgb) / 0.15)',
      },
    },
  },
  plugins: [
    plugin(function({ addComponents, theme }) {
      addComponents({
        // Moving this to Components allows Tailwind to purge it if unused
        '.tw-preflight': {
          'box-sizing': 'border-box',
          'border-width': '0',
          'border-style': 'solid',
          'border-color': theme('colors.currentColor', 'currentColor'),
        },
        '.tw-preflight *, .tw-preflight ::before, .tw-preflight ::after': {
          'box-sizing': 'inherit',
          'border-width': '0',
          'border-style': 'solid',
          'border-color': theme('colors.currentColor', 'currentColor'),
        },
        // Reset common elements within the scope to avoid Bootstrap overrides
        '.tw-preflight h1, .tw-preflight h2, .tw-preflight h3, .tw-preflight p': {
          'margin': '0',
        },
      });
    }),
    // Plugin to bridge Bootstrap CSS variables into Tailwind utilities
    plugin(function() {}, {
      theme: {
        extend: {
          colors: {
            'bs-primary': 'rgb(var(--bs-primary-rgb) / <alpha-value>)',
            'bs-secondary': 'rgb(var(--bs-secondary-rgb) / <alpha-value>)',
            'bs-success': 'rgb(var(--bs-success-rgb) / <alpha-value>)',
            'bs-info': 'rgb(var(--bs-info-rgb) / <alpha-value>)',
            'bs-warning': 'rgb(var(--bs-warning-rgb) / <alpha-value>)',
            'bs-danger': 'rgb(var(--bs-danger-rgb) / <alpha-value>)',
            'bs-light': 'rgb(var(--bs-light-rgb) / <alpha-value>)',
            'bs-dark': 'rgb(var(--bs-dark-rgb) / <alpha-value>)',
          },
        },
      },
    }),
    // Plugin to generate Bootstrap-compatible gutter utilities
    plugin(function({ matchUtilities, theme }) {
      matchUtilities(
        {
          'g': (value) => ({
            '--bs-gutter-x': value,
            '--bs-gutter-y': value,
          }),
          'gx': (value) => ({
            '--bs-gutter-x': value,
          }),
          'gy': (value) => ({
            '--bs-gutter-y': value,
          }),
        },
        { values: theme('spacing') }
      );
    }),
    // Plugin for dynamic complex components
    plugin(function({ matchComponents, theme }) {
      matchComponents(
        {
          'status-pill': (value) => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: theme('spacing.2'),
            padding: `${theme('spacing.1')} ${theme('spacing.3')}`,
            borderRadius: theme('borderRadius.full'),
            border: `1px solid ${value}`,
            color: value,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            fontSize: theme('fontSize.xs'),
            fontWeight: theme('fontWeight.bold'),
            textTransform: 'uppercase',
          }),
        },
        { values: flattenColorPalette(theme('colors')) }
      );
    }),
  ],
}
