const { mixin } = require('ivory-shared')
class OwnerAddressManualHandlers extends mixin(require('../../common/address/address-manual.handlers'), require('../owner-mixin'), require('./owner-address-mixin')) {}

const handlers = new OwnerAddressManualHandlers()

module.exports = handlers.routes({
  path: handlers.manualAddressLink,
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'common/address/address-manual',
    nextPath: '/dealing-intent'
  }
})
