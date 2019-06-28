class OwnerAddressSelectHandlers extends require('../base/address/address-select.handler') {
  get addressType () {
    return 'owner-address'
  }
}

const handlers = new OwnerAddressSelectHandlers()

module.exports = handlers.routes({
  path: '/owner-address-select',
  app: {
    pageHeading: `Owner's address`,
    view: 'base/address/address-select',
    nextPath: '/item-description'
  }
})
