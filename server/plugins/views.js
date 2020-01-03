const { analyticsAccount, serviceName } = require('../config')
const pkg = require('../../package.json')

const viewOptions = require('hapi-govuk-frontend/lib/view-options')

const context = {
  appVersion: pkg.version,
  assetPath: '/assets',
  serviceName,
  pageTitle: serviceName + ' - GOV.UK',
  analyticsAccount: analyticsAccount
}

module.exports = {
  plugin: require('@hapi/vision'),
  options: viewOptions({
    viewPath: 'server/modules',
    context
  })
}
