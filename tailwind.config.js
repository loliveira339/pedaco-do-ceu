/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta extraída da logomarca Pedaço do Céu
        cream: {
          DEFAULT: '#FBF3E7',
          alt: '#F3E4CC',
          deep: '#EBD9BC',
        },
        brown: {
          light: '#8A5A34',
          DEFAULT: '#5B3A22',
          dark: '#3D2817',
        },
        gold: {
          light: '#E0BA6B',
          DEFAULT: '#C9971F',
          dark: '#9C7415',
        },
        skyblue: {
          DEFAULT: '#A9D0E5',
          soft: '#D7EAF3',
        },
        rose: {
          DEFAULT: '#D99B9B',
          soft: '#F3DEDE',
        },
        savory: {
          DEFAULT: '#A83B2E',
          soft: '#F0DCD6',
        },
        sweet: {
          DEFAULT: '#C9971F',
          soft: '#F3E4CC',
        },
        whatsapp: '#25D366',
      },
      fontFamily: {
        script: ['"Playball"', 'cursive'],
        display: ['"Playfair Display"', 'serif'],
        body: ['"Poppins"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px rgba(91, 58, 34, 0.10)',
        card: '0 4px 18px rgba(91, 58, 34, 0.08)',
      },
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'float-slow': 'float-slow 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
