module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      cursor: {
        'zoom-out': 'zoom-out',
        'zoom-in': 'zoom-in',
      },
      maxWidth: {
        '1/3': '33%',
      },
      maxHeight: {
        '4/5vh': '80vh',
      },
      width: {
        '1/4vw': '28vw',
        '4/5vw': '80vw',
      },
      height: {
        '1/4vw': '28vw',
        '4/5vh': '80vh',
      },
      screens: {
        lg: '72rem',
      },
      flex: {
        '0_0_50px': '0 0 50px',
      },
      fontFamily: {
        'kollektif-bold': [
          'kollektif-bold',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
  ],
}
