const { mixin } = require('defra-hapi-utils')

class AgentAddressManualHandlers extends mixin(require('../../common/address/manual/address-manual.handlers'), require('./agent-address-mixin')) {}

module.exports = AgentAddressManualHandlers
