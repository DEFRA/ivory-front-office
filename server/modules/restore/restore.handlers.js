const cache = require('ivory-data-mapping').cache

class RestoreHandlers extends require('defra-hapi-modules').handlers {
  async handleGet (request, h) {
    await cache.restore(request, request.params.id)

    const nextPath = await this.getNextPath(request)

    return h.redirect(nextPath)
  }
}

module.exports = RestoreHandlers
