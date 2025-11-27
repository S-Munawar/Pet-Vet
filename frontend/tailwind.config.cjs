module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'vet-blue': {
          50: '#f3f8fb',
          100: '#e6f0fa',
          200: '#bfdeef',
          300: '#99cce4',
          400: '#4da7d3',
          500: '#007fbf',
          600: '#006aa8',
          700: '#005183',
        },
        'vet-green': {
          50: '#f3fbf6',
          100: '#e6f6ee',
          200: '#bfeed7',
          300: '#99e6bf',
          400: '#4ddf97',
          500: '#00c76f',
          600: '#00ae5e',
          700: '#00894a',
        },
        'warm-accent': {
          50: '#fff6f0',
          100: '#ffeddf',
          200: '#ffd2b8',
          300: '#ffb68f',
          400: '#ff8a51',
          500: '#ff6f2a',
          600: '#e65f21',
          700: '#b74918',
        },
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 400ms ease-out',
      },
    },
  },
  plugins: [],
}
