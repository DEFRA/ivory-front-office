const syncRegistration = require('../../../lib/sync-registration')
const { utils } = require('ivory-shared')

module.exports = {
  async getAddress (request) {
    return await utils.getCache(request, this.addressType) || {}
  },

  async setAddress (request, address, persistToDatabase) {
    await utils.setCache(request, this.addressType, address)
    if (persistToDatabase) {
      return syncRegistration.save(request)
    }
  }
}
