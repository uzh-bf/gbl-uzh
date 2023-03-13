/** @type {import('tailwindcss').Config} */

const { fontFamily } = require('tailwindcss/defaultTheme')

const { TailwindColorsUZH } = require('@uzh-bf/design-system/dist/constants')

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      colors: {
        ...TailwindColorsUZH,
      },
      fontFamily: {
        'source-sans': ['var(--font-uzh)', ...fontFamily.sans],
      },
    },
  },

  plugins: [],

  corePlugins: {
    preflight: false,
  },
}
