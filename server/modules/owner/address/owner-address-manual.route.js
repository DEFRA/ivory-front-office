const { mixin } = require('ivory-shared')
class OwnerAddressManualHandlers extends mixin(require('ivory-common-modules').address.manual.handlers, require('../owner-mixin'), require('./owner-address-mixin')) {}

const handlers = new OwnerAddressManualHandlers()

module.exports = handlers.routes({
  path: handlers.manualAddressLink,
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'common/address-manual',
    nextPath: '/owner-email'
  }
})
