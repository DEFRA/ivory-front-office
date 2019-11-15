const { mixin } = require('ivory-shared')

class AgentAddressSelectHandlers extends mixin(require('ivory-common-modules').address.select.handlers, require('./agent-address-mixin')) {}

module.exports = AgentAddressSelectHandlers
