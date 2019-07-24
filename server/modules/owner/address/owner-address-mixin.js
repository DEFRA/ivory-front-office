module.exports = {
  get addressType () {
    return 'owner-address'
  },

  get findAddressLink () {
    return '/owner-address'
  },

  get selectAddressLink () {
    return '/owner-address-select'
  },

  get manualAddressLink () {
    return '/owner-full-address'
  },

  // Overrides parent class getPageHeading
  async getPageHeading (request) {
    const { agentIsOwner } = await this.getCache(request, 'registration') || {}
    if (agentIsOwner === 'agent') {
      return `Your address`
    }
    return `Owner's address`
  }
}
