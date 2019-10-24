module.exports = [{
  method: 'GET',
  path: '/assets/all.js',
  handler: {
    file: 'node_modules/govuk-frontend/govuk/all.js'
  },
  options: {
    tags: ['asset', 'always']
  }
}, {
  method: 'GET',
  path: '/assets/{path*}',
  handler: {
    directory: {
      path: [
        'public/static',
        'public/build',
        'node_modules/govuk-frontend/govuk/assets'
      ]
    }
  },
  options: {
    tags: ['asset', 'always']
  }
}]
