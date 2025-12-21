/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  plugins: [],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        text: '#243149',
        darker: '#e6ebef',
        highlight: '#175DDC',
        border: '#9CA6B8',
        labelSuccess: '#E0EBE5',
        labelWarning: '#EDE1D1',
        labelDanger: '#EFD2D2',
      },
      keyframes: {
        slideDownAndFade: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        slideDownAndFade: 'slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
};
