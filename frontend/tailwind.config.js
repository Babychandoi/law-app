/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx,css}",
    "./node_modules/flowbite-react/**/*.js",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#171717",
          muted: "#5f6368",
          gold: "#c7942c",
          goldDark: "#996f1d",
          line: "#e8e1d3",
          surface: "#f8f6f1"
        }
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 23, 23, 0.08)"
      }
    },
  },
  plugins: [
    require("flowbite/plugin")
  ],
};
