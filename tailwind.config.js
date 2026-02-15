/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ECFDF3",
          100: "#D1FAE3",
          200: "#A7F3CF",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        farmer: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
        },
        lime: {
          DEFAULT: "#C1FF72",
          dark: "#A8E05F",
        },
        dark: {
          bg: "#1C1C1E",
          card: "#2C2C2E",
          input: "#3A3A3C",
        },
      },
      // Add box shadow support for React Native
      boxShadow: {
        'sm': '0 1 2 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1 3 0 rgba(0, 0, 0, 0.1), 0 1 2 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4 6 -1 rgba(0, 0, 0, 0.1), 0 2 4 -1 rgba(0, 0, 0, 0.06)',
        'lg': '0 10 15 -3 rgba(0, 0, 0, 0.1), 0 4 6 -2 rgba(0, 0, 0, 0.05)',
        'xl': '0 20 25 -5 rgba(0, 0, 0, 0.1), 0 10 10 -5 rgba(0, 0, 0, 0.04)',
      },
    },
  },
  darkMode: "class", // or "media"
  presets: [require("nativewind/preset")], // ✅ add this line
  plugins: [],
};
