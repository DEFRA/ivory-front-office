const syncRegistration = require('../../../lib/sync-registration')
const { utils } = require('ivory')

module.exports = {
  async getPerson (request) {
    return await utils.getCache(request, this.personType) || {}
  },

  async setPerson (request, person, persistToDatabase) {
    await utils.setCache(request, this.personType, person)
    if (persistToDatabase) {
      return syncRegistration.save(request)
    }
  }
}
