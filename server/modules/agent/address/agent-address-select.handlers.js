const { mixin } = require('defra-hapi-utils')

class AgentAddressSelectHandlers extends mixin(require('defra-hapi-modules').address.select.handlers, require('./agent-address-mixin')) {}

module.exports = AgentAddressSelectHandlers
