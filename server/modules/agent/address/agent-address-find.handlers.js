const { mixin } = require('defra-hapi-utils')
class AgentAddressFindHandlers extends mixin(require('defra-hapi-modules').address.find.handlers, require('./agent-address-mixin')) {}

module.exports = AgentAddressFindHandlers
