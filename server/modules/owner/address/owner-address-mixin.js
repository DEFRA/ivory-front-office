const { OwnerAddress } = require('../../../lib/cache')

module.exports = {
  get Address () {
    return OwnerAddress
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
    if (await this.isOwner(request)) {
      return 'Your address'
    }
    return 'Owner\'s address'
  }
}
