const TailwindCaretColor = require('tailwind-caret-color')

module.exports = {
  purge: ['./src/**/*.tsx'],
  darkMode: false,
  theme: {
    extend: {}
  },
  variants: {
    extend: {
      textColor: ['active'],
      backgroundColor: ['active'],
      borderColor: ['active'],
      scale: ['active'],
      backgroundOpacity: ['active'],
      boxShadow: ['active']
    }
  },
  plugins: [TailwindCaretColor()]
}
