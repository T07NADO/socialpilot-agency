import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Bricolage Grotesque'", "Times New Roman", "serif"],
        sans:    ["'Geist'", "Helvetica Neue", "Arial", "sans-serif"],
        mono:    ["'Geist Mono'", "ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#0E1014",
          2: "#2A2D33",
          3: "#5C616A",
          4: "#8C9099",
          5: "#B7BAC1",
          on: "#FFFCF6",
        },
        cream:  "#FAF6EE",
        paper:  "#FFFCF6",
        sand:   "#F1ECE0",
        fog:    "#E4DECF",
        "gold-cta": {
          DEFAULT: "#FFEA00",
          press:   "#E6D200",
          soft:    "#FFF7B0",
          ink:     "#332800",
        },
        sky: {
          DEFAULT: "#2E6FE6",
          soft:    "#DCE7FB",
          ink:     "#0E2E69",
        },
        sage: {
          DEFAULT: "#2F7D5C",
          soft:    "#D5E7DC",
          ink:     "#143626",
        },
        rust: {
          DEFAULT: "#B0381C",
          soft:    "#F4D8CD",
          ink:     "#561508",
        },
        pending: {
          DEFAULT: "#B68A1C",
          soft:    "#F1E5C0",
          ink:     "#4A370A",
        },
        plum: {
          DEFAULT: "#A33A8E",
          soft:    "#F1DAEC",
          ink:     "#4A1641",
        },
        linkedin:  "#0A66C2",
        instagram: "#E1306C",
      },
      borderRadius: {
        xs:   "4px",
        sm:   "8px",
        DEFAULT: "12px",
        lg:   "16px",
        pill: "999px",
      },
      boxShadow: {
        "1":    "0 1px 2px rgba(20,14,6,0.05), 0 2px 6px rgba(20,14,6,0.06)",
        "2":    "0 2px 4px rgba(20,14,6,0.06), 0 12px 28px rgba(20,14,6,0.10)",
        "edge": "inset 0 1px 0 rgba(255,252,246,0.7)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
