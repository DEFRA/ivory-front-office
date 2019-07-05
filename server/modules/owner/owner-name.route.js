class OwnerNameHandlers extends require('../common/person/person-name.handler') {
  get personType () {
    return 'owner'
  }

  // Overrides parent class getPageHeading
  async getPageHeading (request) {
    const agent = await this.getCache(request, 'agent')
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
    view: 'common/person/person-name',
    nextPath: '/owner-address'
  }
})
