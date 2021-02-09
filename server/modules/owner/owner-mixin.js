const { Registration } = require('../../lib/data-mapping/index').cache

module.exports = {
  async isOwner (request) {
    const { ownerType } = await Registration.get(request) || {}
    return ownerType === 'i-own-it'
  }
}
