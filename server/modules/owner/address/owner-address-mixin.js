const { OwnerAddress } = require('ivory-data-mapping').cache
const { routeFlow } = require('ivory-common-modules').plugins

module.exports = {
  get Address () {
    return OwnerAddress
  },

  get flow () {
    return routeFlow.flow()
  },

  get findAddressLink () {
    return this.flow['owner-address-find'].path
  },

  get selectAddressLink () {
    return this.flow['owner-address-select'].path
  },

  get manualAddressLink () {
    return this.flow['owner-address-full'].path
  },

  async skipBusinessName (request) {
    return !(await this.isOwner(request))
  }
}
