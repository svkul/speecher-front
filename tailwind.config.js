const { hairlineWidth } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./global.css"],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat-Regular', 'system-ui', 'sans-serif'],
        italic: ['Montserrat-Italic', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        fontMain: 'var(--font-main)',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        button: {
          DEFAULT: 'var(--button-bg)',
          foreground: 'var(--button-text)',
          text: 'var(--button-text)',
        },
        switch: {
          DEFAULT: 'var(--switch-bg)',
          foreground: 'var(--switch-foreground)',
          active: 'var(--switch-active)',
          inactive: 'var(--switch-inactive)',
        },
        alert: {
          DEFAULT: 'var(--alert-background)',
          foreground: 'var(--alert-foreground)',
          text: 'var(--alert-text)',
          border: 'var(--alert-border)',
          overlay: 'var(--alert-overlay)',
        },
        'select-trigger-bg': 'var(--select-trigger-bg)',
        'select-trigger-border': 'hsl(var(--select-trigger-border))',
        'select-trigger-hover': 'hsl(var(--select-trigger-hover) / 0.5)',
        'select-trigger-active': 'hsl(var(--select-trigger-active) / 0.7)',
        'select-content-bg': 'hsl(var(--select-content-bg))',
        'select-content-border': 'var(--select-content-border)',
        'select-item-hover': 'hsl(var(--select-item-hover))',
        'select-item-active': 'hsl(var(--select-item-active))',
        'select-shadow': 'var(--select-shadow)',
        'select-text': 'var(--select-text)',
        'select-text-muted': 'hsl(var(--select-text-muted))',
        'slot-past-background': 'var(--slot-past-background)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
}

