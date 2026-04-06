import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // IDLC Brand Colors (exact from PRD)
        red: {
          DEFAULT: "#E8202A",
          dark: "#B5141C",
          light: "#FDF0F0",
          mid: "#F5CECE",
        },
        ink: {
          DEFAULT: "#2C2C2C",
          black: "#1A1A1A",
          muted: "#6B6B6B",
          subtle: "#9A9A9A",
        },
        border: {
          DEFAULT: "#E4E4E0",
          soft: "#F0EEEA",
        },
        bg: {
          DEFAULT: "#FAFAF8",
          dark: "#0F0F0F",
        },
        // Semantic colors
        corporate: {
          DEFAULT: "#1D4ED8",
          light: "#EFF6FF",
          border: "#BFDBFE",
        },
        sme: {
          DEFAULT: "#15803D",
          light: "#F0FDF4",
          border: "#BBF7D0",
        },
        amber: {
          DEFAULT: "#B45309",
          light: "#FFFBEB",
          border: "#FDE68A",
        },
        board: {
          DEFAULT: "#7C3AED",
          light: "#F5F3FF",
          border: "#DDD6FE",
        },
      },
      fontFamily: {
        serif: ["DM Serif Display", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      borderRadius: {
        sm: "8px",
        lg: "14px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)",
        panel: "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)",
      },
      animation: {
        "slide-in-right": "slideInRight 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
      },
      keyframes: {
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.8)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
