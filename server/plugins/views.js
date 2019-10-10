const path = require('path')
const nunjucks = require('nunjucks')
const config = require('../config')
const pkg = require('../../package.json')
const analyticsAccount = config.analyticsAccount

module.exports = {
  plugin: require('@hapi/vision'),
  options: {
    engines: {
      njk: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment)

          return (context) => {
            return template.render(context)
          }
        },

        prepare: (options, next) => {
          options.compileOptions.environment = nunjucks.configure([
            path.join(options.relativeTo || process.cwd(), options.path),
            'node_modules/govuk-frontend/',
            'node_modules/govuk-frontend/components/',
            'node_modules/ivory-common-modules/source/modules/'
          ], {
            autoescape: true,
            watch: false
          })

          return next()
        }
      }
    },
    path: '../modules',
    relativeTo: __dirname,
    isCached: !config.isDev,
    context: {
      appVersion: pkg.version,
      assetPath: '/assets',
      serviceName: config.serviceName,
      pageTitle: config.serviceName + ' - GOV.UK',
      analyticsAccount: analyticsAccount
    }
  }
}
