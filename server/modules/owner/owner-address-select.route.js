class OwnerAddressSelectHandlers extends require('../address/address-select.handler') {
  get addressType () {
    return 'owner-address'
  }
}

const handlers = new OwnerAddressSelectHandlers()

const path = '/owner-address-select'
const app = {
  pageHeading: `Owner's address`,
  view: 'address/address-select',
  nextPath: '/item-description'
}

module.exports = [
  {
    method: 'GET',
    path,
    handler: handlers.getHandler,
    options: {
      app,
      bind: handlers
    }
  },
  {
    method: 'POST',
    path,
    handler: handlers.postHandler,
    options: {
      app,
      bind: handlers,
      validate: {
        payload: handlers.schema,
        failAction: handlers.failAction.bind(handlers)
      }
    }
  }
]
