/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        solar: {
          50:  "#fff8ec",
          100: "#ffefd3",
          200: "#ffdba5",
          300: "#ffc06d",
          400: "#ff9932",
          500: "#ff7c0a",
          600: "#f06000",
          700: "#c74702",
          800: "#9e380b",
          900: "#7f300c",
        },
        brand: {
          50:  "#edfcf2",
          100: "#d3f8e0",
          200: "#aaf0c5",
          300: "#72e3a3",
          400: "#38ce7c",
          500: "#15b561",
          600: "#0b9150",
          700: "#0a7342",
          800: "#0b5b36",
          900: "#0a4b2d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
