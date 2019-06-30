class OwnerAddressFindHandlers extends require('../base/address/address-find.handler') {
  get addressType () {
    return 'owner-address'
  }

  // Overrides parent class getPageHeading
  async getPageHeading (request) {
    const agent = await this.getCache(request, 'agent')
    if (agent) {
      return `Owner's address`
    }
    return `Your address`
  }
}

const handlers = new OwnerAddressFindHandlers()

module.exports = handlers.routes({
  path: '/owner-address-find',
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'base/address/address-find',
    nextPath: '/owner-address-select'
  }
})
