module.exports = {
  addressType: 'owner-address',
  manualAddressLink: '/owner-full-address',

  // Overrides parent class getPageHeading
  getPageHeading: async function (request) {
    const { ownerIsAgent } = await this.getCache(request, 'item') || {}
    if (ownerIsAgent) {
      return `Your address`
    }
    return `Owner's address`
  }
}
