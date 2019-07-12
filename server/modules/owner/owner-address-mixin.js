const Persistence = require('../common/persistence')
const persistence = new Persistence({ path: '/addresses' })

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

  async setAddress (request, address, persistToDatabase) {
    if (persistToDatabase) {
      const { id, postcode, buildingNumber, street, town, county, country, uprn } = address
      const saved = await persistence.save({ id, postcode, buildingNumber, street, town, county, country, uprn })
      address.id = saved.id
    }
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
