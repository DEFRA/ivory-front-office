const mixin = require('../../lib/mixin')
class OwnerAddressSelectHandlers extends require('../common/address/address-select.handler') {}

const handlers = mixin(new OwnerAddressSelectHandlers(), require('./owner-address-mixin'))

module.exports = handlers.routes({
  path: '/owner-address-select',
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'common/address/address-select',
    nextPath: '/item-description'
  }
})
