const pkg = require('./package.json')

module.exports = {
  branches: 'master',
  repositoryUrl: pkg.repository.url,
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
        tarballDir: 'dist'
      }
    ],
    [
      '@semantic-release/github',
      {
        assets: [
          'package.json',
          {path: 'build.zip', label: 'Build'},
          {path: 'coverage.zip', label: 'Coverage'}
        ],
        message:
          // eslint-disable-next-line
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ]
  ]
}
