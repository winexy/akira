/* eslint-disable import/no-extraneous-dependencies */
const TwCaretColor = require('tailwind-caret-color')
const TwPaddingSafe = require('tailwindcss-padding-safe')

module.exports = {
  purge: {
    content: ['./src/**/*.tsx', './src/**/*.ts']
  },
  darkMode: 'class',
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
      ringWidth: ['active', 'focus-visible'],
      ringColor: ['active', 'focus-visible']
    }
  },
  plugins: [TwCaretColor(), TwPaddingSafe()]
}
