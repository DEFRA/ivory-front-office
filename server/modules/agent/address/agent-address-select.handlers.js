const { mixin } = require('../../../lib/hapi-utils/index')

class AgentAddressSelectHandlers extends mixin(require('../../common/address/select/address-select.handlers'), require('./agent-address-mixin')) {}

module.exports = AgentAddressSelectHandlers
