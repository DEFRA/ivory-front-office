const mixin = require('../../lib/mixin')
class OwnerAddressSelectHandlers extends require('../common/address/address-select.handler') {}

const handlers = mixin(OwnerAddressSelectHandlers, require('./owner-address-mixin'))

module.exports = handlers.routes({
  path: handlers.selectAddressLink,
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'common/address/address-select',
    nextPath: '/item-description'
  }
})
