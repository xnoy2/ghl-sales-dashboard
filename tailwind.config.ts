import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease both",
        "slide-up": "slideUp 0.35s ease both",
        "pulse-dot": "pulseDot 1.8s ease-in-out infinite",
        "scale-in": "scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "float": "float 6s ease-in-out infinite",
        "blob": "blob 20s ease-in-out infinite",
        "drift": "drift 10s ease-in-out infinite",
        "load-bar": "loadBar 1.6s ease-in-out forwards",
      },
      keyframes: {
        fadeIn:   { from: { opacity: "0" },                          to: { opacity: "1" } },
        slideUp:  { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        pulseDot: { "0%,100%": { opacity: "1", transform: "scale(1)" }, "50%": { opacity: ".4", transform: "scale(1.4)" } },
        scaleIn:  { from: { opacity: "0", transform: "scale(0.96) translateY(8px)" }, to: { opacity: "1", transform: "scale(1) translateY(0)" } },
        float:    { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        blob: {
          "0%,100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%":     { transform: "translate(30px, -40px) scale(1.1)" },
          "66%":     { transform: "translate(-20px, 20px) scale(0.95)" },
        },
        drift: {
          "0%,100%": { transform: "translateY(0px) translateX(0px)" },
          "50%":     { transform: "translateY(-24px) translateX(8px)" },
        },
        loadBar: { from: { width: "0%" }, to: { width: "100%" } },
      },
    },
  },
  plugins: [],
};
export default config;
