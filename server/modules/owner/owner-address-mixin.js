module.exports = {
  addressType: 'owner-address',
  manualAddressLink: '/owner-full-address',

  // Overrides parent class getPageHeading
  getPageHeading: async function (request) {
    const agent = await this.getCache(request, 'agent')
    if (agent) {
      return `Owner's address`
    }
    return `Your address`
  }
}
