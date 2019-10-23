const { mixin } = require('ivory-shared')
const { getRoutes } = require('../../../flow')

class AgentAddressSelectHandlers extends mixin(require('ivory-common-modules').address.select.handlers, require('./agent-address-mixin')) {}

const handlers = new AgentAddressSelectHandlers()

const routes = getRoutes.bind(handlers)('agent-address-select')

module.exports = handlers.routes(routes)
