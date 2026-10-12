/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#000000",
        "primary-container": "#1f1f1f",
        surface: "var(--color-surface, #faf8ff)",
        "wsurface-container": "var(--color-surface-container, #ededf9)",
        "surface-container-high": "var(--color-surface-container-high, #e7e7f3)",
        "on-surface": "var(--color-on-surface, #191b23)",
        "on-surface-variant": "var(--color-on-surface-variant, #434655)",
        success: "#4CAF50",
        "success-container": "#d3f5d5",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "outline-variant": "var(--color-outline-variant, #c3c6d7)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "16px",
      },
      boxShadow: {
        soft: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025)",
        dark: "0 4px 6px -1px rgba(0, 0, 0, 0.35), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
}
