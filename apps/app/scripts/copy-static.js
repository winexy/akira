const fs = require('fs')
const {join} = require('path')

const root = process.cwd()
const dist = join(root, 'dist')

const copyFile = (fileName, from, to) => {
  const [source, dest] = [from, to].map(path => join(path, fileName))
  fs.copyFileSync(source, dest)
  global.console.log(`📦 ${source} copied to ${dest}`)
}

function main() {
  copyFile('_redirects', root, dist)
}

main()
