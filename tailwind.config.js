/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fantasy: {
          dark: '#1a1a2e',
          blue: '#16213e',
          purple: '#0f3460',
          red: '#e94560',
          gold: '#f39c12'
        }
      },
      fontFamily: {
        'fantasy': ['Cinzel', 'serif'],
        'fantasy-decorative': ['Cinzel Decorative', 'serif']
      }
    },
  },
  plugins: [],
}