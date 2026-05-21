/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nomadas: {
          brown: '#8B5E3C',
          cream: '#F5F0E8',
          dark: '#2C1810',
        }
      }
    },
  },
  plugins: [],
}
