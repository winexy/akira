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
      backgroundOpacity: ['active'],
      boxShadow: ['active']
    }
  },
  plugins: [require('tailwind-caret-color')()]
}
