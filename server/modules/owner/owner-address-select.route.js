const mixin = require('../../lib/mixin')
class OwnerAddressSelectHandlers extends mixin(require('../common/address/address-select.handlers'), require('./owner-address-mixin')) {}

const handlers = new OwnerAddressSelectHandlers()

module.exports = handlers.routes({
  path: handlers.selectAddressLink,
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'common/address/address-select',
    nextPath: '/item-description'
  }
})
