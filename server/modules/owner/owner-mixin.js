const { Registration } = require('ivory-data-mapping').cache

module.exports = {
  async isOwner (request) {
    const { ownerType } = await Registration.get(request) || {}
    return ownerType === 'i-own-it'
  }
}
