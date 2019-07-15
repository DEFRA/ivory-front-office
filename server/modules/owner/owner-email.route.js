const mixin = require('../../lib/mixin')
class OwnerNameHandlers extends mixin(require('../common/person/person-email.handler'), require('./owner-person-mixin')) {
  // Overrides parent class getPageHeading
  async getPageHeading (request) {
    const { ownerIsAgent } = await this.getCache(request, 'item') || {}
    if (ownerIsAgent) {
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
