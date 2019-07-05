const mixin = require('../../lib/mixin')
class OwnerAddressFindHandlers extends require('../common/address/address-find.handler') {}

const handlers = mixin(new OwnerAddressFindHandlers(), require('./owner-address-mixin'))

module.exports = handlers.routes({
  path: '/owner-address',
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'common/address/address-find',
    nextPath: '/owner-address-select'
  }
})
