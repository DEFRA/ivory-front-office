const { OwnerAddress } = require('../../../lib/cache')
const { flow } = require('../../../flow')

module.exports = {
  get Address () {
    return OwnerAddress
  },

  get findAddressLink () {
    return flow['owner-address-find'].path
  },

  get selectAddressLink () {
    return flow['owner-address-select'].path
  },

  get manualAddressLink () {
    return flow['owner-address-full'].path
  },

  async skipBusinessName (request) {
    return !(await this.isOwner(request))
  }
}
