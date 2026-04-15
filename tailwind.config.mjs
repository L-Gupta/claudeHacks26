/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        uwred: '#c5050c',
        uwdark: '#0a0a12',
        uwgold: '#e8d5a3',
        cream: '#faf9f6',
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          light: 'rgba(255, 255, 255, 0.08)',
          lighter: 'rgba(255, 255, 255, 0.12)',
        },
        border: {
          glass: 'rgba(255, 255, 255, 0.08)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        glass: '24px',
      },
    },
  },
  plugins: [],
};
