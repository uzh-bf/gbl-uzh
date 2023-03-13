const { TailwindColorsUZH } = require('@uzh-bf/design-system/dist/constants')
const { fontFamily } = require('tailwindcss/defaultTheme')

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
        sans: ['var(--source-sans-pro)', ...fontFamily.sans],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
  ],
  corePlugins: {
    preflight: false,
  },
}
