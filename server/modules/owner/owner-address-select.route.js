class OwnerAddressSelectHandlers extends require('../base/address/address-select.handler') {
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

const handlers = new OwnerAddressSelectHandlers()

module.exports = handlers.routes({
  path: '/owner-address-select',
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'base/address/address-select',
    nextPath: '/item-description'
  }
})
