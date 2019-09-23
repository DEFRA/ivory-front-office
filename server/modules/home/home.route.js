const { Cache } = require('ivory-shared')
const { Registration } = require('../../lib/cache')

class HomeHandlers extends require('../common/handlers') {
  async handleGet (request, h, errors) {
    // Clear the cookies and create a new registration
    await Cache.clear(request)

    // ToDo: Remove setting the agentIsOwner flag once "Who owns the item" page has been added
    await Registration.set(request, { agentIsOwner: true })

    return h.redirect('/item-type')
  }
}

const handlers = new HomeHandlers()

module.exports = handlers.routes({
  path: '/'
})
