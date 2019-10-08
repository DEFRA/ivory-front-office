const { mixin } = require('ivory-shared')
class OwnerAddressSelectHandlers extends mixin(require('ivory-common-modules').address.select.handlers, require('../owner-mixin'), require('./owner-address-mixin')) {}

const handlers = new OwnerAddressSelectHandlers()

module.exports = handlers.routes({
  path: handlers.selectAddressLink,
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'common/address-select',
    nextPath: '/owner-email'
  }
})
