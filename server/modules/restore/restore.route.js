const cache = require('../../lib/cache')

class RestoreHandlers extends require('ivory-common-modules').handlers {
  async handleGet (request, h) {
    await cache.restore(request, request.params.id)
    return h.redirect('/check-your-answers')
  }
}

const handlers = new RestoreHandlers()

module.exports = handlers.routes({
  path: '/restore/{id}',
  app: {
    tags: ['always']
  }
})
