module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        hindi: ['"Noto Serif Devanagari"', 'serif'],
      },
      colors: {
        'dark-glass': 'rgba(0, 0, 0, 0.6)', // Semi-transparent dark background
        'primary-blue': '#3B82F6', // A nice blue for buttons/accents
      },
      boxShadow: {
        'xl': '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      textShadow: {
        'md': '2px 2px 4px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};