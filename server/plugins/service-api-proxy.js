const { serviceApi } = require('../config')

module.exports = {
  plugin: {
    name: 'defra-ivory-service-api-proxy',
    register: (server) => {
      server.register([
        {
          plugin: require('hapi-proxy-get'),
          options: {
            uri: serviceApi,
            path: '/api',
            options: {
              tags: ['api', 'always']
            }
          }
        }, {
          plugin: require('hapi-proxy-get'),
          options: {
            uri: `${serviceApi}/swaggerui`,
            path: '/swaggerui',
            options: {
              tags: ['always']
            }
          }
        }, {
          plugin: require('hapi-proxy-get'),
          options: {
            uri: `${serviceApi}`,
            path: '',
            options: {
              tags: ['always']
            }
          }
        }
      ])
    }
  }
}
