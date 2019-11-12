const cache = require('ivory-data-mapping').cache
const { getRoutes } = require('../../flow')

class RestoreHandlers extends require('ivory-common-modules').handlers {
  async handleGet (request, h) {
    await cache.restore(request, request.params.id)

    const nextPath = await this.getNextPath(request)

    return h.redirect(nextPath)
  }
}

const handlers = new RestoreHandlers()

const routes = getRoutes.bind(handlers)('restore')

module.exports = handlers.routes(routes).filter(({ method }) => method === 'GET')
