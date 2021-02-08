const querystring = require('querystring')
const h2o2 = require('@hapi/h2o2')

const register = function (server, opts = {}) {
  // Set options with defaults if required
  const { path = '/proxy', uri, options = {} } = opts

  if (!server.plugins[h2o2.plugin.name]) {
    server.register([h2o2])
  }

  server.route({
    method: 'GET',
    path: `${path}/{path*}`,
    handler: {
      proxy: {
        passThrough: true,
        mapUri: (request) => {
          const { path } = request.params
          const query = querystring.stringify(request.query)
          return { uri: `${uri}/${path}${query ? `?${query}` : ''}` }
        }
      }
    },
    options
  })
}

exports.plugin = {
  name: 'hapi-proxy-get',
  register,
  multiple: true
}
