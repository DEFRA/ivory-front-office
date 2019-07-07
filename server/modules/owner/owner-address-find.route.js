const mixin = require('../../lib/mixin')
class OwnerAddressFindHandlers extends require('../common/address/address-find.handler') {}

const handlers = mixin(OwnerAddressFindHandlers, require('./owner-address-mixin'))

module.exports = handlers.routes({
  path: handlers.findAddressLink,
  app: {
    // pageHeading is derived in the getPageHeading method in the mixin
    view: 'common/address/address-find'
    // nextPath is derived in the getNextPath method in the address-find-handler
  }
})
