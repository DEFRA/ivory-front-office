const nunjucks = require('nunjucks')
const folders = require('./find-njk-folders')

function compile (src, options) {
  const template = nunjucks.compile(src, options.environment)
  return (context) => template.render(context)
}

function prepare (options, next) {
  const { path } = options
  options.compileOptions.environment = nunjucks.configure(
    [`${process.cwd()}/${path}`, ...folders],
    {
      autoescape: true,
      watch: false
    })

  return next()
}

function viewOptions (options = {}) {
  const { context, viewPath: path } = options
  return {
    engines: {
      njk: { compile, prepare }
    },
    path,
    context
  }
}

module.exports = viewOptions
