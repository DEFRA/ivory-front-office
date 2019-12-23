const { AgentAddress } = require('ivory-data-mapping').cache

module.exports = {
  async getLink (routeId) {
    const node = await this.getFlowNode(routeId)
    return node.path
  },

  get Address () {
    return AgentAddress
  },

  async findAddressLink () {
    return this.getLink('agent-address-find')
  },

  async selectAddressLink () {
    return this.getLink('agent-address-select')
  },

  async manualAddressLink () {
    return this.getLink('agent-address-full')
  }
}
