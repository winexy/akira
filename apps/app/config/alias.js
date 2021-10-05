const path = require('path')
const {toPairs, map, fromPairs, pipe, first, last} = require('lodash/fp')
const tsconfig = require('../tsconfig.json')

const tsConfigPaths = tsconfig.compilerOptions.paths

const root = path.join(__dirname, '..')

const withoutWildCard = fragment =>
  fragment.endsWith('/*') ? fragment.slice(0, -2) : fragment

const unpackPair = ([alias, paths]) => [alias, first(paths)]

const toESLint = pipe(
  toPairs,
  map(pair => {
    const [alias, fullpath] = unpackPair(pair)
    const resolvedPath = path.resolve(root, fullpath)
    return map(withoutWildCard)([alias, resolvedPath])
  })
)

const toRollup = pipe(toESLint, fromPairs)

const toJestMapper = pipe(
  toPairs,
  map(pair => {
    const [alias, fullpath] = unpackPair(pair)
    const withoutPrefix = fullpath => fullpath.replace(/^\.\//, '')
    const toAliasRegex = alias => `^${alias}(.*)$`
    const toPathRegex = path => `<rootDir>/${path}/$1`

    return [
      pipe(withoutWildCard, toAliasRegex)(alias),
      pipe(withoutWildCard, withoutPrefix, toPathRegex)(fullpath)
    ]
  }),
  fromPairs
)

module.exports = {
  eslint: () => toESLint(tsConfigPaths),
  rollup: () => toRollup(tsConfigPaths),
  jest: () => toJestMapper(tsConfigPaths)
}
