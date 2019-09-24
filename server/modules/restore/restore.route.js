const { Cache } = require('ivory-shared')
const syncRegistration = require('../../lib/sync-registration')

class RestoreHandlers extends require('../common/handlers') {
  async handleGet (request, h, errors) {
    // Clear the cookies and create a new registration
    await Cache.clear(request)
    const { id } = request.params
    await syncRegistration.restore(request, id)
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
