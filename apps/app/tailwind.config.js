/* eslint-disable import/no-extraneous-dependencies */
const TwCaretColor = require('tailwind-caret-color')
const TwPaddingSafe = require('tailwindcss-padding-safe')

module.exports = {
  mode: 'jit',
  purge: {
    content: ['./src/**/*.tsx', './src/**/*.ts']
  },
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
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
