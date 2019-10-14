const { mixin } = require('ivory-shared')
class OwnerAddressSelectHandlers extends mixin(require('ivory-common-modules').address.select.handlers, require('../owner-mixin'), require('./owner-address-mixin')) {
  // Overrides parent class getNextPath
  async getNextPath (request) {
    if (await this.isOwner(request)) {
      return '/owner-email'
    } else {
      return '/dealing-intent'
    }
  }
}

const handlers = new OwnerAddressSelectHandlers()

module.exports = handlers.routes({
  path: handlers.selectAddressLink,
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'common/address-select'
    // nextPath is derived in the getNextPath method above
  }
})
