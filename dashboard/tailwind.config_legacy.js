/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#0e0e0e", // Deep Obsidian
        foreground: "#e5e2e1",
        primary: {
          DEFAULT: "#d2bbff",
          foreground: "#38255e",
        },
        secondary: {
          DEFAULT: "#201f1f",
          foreground: "#e3e2e2",
        },
        destructive: {
          DEFAULT: "#ec7c8a",
          foreground: "#690005",
        },
        muted: {
          DEFAULT: "#1c1b1b",
          foreground: "#948e9a",
        },
        accent: {
          DEFAULT: "#3a3939",
          foreground: "#e5e2e1",
        },
        surface: {
          lowest: "#0e0e0e",
          low: "#1c1b1b",
          base: "#131313",
          high: "#2a2a2a",
          highest: "#353534",
          bright: "#3a3939",
        }
      },
      borderRadius: {
        lg: "4px",
        md: "4px",
        sm: "4px",
      },
      fontFamily: {
        sans: ["Manrope", "Inter", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
