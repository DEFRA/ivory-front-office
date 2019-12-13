const { OwnerAddress } = require('ivory-data-mapping').cache
const Handlers = require('defra-hapi-handlers')

async function getPath (routeId) {
  const flow = await Handlers.server.app.flow(routeId)
  return flow.path
}

module.exports = {
  get Address () {
    return OwnerAddress
  },

  async findAddressLink () {
    return getPath('owner-address-find')
  },

  async selectAddressLink () {
    return getPath('owner-address-select')
  },

  async manualAddressLink () {
    return getPath('owner-address-full')
  }
}
