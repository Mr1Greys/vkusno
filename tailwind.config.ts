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
        brand: {
          DEFAULT: "#4A3C2F",
          hover: "#3A2F25",
        },
        coffee: "#8B6F47",
        beige: "#D4C5B0",
        cream: "#FAF8F5",
        accent: "#F5A623",
        background: "#FAF8F5",
        surface: {
          1: "#FFFFFF",
          2: "#F5F0E8",
        },
        border: "#D4C5B0",
        text: {
          DEFAULT: "#4A3C2F",
          2: "#8B6F47",
          3: "#A8927A",
        },
        success: "#22c55e",
        error: "#ef4444",
        halal: "#2D9E5F",
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        display: ['"DM Sans"', "system-ui", "sans-serif"],
        body: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "16px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(74, 60, 47, 0.06)",
        "card-hover": "0 8px 24px rgba(74, 60, 47, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
