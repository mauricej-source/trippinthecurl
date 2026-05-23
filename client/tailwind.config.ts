import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171614",
        paper: "#f8f5ee",
        linen: "#eee7dc",
        gallery: "#fffdf8",
        moss: "#526052",
        clay: "#8d5e45",
        graphite: "#343230"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Spectral", "Georgia", "serif"]
      },
      boxShadow: {
        fine: "0 18px 45px rgba(23, 22, 20, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;
