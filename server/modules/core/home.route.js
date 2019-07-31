class RestoreHandlers extends require('../common/handlers') {
  async handleGet (request, h, errors) {
    return h.redirect('/who-owns-item')
  }
}

const handlers = new RestoreHandlers()

module.exports = handlers.routes({
  path: '/'
})
