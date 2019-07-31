const syncRegistration = require('../../lib/sync-registration')

class RestoreHandlers extends require('../common/handlers') {
  async handleGet (request, h, errors) {
    const { id } = request.params
    await syncRegistration.restore(request, id)
    return h.redirect('/who-owns-item')
  }
}

const handlers = new RestoreHandlers()

module.exports = handlers.routes({
  path: '/restore/{id}'
})
