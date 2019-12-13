const { AgentAddress } = require('ivory-data-mapping').cache
const Handlers = require('defra-hapi-handlers')

async function getPath (routeId) {
  const flow = await Handlers.server.app.flow(routeId)
  return flow.path
}

module.exports = {

  get Address () {
    return AgentAddress
  },

  async findAddressLink () {
    return getPath('agent-address-find')
  },

  async selectAddressLink () {
    return getPath('agent-address-select')
  },

  async manualAddressLink () {
    return getPath('agent-address-full')
  }
}
