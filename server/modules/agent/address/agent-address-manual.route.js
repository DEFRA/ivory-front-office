const { mixin } = require('ivory-shared')
const { getRoutes } = require('../../../flow')

class AgentAddressManualHandlers extends mixin(require('ivory-common-modules').address.manual.handlers, require('./agent-address-mixin')) {}

const handlers = new AgentAddressManualHandlers()

const routes = getRoutes.bind(handlers)('agent-address-full')

module.exports = handlers.routes(routes)
