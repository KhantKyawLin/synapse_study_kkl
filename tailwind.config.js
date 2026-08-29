/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0f141c',
        darkCard: '#1a1e24',
        darkOption: '#161a1f',
        cyanPrimary: '#1ea1f2',
        cyanGlow: '#70c7ff',
        redAccent: '#ff5e78',
        greenAccent: '#4cd964',
      },
      perspective: {
        '1000': '1000px',
      }
    },
  },
  plugins: [],
}
