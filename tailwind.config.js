/* eslint-disable import/no-extraneous-dependencies */
const TailwindCaretColor = require('tailwind-caret-color')

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
      boxShadow: ['active', 'disabled']
    }
  },
  plugins: [TailwindCaretColor()]
}
