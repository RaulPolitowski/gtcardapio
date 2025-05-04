/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
        'title': ['Montserrat', 'sans-serif'],
      },
      colors: {
        'menu': {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#FF6B00',
          500: '#FF4500',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#1F1F1F',
          900: '#121212',
          accent: '#FF4500'
        }
      },
      backgroundColor: {
        'card': {
          light: '#1F1F1F',
          hover: '#2A2A2A',
          dark: '#121212'
        }
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem'
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    }
  ],
}