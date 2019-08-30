const { utils } = require('ivory-shared')

class RestoreHandlers extends require('../common/handlers') {
  async handleGet (request, h, errors) {
    // Clear the cookies and create a new registration
    await utils.clearCache()

    // ToDo: Remove setting the agentIsOwner flag once "Who owns the item" page has been added
    await utils.setCache(request, 'registration', { agentIsOwner: true }, true)

    return h.redirect('/item-description')
  }
}

const handlers = new RestoreHandlers()

module.exports = handlers.routes({
  path: '/'
})
