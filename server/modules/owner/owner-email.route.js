const { utils } = require('ivory-shared')

class OwnerNameHandlers extends require('../common/person/person-email.handlers') {
  get personType () {
    return 'owner'
  }

  // Overrides parent class getPageHeading
  async getPageHeading (request) {
    const { agentIsOwner } = await utils.getCache(request, 'registration') || {}
    if (agentIsOwner) {
      return `Your email address`
    }
    return `Owner's email address`
  }
}

const handlers = new OwnerNameHandlers()

module.exports = handlers.routes({
  path: '/owner-email',
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'common/person/person-email',
    nextPath: '/owner-address'
  }
})
