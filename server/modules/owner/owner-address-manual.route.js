const mixin = require('../../lib/mixin')
class OwnerAddressSelectHandlers extends require('../common/address/address-manual.handler') {}

const handlers = mixin(OwnerAddressSelectHandlers, require('./owner-address-mixin'))

module.exports = handlers.routes({
  path: handlers.manualAddressLink,
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'common/address/address-manual',
    nextPath: '/item-description'
  }
})
