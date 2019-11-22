const { AgentAddress } = require('ivory-data-mapping').cache
const { routeFlow } = require('defra-hapi-modules').plugins

module.exports = {
  get Address () {
    return AgentAddress
  },

  get flow () {
    return routeFlow.flow()
  },

  get findAddressLink () {
    return this.flow['agent-address-find'].path
  },

  get selectAddressLink () {
    return this.flow['agent-address-select'].path
  },

  get manualAddressLink () {
    return this.flow['agent-address-full'].path
  }
}
