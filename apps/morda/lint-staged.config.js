module.exports = {
  '*.{js,jsx,ts,tsx}': 'eslint --fix',
  '*.{js,jsx,ts,tsx,json,css,md,yml}': 'prettier --write',
  './.github/actions/*/index.js': files => {
    return files
      .map(path => {
        const [, action] = path.match(/actions\/(.+)\/index.js/)
        return `yarn run compile-action --action=${action}`
      })
      .concat(`git add ./.github/actions/*/dist/index.js`)
  },
}
