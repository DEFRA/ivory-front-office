
const { analyticsAccount, serviceName } = require('../config')
const pkg = require('../../package.json')

module.exports = {
  plugin: require('hapi-govuk-frontend'),
  options: {
    analyticsAccount,
    assetPath: '/assets',
    assetDirectories: ['public/static', 'public/build'],
    serviceName,
    viewPath: 'server/modules',
    context: {
      appVersion: pkg.version
    },
    options: {
      tags: ['asset', 'always']
    }
  }
}
