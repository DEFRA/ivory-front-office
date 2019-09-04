const { Registration } = require('../../lib/cache')

module.exports = {
  async isOwner (request) {
    const { agentIsOwner } = await Registration.get(request) || {}
    return agentIsOwner
  }
}
