module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(210, 10%, 90%)",
        input: "hsl(210, 10%, 90%)",
        ring: "hsl(8, 76%, 36%)",
        background: "hsl(210, 10%, 98%)",
        foreground: "hsl(210, 15%, 12%)",
        primary: {
          DEFAULT: "hsl(8, 76%, 36%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        secondary: {
          DEFAULT: "hsl(8, 72%, 46%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        tertiary: {
          DEFAULT: "hsl(42, 71%, 48%)",
          foreground: "hsl(0, 0%, 20%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 84%, 60%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        muted: {
          DEFAULT: "hsl(210, 10%, 95%)",
          foreground: "hsl(210, 9%, 40%)",
        },
        accent: {
          DEFAULT: "hsl(210, 10%, 95%)",
          foreground: "hsl(210, 15%, 12%)",
        },
        popover: {
          DEFAULT: "hsl(210, 10%, 98%)",
          foreground: "hsl(210, 15%, 12%)",
        },
        card: {
          DEFAULT: "hsl(210, 10%, 98%)",
          foreground: "hsl(210, 15%, 12%)",
        },
        success: "hsl(142, 40%, 38%)",
        warning: "hsl(32, 85%, 45%)",
        gray: {
          50: "hsl(210, 10%, 98%)",
          100: "hsl(210, 10%, 95%)",
          200: "hsl(210, 10%, 90%)",
          300: "hsl(210, 10%, 80%)",
          400: "hsl(210, 8%, 60%)",
          500: "hsl(210, 9%, 40%)",
          600: "hsl(210, 10%, 30%)",
          700: "hsl(210, 11%, 20%)",
          800: "hsl(210, 12%, 14%)",
          900: "hsl(210, 15%, 10%)",
        },
      },
      backgroundImage: {
        'gradient-1': 'linear-gradient(135deg, hsl(8, 76%, 36%) 0%, hsl(42, 71%, 48%) 100%)',
        'gradient-2': 'linear-gradient(135deg, hsl(8, 76%, 36%) 0%, hsl(8, 72%, 46%) 100%)',
        'button-border-gradient': 'linear-gradient(90deg, hsl(42, 71%, 48%), hsl(8, 72%, 46%))',
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
      },
      fontFamily: {
        sans: ["Lato", "sans-serif"],
        headline: ["Poppins", "sans-serif"],
      },
      spacing: {
        '4': '1rem',
        '8': '2rem',
        '12': '3rem',
        '16': '4rem',
        '24': '6rem',
        '32': '8rem',
        '48': '12rem',
        '64': '16rem',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
