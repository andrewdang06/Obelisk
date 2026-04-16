import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#030507",
          900: "#060a0f",
          850: "#0a1017",
          800: "#0e1620",
          700: "#172431",
        },
        signal: {
          500: "#6ee7f9",
          600: "#22d3ee",
          700: "#0891b2",
        },
        ember: {
          500: "#f59e0b",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SFMono-Regular",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      boxShadow: {
        panel: "0 24px 80px rgba(0, 0, 0, 0.42)",
        signal: "0 0 36px rgba(34, 211, 238, 0.12)",
      },
      transitionTimingFunction: {
        precise: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
