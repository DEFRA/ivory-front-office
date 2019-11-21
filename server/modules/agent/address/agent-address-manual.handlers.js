const { mixin } = require('ivory-shared')

class AgentAddressManualHandlers extends mixin(require('ivory-common-modules').address.manual.handlers, require('./agent-address-mixin')) {}

module.exports = AgentAddressManualHandlers
