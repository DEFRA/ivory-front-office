
const { apiProxy } = require('defra-hapi-modules').plugins
const { serviceApi } = require('../config')

module.exports = {
  plugin: apiProxy,
  options: {
    serviceApi,
    path: '/api',
    tags: ['api', 'always']
  }
}
