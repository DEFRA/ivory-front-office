const { mixin } = require('ivory-shared')
class AgentAddressFindHandlers extends mixin(require('ivory-common-modules').address.find.handlers, require('./agent-address-mixin')) {}

module.exports = AgentAddressFindHandlers
