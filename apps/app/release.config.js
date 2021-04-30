const pkg = require('./package.json')

module.exports = {
  branches: 'master',
  repositoryUrl: pkg.repository.url,
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/github',
      {
        assets: [
          {path: 'build.zip', label: 'Build'},
          {path: 'coverage.zip', label: 'Coverage'}
        ]
      }
    ]
  ]
}
