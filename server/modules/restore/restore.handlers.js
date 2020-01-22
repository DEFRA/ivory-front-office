const cache = require('ivory-data-mapping').cache
const { Registration } = cache

class RestoreHandlers extends require('defra-hapi-handlers') {
  async isSubmitted (request) {
    const registration = await Registration.get(request)
    return registration.status === 'submitted'
  }

  async handleGet (request, h) {
    await cache.restore(request, request.params.id)

    const nextPath = await this.getNextPath(request)

    return h.redirect(nextPath)
  }
}

module.exports = RestoreHandlers
