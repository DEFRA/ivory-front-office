const { AgentAddress } = require('../../../lib/cache')

module.exports = {
  get Address () {
    return AgentAddress
  },

  get findAddressLink () {
    return '/agent-address'
  },

  get selectAddressLink () {
    return '/agent-address-select'
  },

  get manualAddressLink () {
    return '/agent-full-address'
  }
}
