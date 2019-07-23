class OwnerNameHandlers extends require('../common/person/person-name.handlers') {
  get personType () {
    return 'owner'
  }

  // Overrides parent class getPageHeading
  async getPageHeading (request) {
    const { agentIsOwner } = await this.getCache(request, 'registration') || {}
    if (agentIsOwner === 'agent') {
      return `Your name`
    }
    return `Owner's name`
  }
}

const handlers = new OwnerNameHandlers()

module.exports = handlers.routes({
  path: '/owner-name',
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'common/person/person-name',
    nextPath: '/owner-email'
  }
})
