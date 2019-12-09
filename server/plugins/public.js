module.exports = {
  plugin: require('hapi-public-route'),
  options: {
    path: '/assets/{path*}',
    directories: [
      'public/static',
      'public/build',
      'node_modules/govuk-frontend/govuk',
      'node_modules/govuk-frontend/govuk/assets'
    ],
    tags: ['asset', 'always']
  }
}
