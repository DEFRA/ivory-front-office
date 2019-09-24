const { Cache } = require('ivory-shared')
const { Registration } = require('../../lib/cache')

class HomeHandlers extends require('../common/handlers') {
  async handleGet (request, h, errors) {
    // Clear the cookies and create a new registration
    await Cache.clear(request)

    const registration = {
      // ToDo: Remove setting the agentIsOwner flag once "Who owns the item" page has been added
      agentIsOwner: true,
      status: 'draft'
    }
    await Registration.set(request, registration)

    return h.redirect('/item-type')
  }
}

const handlers = new HomeHandlers()

module.exports = handlers.routes({
  path: '/',
  app: {
    tags: ['always']
  }
})
