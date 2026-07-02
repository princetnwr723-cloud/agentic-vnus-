import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        demon: {
          red: "#FF3B30",
          "red-dark": "#CC1A10",
          "red-glow": "#FF3B3030",
          crimson: "#8B0000",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "star-twinkle": "starTwinkle 4s ease-in-out infinite",
        "slide-up": "slideUp 0.8s ease-out forwards",
        "fade-in": "fadeIn 1s ease-out forwards",
        "horn-glow": "hornGlow 2s ease-in-out infinite",
        "wing-flap": "wingFlap 3s ease-in-out infinite",
        "marquee": "marquee 30s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        starTwinkle: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        hornGlow: {
          "0%, 100%": { filter: "drop-shadow(0 0 4px #FF3B30)" },
          "50%": { filter: "drop-shadow(0 0 12px #FF3B30) drop-shadow(0 0 20px #FF000080)" },
        },
        wingFlap: {
          "0%, 100%": { transform: "rotate(-5deg)" },
          "50%": { transform: "rotate(5deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      backgroundImage: {
        "radial-dark": "radial-gradient(ellipse at 50% 0%, #1a0a0a 0%, #000000 60%)",
        "radial-red": "radial-gradient(ellipse at 50% 50%, #FF3B3015 0%, transparent 70%)",
      },
    },
  },
  plugins: [],
};

export default config;