const { mixin } = require('defra-hapi-utils')

class AgentAddressManualHandlers extends mixin(require('defra-hapi-modules').address.manual.handlers, require('./agent-address-mixin')) {}

module.exports = AgentAddressManualHandlers
