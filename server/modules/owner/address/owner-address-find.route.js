const { mixin } = require('ivory-shared')
class OwnerAddressFindHandlers extends mixin(require('../../common/address/address-find.handlers'), require('./owner-address-mixin')) {}

const handlers = new OwnerAddressFindHandlers()

module.exports = handlers.routes({
  path: handlers.findAddressLink,
  app: {
    // pageHeading is derived in the getPageHeading method in the mixin
    view: 'common/address/address-find'
    // nextPath is derived in the getNextPath method in the address-find-handler
  }
})
