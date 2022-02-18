const alias = require('./config/alias')

module.exports = {
  extends: ['airbnb', 'plugin:jsx-a11y/recommended', 'prettier'],
  plugins: ['jsx-a11y', 'react-hooks', 'jest'],
  env: {
    browser: true,
    'jest/globals': true,
  },
  overrides: [
    {
      files: ['**/*.ts?(x)'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      plugins: ['@typescript-eslint'],
    },
  ],
  rules: {
    'react/jsx-filename-extension': [
      1,
      {
        extensions: ['.tsx', '.jsx'],
      },
    ],
    'react/prop-types': 'off',
    camelcase: 'off',
    'comma-dangle': 'off',
    'eol-last': 'off',
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    'arrow-parens': 'off',
    'no-confusing-arrow': 'off',
    'no-unused-vars': 'off',
    'no-trailing-spaces': 'off',
    'no-use-before-define': 'off',
    'no-shadow': 'off',
    'no-bitwise': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        functions: false,
        classes: false,
      },
    ],
    'no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
        allowTernary: true,
      },
    ],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': [
      'warn',
      {
        additionalHooks: 'useDispatch',
      },
    ],
    'react/destructuring-assignment': 'off',
    'react/jsx-props-no-spreading': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'react/button-has-type': 'off',
    'implicit-arrow-linebreak': 'off',
    'arrow-body-style': 'off',
    'no-param-reassign': [
      'error',
      {props: true, ignorePropertyModificationsFor: ['draft', 'acc']},
    ],
    'object-curly-newline': 'off', // prefer prettier
    'no-undef': 'off', // false positive error,
    'no-nested-ternary': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {devDependencies: ['**/*.test.jsx', '**/*.test.tsx', '**/*.test.js']},
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      alias: {
        map: alias.eslint(),
        extensions: ['.jsx', '.jsx', '.ts', '.tsx'],
      },
    },
  },
}
