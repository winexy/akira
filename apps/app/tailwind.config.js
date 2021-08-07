/* eslint-disable import/no-extraneous-dependencies */
const TwCaretColor = require('tailwind-caret-color')
const TwPaddingSafe = require('tailwindcss-padding-safe')

module.exports = {
  purge: ['./src/**/*.tsx'],
  darkMode: false,
  theme: {
    extend: {}
  },
  variants: {
    extend: {
      textColor: ['active', 'disabled'],
      backgroundColor: ['active', 'disabled'],
      borderColor: ['active', 'disabled'],
      scale: ['active'],
      backgroundOpacity: ['active'],
      boxShadow: ['active', 'disabled'],
      backgroundImage: ['active'],
      gradientColorStops: ['active'],
      ringWidth: ['active'],
      ringColor: ['active']
    }
  },
  plugins: [TwCaretColor(), TwPaddingSafe()]
}
