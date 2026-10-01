/** @type {import('tailwindcss').Config} */

export default {
  darkMode: ["class"],

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1440px",
      },
    },

    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        "sd-primary": "#ff5c00",
        "sd-primary-container": "#ff5c00",
        "sd-on-primary": "#ffffff",
        "sd-on-primary-container": "#170700ff",
        "sd-secondary": "#006e2f",
        "sd-secondary-container": "#6bff8f",
        "sd-on-secondary": "#ffffff",
        "sd-on-secondary-container": "#007432",
        "sd-tertiary": "#494bd6",
        "sd-tertiary-container": "#8286ff",
        "sd-error": "#ba1a1a",
        "sd-error-container": "#ffdad6",
        "sd-surface": "hsl(var(--sd-surface))",
        "sd-surface-container": "hsl(var(--sd-surface-container))",
        "sd-surface-container-low": "hsl(var(--sd-surface-container-low))",
        "sd-surface-container-high": "hsl(var(--sd-surface-container-high))",
        "sd-surface-variant": "hsl(var(--sd-surface-variant))",
        "sd-on-surface": "hsl(var(--sd-on-surface))",
        "sd-on-surface-variant": "hsl(var(--sd-on-surface-variant))",
        "sd-outline": "hsl(var(--sd-outline))",
        "sd-outline-variant": "hsl(var(--sd-outline-variant))",
        "sd-primary-fixed": "hsl(var(--sd-primary-fixed))",
        "sd-primary-fixed-dim": "hsl(var(--sd-primary-fixed-dim))",
        "sd-inverse-surface": "hsl(var(--sd-inverse-surface))",

        /* ── CleanServe Cleaning Panel Design Tokens ──────── */
        "cleanserve-primary": "#004ac6",
        "cleanserve-primary-container": "#2563eb",
        "cleanserve-on-primary-container": "#eeefff",
        "cleanserve-surface-container": "#e7eeff",
        "cleanserve-surface-container-low": "#f0f3ff",
        "cleanserve-tertiary": "#943700",
        "cleanserve-tertiary-container": "#bc4800",
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1.25rem",
        "2xl": "1.75rem",
        "3xl": "2rem",
      },

      fontFamily: {
        sans: ["Inter", "Segoe UI", "sans-serif"],
        display: ["Inter", "Segoe UI", "sans-serif"],
      },

      boxShadow: {
        soft: "0 12px 40px rgba(15, 23, 42, 0.08)",
        premium: "0 20px 60px rgba(15, 23, 42, 0.14)",
        glass: "0 8px 32px rgba(31, 38, 135, 0.18)",
      },

      backdropBlur: {
        xs: "2px",
      },

      backgroundImage: {
        "hero-light":
          "linear-gradient(180deg, rgba(255,248,240,0.95), rgba(255,255,255,1))",

        "hero-dark":
          "linear-gradient(180deg, rgba(10,10,12,1), rgba(15,15,20,1))",

        "orange-radial":
          "radial-gradient(circle at top, rgba(251,191,36,0.12), transparent 22%)",
      },

      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },

      animation: {
        float: "float 6s ease-in-out infinite",
        fadeIn: "fadeIn 0.5s ease forwards",
        shimmer: "shimmer 2s linear infinite",
      },

      keyframes: {
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },

        fadeIn: {
          from: {
            opacity: "0",
            transform: "translateY(8px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0px)",
          },
        },

        shimmer: {
          "0%": {
            backgroundPosition: "-1000px 0",
          },
          "100%": {
            backgroundPosition: "1000px 0",
          },
        },
      },
    },
  },

  plugins: [require("tailwindcss-animate")],
};