const Persistence = require('../../../lib/persistence')
const persistence = new Persistence({ path: '/addresses' })

module.exports = {
  async getAddress (request) {
    return this.getCache(request, this.addressType) || {}
  },

  async setAddress (request, address, persistToDatabase) {
    if (persistToDatabase) {
      const { id, postcode, buildingNumber, street, town, county, country, uprn } = address
      const saved = await persistence.save({ id, postcode, buildingNumber, street, town, county, country, uprn })
      address.id = saved.id
    }
    return this.setCache(request, this.addressType, address)
  }
}
