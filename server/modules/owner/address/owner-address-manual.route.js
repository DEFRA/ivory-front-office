const { mixin } = require('ivory-shared')
class OwnerAddressManualHandlers extends mixin(require('ivory-common-modules').address.manual.handlers, require('../owner-mixin'), require('./owner-address-mixin')) {
  // Overrides parent class getNextPath
  async getNextPath (request) {
    if (await this.isOwner(request)) {
      return '/owner-email'
    } else {
      return '/dealing-intent'
    }
  }
}

const handlers = new OwnerAddressManualHandlers()

module.exports = handlers.routes({
  path: handlers.manualAddressLink,
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'common/address-manual'
    // nextPath is derived in the getNextPath method above
  }
})
