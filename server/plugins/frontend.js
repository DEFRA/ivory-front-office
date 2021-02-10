
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
    context: {
      appVersion: pkg.version
    },
    options: {
      tags: ['asset', 'always']
    }
  }
}
