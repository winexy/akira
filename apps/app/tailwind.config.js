module.exports = {
  purge: ['./src/**/*.jsx'],
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
