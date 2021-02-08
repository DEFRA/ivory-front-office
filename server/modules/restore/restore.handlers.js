const Boom = require('@hapi/boom')
const cache = require('ivory-data-mapping').cache
const { Registration } = cache

class RestoreHandlers extends require('../../lib/handlers/handlers') {
  async isSubmitted (request) {
    const registration = await Registration.get(request)
    return registration.status === 'submitted'
  }

  async handleGet (request, h) {
    await cache.restore(request, request.params.id)

    const registration = await Registration.get(request)
    if (!registration.id) {
      return Boom.notFound()
    }

    const nextPath = await this.getNextPath(request)

    return h.redirect(nextPath)
  }
}

module.exports = RestoreHandlers
