const Boom = require('@hapi/boom')
const { Registration } = require('ivory-data-mapping').cache

module.exports = {
  plugin: {
    name: 'navigation',
    register: (server) => {
      server.ext('onPostAuth', async (request, h) => {
        const { settings } = request.route
        const { tags = [] } = settings

        // Always allow the following to continue
        if (tags.includes('always')) {
          return h.continue
        }

        const registration = await Registration.get(request)

        if (!registration) {
          return Boom.preconditionFailed('Registration doesn\'t exist yet')
        }

        // Check submitted tag
        if (tags.includes('submitted')) {
          if (registration.status !== 'submitted') {
            return Boom.notFound()
          }
        } else {
          const { status, registrationNumber } = registration
          if (status === 'submitted') {
            return Boom.preconditionFailed('Registration already submitted', { registrationNumber })
          }
        }

        return h.continue
      })
    }
  }
}
