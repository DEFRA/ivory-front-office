const { Registration, Owner } = require('../../lib/cache')

class OwnerNameHandlers extends require('../common/person/person-name.handlers') {
  get Person () {
    return Owner
  }

  // Overrides parent class getPageHeading
  async getPageHeading (request) {
    const { agentIsOwner } = await Registration.get(request) || {}
    if (agentIsOwner) {
      return 'Your name'
    }
    return 'Owner\'s name'
  }
}

const handlers = new OwnerNameHandlers()

module.exports = handlers.routes({
  path: '/owner-name',
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'common/person/person-name',
    nextPath: '/owner-full-address'
  }
})
