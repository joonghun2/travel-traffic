import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0b0f19",
        foreground: "#f8fafc",
        card: {
          DEFAULT: "rgba(18, 24, 38, 0.75)",
          border: "rgba(255, 255, 255, 0.08)",
        },
        brand: {
          50: "#fff1f2",
          100: "#ffe4e6",
          500: "#ff385c",
          600: "#e01e43",
          700: "#be123c",
        },
        crowd: {
          relaxed: "#10b981", // Green <40%
          moderate: "#f59e0b", // Yellow 40-70%
          packed: "#ef4444", // Red >70%
        },
      },
      fontFamily: {
        sans: ["Pretendard", "Inter", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glow 2s ease-in-out infinite alternate",
        "fade-in": "fadeIn 0.3s ease-out forwards",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 15px -3px rgba(239, 68, 68, 0.4)" },
          "100%": { boxShadow: "0 0 25px 5px rgba(239, 68, 68, 0.7)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
