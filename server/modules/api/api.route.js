const { Persistence } = require('defra-hapi-utils')
const querystring = require('querystring')
const { serviceApi, isProd } = require('../../config')

const routes = []

if (!isProd) {
  routes.push({
    method: 'GET',
    path: '/api/{model}/{id?}',
    handler: async (request) => {
      const query = querystring.stringify(request.query)
      const path = `${serviceApi}${request.path}${query ? `?${query}` : ''}`.replace('/api', '')
      const persistence = new Persistence({ path })
      return persistence.restore()
    },
    options: {
      tags: ['api', 'always'],
      security: true
    }
  })
}

module.exports = routes
