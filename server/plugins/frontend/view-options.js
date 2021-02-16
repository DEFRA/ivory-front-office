const nunjucks = require('nunjucks')

function njkOptions (options) {
  const { includePaths = [] } = options
  if (includePaths.length === 0) {
    includePaths.concat(require('./find-njk-folders'))
  }

  function compile (src, options) {
    const template = nunjucks.compile(src, options.environment)
    return (context) => template.render(context)
  }

  function prepare (options, next) {
    const { path } = options
    const paths = [`${process.cwd()}/${path}`, ...includePaths]
    options.compileOptions.environment = nunjucks.configure(
      paths,
      {
        autoescape: true,
        watch: false
      })

    return next()
  }

  return { compile, prepare }
}

function viewOptions (options = {}) {
  const { context, viewPath: path } = options
  return {
    engines: {
      njk: njkOptions(options)
    },
    path,
    context
  }
}

module.exports = viewOptions
