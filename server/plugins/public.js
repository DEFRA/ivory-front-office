const plugins = require('defra-hapi-modules').plugins

module.exports = {
  plugin: plugins.public,
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
