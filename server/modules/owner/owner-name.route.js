const mixin = require('../../lib/mixin')
class OwnerNameHandlers extends mixin(require('../common/person/person-name.handler'), require('./owner-person-mixin')) {
  // Overrides parent class getPageHeading
  async getPageHeading (request) {
    const { ownerIsAgent } = await this.getCache(request, 'item') || {}
    if (ownerIsAgent) {
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
