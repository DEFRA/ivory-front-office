const { mixin } = require('../../../lib/hapi-utils/index')

class AgentAddressManualHandlers extends mixin(require('../../common/address/manual/address-manual.handlers'), require('./agent-address-mixin')) {}

module.exports = AgentAddressManualHandlers
