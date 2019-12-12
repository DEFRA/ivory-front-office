const { serviceApi } = require('../config')

module.exports = {
  plugin: require('hapi-proxy-get'),
  options: {
    uri: serviceApi,
    path: '/api',
    options: {
      tags: ['api', 'always']
    }
  }
}
