const { serviceApi } = require('../config')
const wreck = require('@hapi/wreck')

module.exports = {
  plugin: {
    name: 'defra-ivory-service-api-proxy',
    register: (server) => {
      server.register([
        {
          plugin: require('./proxy-get/index'),
          options: {
            uri: serviceApi,
            path: '/api',
            options: {
              tags: ['api', 'always']
            }
          }
        }, {
          plugin: require('./proxy-get/index'),
          options: {
            uri: `${serviceApi}/swaggerui`,
            path: '/swaggerui',
            options: {
              tags: ['always']
            }
          }
        }
      ])

      // Make sure swagger json base url is the host/api
      server.route({
        method: 'GET',
        path: '/swagger.json',
        handler: {
          proxy: {
            localStatePassThrough: true,
            mapUri: () => {
              return { uri: `${serviceApi}/swagger.json` }
            },
            onResponse: async (err, res, request, h, settings, ttl) => {
              if (err) {
                throw new Error(err.message)
              }
              const body = await wreck.read(res, { json: true }, (err, payload) => {
                if (err) {
                  throw new Error(err.message)
                }
                const response = h.response(payload)
                response.headers = res.headers
                return response
              })
              body.host = request.info.host
              body.basePath = '/api'
              body.schemes = [request.info.referrer.split(':')[0]]
              return body
            }
          }
        },
        options: {
          tags: ['always']
        }
      })
    }
  }
}
