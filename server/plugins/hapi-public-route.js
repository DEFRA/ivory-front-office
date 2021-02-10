const register = function (server, opts = {}) {
  // Set options with defaults if required
  const {
    path = '/public/{path*}', directories = ['public'], options = {}
  } = opts

  server.register([require('@hapi/inert')])

  server.route({
    method: 'GET',
    path,
    handler: {
      directory: {
        path: directories
      }
    },
    options
  })
}

exports.plugin = {
  name: 'hapi-public-route',
  register,
  once: true
}
