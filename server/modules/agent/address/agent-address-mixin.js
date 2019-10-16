const { AgentAddress } = require('../../../lib/cache')
const { flow } = require('../../../flow')

module.exports = {
  get Address () {
    return AgentAddress
  },

  get findAddressLink () {
    return flow['agent-address-find'].path
  },

  get selectAddressLink () {
    return flow['agent-address-select'].path
  },

  get manualAddressLink () {
    return flow['agent-address-full'].path
  }
}
