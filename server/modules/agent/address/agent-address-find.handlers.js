const { mixin } = require('defra-hapi-utils')
class AgentAddressFindHandlers extends mixin(require('../../common/address/find/address-find.handlers'), require('./agent-address-mixin')) {}

module.exports = AgentAddressFindHandlers
