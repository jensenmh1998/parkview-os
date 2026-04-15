/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bone: '#F5F0E8',
        'bone-dark': '#EDE8DF',
        'near-black': '#1C1A15',
        brass: '#B4A06A',
        'brass-light': '#C9B88A',
        'brass-dark': '#8C7A4E',
        sidebar: '#EDE8DF',
      },
      fontFamily: {
        cormorant: ['"Cormorant Garamond"', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
