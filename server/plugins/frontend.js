
const { analyticsAccount, serviceName } = require('../config')
const pkg = require('../../package.json')

module.exports = {
  plugin: require('./frontend/index'),
  options: {
    analyticsAccount,
    assetPath: '/assets',
    assetDirectories: ['public/static', 'public/build'],
    serviceName,
    viewPath: 'server/modules',
    includePaths: [
      // folders where partial views and macros can be found
      // if this is not specified (not recommended) an attempt will be made crawling the node_modules to find the paths
      'node_modules/govuk-frontend',
      'node_modules/govuk-frontend/govuk/components',
      'server/plugins/error-pages/views',
      'server/lib/handlers/layouts'
    ],
    context: {
      appVersion: pkg.version
    },
    options: {
      tags: ['asset', 'always']
    }
  }
}
