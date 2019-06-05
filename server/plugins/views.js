const path = require('path')
const nunjucks = require('nunjucks')
const config = require('../config')
const pkg = require('../../package.json')
const analyticsAccount = config.analyticsAccount

module.exports = {
  plugin: require('vision'),
  options: {
    engines: {
      // TODO: I swapped the nunjucks engine for the html engine.  I couldn't figure out how to have both .njk and .html views.  If you uncomment this and have both, it works, but you need to explicitly state the view extension, e.g. test.html, rather than just test (not sure why)
      // njk: {
      //   compile: (src, options) => {
      //     const template = nunjucks.compile(src, options.environment)
      //
      //     return (context) => {
      //       return template.render(context)
      //     }
      //   },
      //   prepare: (options, next) => {
      //     options.compileOptions.environment = nunjucks.configure([
      //       path.join(options.relativeTo || process.cwd(), options.path),
      //       'node_modules/govuk-frontend/',
      //       'node_modules/govuk-frontend/components/'
      //     ], {
      //       autoescape: true,
      //       watch: false
      //     })
      //
      //     return next()
      //   }
      // },
      html: {
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
            'node_modules/govuk-frontend/components/'
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
