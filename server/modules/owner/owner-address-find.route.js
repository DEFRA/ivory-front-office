class OwnerAddressFindHandlers extends require('../base/address/address-find.handler') {
  get addressType () {
    return 'owner-address'
  }
}

const handlers = new OwnerAddressFindHandlers()

module.exports = handlers.routes({
  path: '/owner-address-find',
  app: {
    pageHeading: `Owner's address`,
    view: 'base/address/address-find',
    nextPath: '/owner-address-select'
  }
})
