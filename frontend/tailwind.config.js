/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: '#171717',
          muted: '#5f6368',
          gold: '#c7942c',
          goldDark: '#875f12',
          line: '#e8e1d3',
          surface: '#f8f6f1',
        },
      },
      boxShadow: {
        soft: '0 18px 45px rgba(23, 23, 23, 0.08)',
      },
    },
  },
  plugins: [],
};
