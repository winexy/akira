const path = require('path')
const {entries, map, fromPairs} = require('lodash')
const tsconfig = require('../tsconfig.json')

const tsConfigPaths = tsconfig.compilerOptions.paths

const root = path.join(__dirname, '..')

const removeWildCardPattern = fragment =>
  fragment.endsWith('/*') ? fragment.slice(0, -2) : fragment

function toRollup(paths) {
  return fromPairs(toESLint(paths))
}

function toESLint(paths) {
  return map(entries(paths), ([alias, [fullpath]]) => {
    const resolvedPath = path.resolve(root, fullpath)
    return map([alias, resolvedPath], removeWildCardPattern)
  })
}

module.exports = {
  eslint: toESLint(tsConfigPaths),
  rollup: toRollup(tsConfigPaths)
}
