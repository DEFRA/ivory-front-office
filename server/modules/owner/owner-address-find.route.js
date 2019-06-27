class OwnerAddressFindHandlers extends require('../address/address-find.handler') {
  get addressType () {
    return 'owner-address'
  }
}

const handlers = new OwnerAddressFindHandlers()

const path = '/owner-address-find'
const app = {
  pageHeading: `Owner's address`,
  view: 'address/address-find',
  nextPath: '/owner-address-select'
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
