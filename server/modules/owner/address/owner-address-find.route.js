const { mixin } = require('ivory-shared')
const config = require('../../../config')
class OwnerAddressFindHandlers extends mixin(require('ivory-common-modules').address.find.handlers, require('../owner-mixin'), require('./owner-address-mixin')) {}

const handlers = new OwnerAddressFindHandlers(config)

module.exports = handlers.routes({
  path: handlers.findAddressLink,
  app: {
    // pageHeading is derived in the getPageHeading method in the mixin
    view: 'common/address-find'
    // nextPath is derived in the getNextPath method in the address-find-handler
  }
})
