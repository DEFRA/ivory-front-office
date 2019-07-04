module.exports = [{
  method: 'GET',
  path: '/assets/all.js',
  handler: {
    file: 'node_modules/govuk-frontend/all.js'
  },
  options: {
    tags: ['asset']
  }
}, {
  method: 'GET',
  path: '/assets/{path*}',
  handler: {
    directory: {
      path: [
        'public/static',
        'public/build',
        'node_modules/govuk-frontend/assets'
      ]
    }
  },
  options: {
    tags: ['asset']
  }
}]
