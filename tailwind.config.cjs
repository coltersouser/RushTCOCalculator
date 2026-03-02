/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Arial Narrow", "Arial", "sans-serif"],
      },
      colors: {
        rush: {
          gold: "#eeb111",
          black: "#111111",
          red: "#ed1c24"
        },
        grayrush: {
          light: "#e6e7e8",
          medium: "#939598",
          dark: "#4b4c4c"
        }
      },
      boxShadow: {
        card: "0 8px 24px rgba(17,17,17,0.08)"
      },
      borderRadius: {
        xl2: "1rem"
      }
    },
  },
  plugins: [],
};
