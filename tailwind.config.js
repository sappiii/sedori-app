/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a1020',
          800: '#0d1627',
          700: '#111e31',
          600: '#162540',
          500: '#1e3354',
        },
        card: '#162032',
      },
    },
  },
  plugins: [],
}
