const Boom = require('@hapi/boom')
const { Registration } = require('../lib/cache')

module.exports = {
  plugin: {
    name: 'navigation',
    register: (server) => {
      server.ext('onPostAuth', async (request, h) => {
        const { settings } = request.route
        const { tags = [] } = settings
        const { status, registrationNumber } = await Registration.get(request) || {}

        // Always allow the following to continue
        if (tags.includes('always')) {
          return h.continue
        }

        // Check submitted tag
        if (tags.includes('submitted')) {
          if (status !== 'submitted') {
            return Boom.notFound()
          }
        } else {
          if (status === 'submitted') {
            return Boom.preconditionFailed('Registration already submitted', { registrationNumber })
          }
        }
        return h.continue
      })
    }
  }
}
