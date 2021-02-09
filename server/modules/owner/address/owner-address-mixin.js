const { OwnerAddress } = require('../../../lib/data-mapping/index').cache

module.exports = {
  async getLink (routeId) {
    const node = await this.getFlowNode(routeId)
    return node.path
  },

  get Address () {
    return OwnerAddress
  },

  async findAddressLink () {
    return this.getLink('owner-address-find')
  },

  async selectAddressLink () {
    return this.getLink('owner-address-select')
  },

  async manualAddressLink () {
    return this.getLink('owner-address-full')
  }
}
