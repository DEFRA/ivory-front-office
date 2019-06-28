class OwnerNameHandlers extends require('../base/person/person-name.handler') {
  get personType () {
    return 'owner'
  }

  // Overrides parent class getPageHeading
  async getPageHeading (request) {
    const agent = this.getCache(request, 'agent')
    if (agent) {
      return `Owner's name`
    }
    return `Your name`
  }
}

const handlers = new OwnerNameHandlers()

module.exports = handlers.routes({
  path: '/owner-name',
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'base/person/person-name',
    nextPath: '/owner-address-find'
  }
})
