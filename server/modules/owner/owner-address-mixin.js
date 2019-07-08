module.exports = {
  get findAddressLink () {
    return '/owner-address'
  },

  get selectAddressLink () {
    return '/owner-address-select'
  },

  get manualAddressLink () {
    return '/owner-full-address'
  },

  async getAddress (request) {
    return this.getCache(request, 'owner-address') || {}
  },

  async setAddress (request, address) {
    return this.setCache(request, 'owner-address', address)
  },

  // Overrides parent class getPageHeading
  async getPageHeading (request) {
    const { ownerIsAgent } = await this.getCache(request, 'item') || {}
    if (ownerIsAgent) {
      return `Your address`
    }
    return `Owner's address`
  }
}
