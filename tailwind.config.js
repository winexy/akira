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
      backgroundOpacity: ['active']
    }
  },
  plugins: [require('tailwind-caret-color')()]
}
