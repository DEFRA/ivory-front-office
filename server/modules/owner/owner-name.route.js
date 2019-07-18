const mixin = require('../../lib/mixin')
class OwnerNameHandlers extends mixin(require('../common/person/person-name.handlers'), require('./owner-person-mixin')) {
  // Overrides parent class getPageHeading
  async getPageHeading (request) {
    const { agentIsOwner } = await this.getCache(request, 'registration') || {}
    if (agentIsOwner === 'agent') {
      return `Your name`
    }
    return `Owner's name`
  }
}

const handlers = new OwnerNameHandlers()

module.exports = handlers.routes({
  path: '/owner-name',
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'common/person/person-name',
    nextPath: '/owner-email'
  }
})
