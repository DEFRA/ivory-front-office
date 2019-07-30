const utils = require('../../../lib/utils')

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
    const { agentIsOwner } = await utils.getCache(request, 'registration') || {}
    if (agentIsOwner) {
      return `Your address`
    }
    return `Owner's address`
  }
}
