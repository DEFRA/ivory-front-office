const path = require('path')
const nunjucks = require('nunjucks')
const config = require('../config')
const pkg = require('../../package.json')
const analyticsAccount = config.analyticsAccount
const glob = require('glob')

const moduleTemplates = glob.sync('./node_modules/**/*.njk')

const macroFolders = [...new Set(moduleTemplates
  .filter((file) => file.endsWith('/macro.njk'))
  .map((file) => file
    .split('/')
    .slice(0, -2)
    .join('/')
  ))]

const folders = moduleTemplates
  .reduce((folders = [], file) => {
    if (!macroFolders.filter((folder) => file.startsWith(folder)).length) {
      const folder = file
        .split('/')
        .slice(0, -1)
        .join('/')
      if (!folders.includes(folder)) {
        folders.push(folder)
      }
    }
    return folders
  }, macroFolders)
  .map((folder) => folder.substring(2))
  .sort()

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
          options.compileOptions.environment = nunjucks.configure(
            [path.join(options.relativeTo || process.cwd(), options.path), ...folders],
            {
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
