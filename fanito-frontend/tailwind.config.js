/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode based on a class
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'], // Default font will be Roboto
      },
      colors: {
        light: {
          primary: '#4A90E2',
          secondary: '#50E3C2',
          background: '#FFFFFF',
          text: '#333333',
          accent: '#F5A623',
        },
        dark: {
          primary: '#1E3A8A',
          secondary: '#0F766E',
          background: '#1F2937',
          text: '#E5E7EB',
          accent: '#D97706',
        },
      },
    },
  },
  plugins: [],
}

