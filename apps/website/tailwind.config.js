const { TailwindColorsUZH, TailwindFontsUZH } = require('@uzh-bf/design-system/dist/constants')

/** @type {import('tailwindcss').Config} \*/
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        lg: '72rem',
      },
      colors: {
        ...TailwindColorsUZH,
      },
      fontFamily: {
        ...TailwindFontsUZH,
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
  ],
  corePlugins: {
    preflight: false,
  },
}
