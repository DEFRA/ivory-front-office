const Boom = require('@hapi/boom')
const { Registration } = require('../lib/cache')

module.exports = {
  plugin: {
    name: 'navigation',
    register: (server) => {
      server.ext('onPostAuth', async (request, h) => {
        const { path, settings } = request.route
        const { tags = [] } = settings
        const { registrationNumber } = await Registration.get(request) || {}

        // Always allow the following
        if (tags.includes('api') || path === '/' || path.startsWith('/assets/')) {
          return h.continue
        }

        // Check submitted tag
        if (tags.includes('submitted')) {
          if (!registrationNumber) {
            return Boom.notFound()
          }
        } else {
          if (registrationNumber) {
            return Boom.preconditionFailed('Registration already submitted', { registrationNumber })
          }
        }
        return h.continue
      })
    }
  }
}
