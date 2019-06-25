class OwnerNameHandlers extends require('../person/person-name.handler') {
  get personType () {
    return 'owner'
  }

  // Overrides parent class getPageHeading
  async getPageHeading (request) {
    const agent = request.yar.get('agent')
    if (agent) {
      return `Owner's name`
    }
    return `Your name`
  }
}

const handlers = new OwnerNameHandlers()

const path = '/owner-name'
const app = {
  // pageHeading is derived in the getPageHeading method above
  view: 'person/person-name',
  nextPath: '/owner-address-find'
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
