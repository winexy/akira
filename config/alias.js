const path = require('path')
const {entries, map} = require('lodash')
const tsconfig = require('../tsconfig.json')

const tsConfigPaths = tsconfig.compilerOptions.paths

const root = path.join(__dirname, '..')

const removeWildCardPattern = fragment =>
  fragment.endsWith('/*') ? fragment.slice(0, -2) : fragment

const transformEntry = ([alias, [fullpath]]) =>
  map([alias, path.resolve(root, fullpath)], removeWildCardPattern)

module.exports = {
  eslint: map(entries(tsConfigPaths), transformEntry)
}
