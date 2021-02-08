const { mixin } = require('../../../lib/hapi-utils/index')
class AgentAddressFindHandlers extends mixin(require('../../common/address/find/address-find.handlers'), require('./agent-address-mixin')) {}

module.exports = AgentAddressFindHandlers
