/* eslint-disable import/no-extraneous-dependencies */
const TwCaretColor = require('tailwind-caret-color')
const TwPaddingSafe = require('tailwindcss-padding-safe')

module.exports = {
  content: ['./src/**/*.tsx', './src/**/*.ts'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#7E7E7E',
          100: '#717171',
          200: '#5A5A5A',
          300: '#505050',
          400: '#474747',
          500: '#383838',
          600: '#2E2E2E',
          700: '#292929',
          800: '#212121',
          900: '#121212'
        }
      }
    }
  },
  plugins: [TwCaretColor(), TwPaddingSafe()]
}
