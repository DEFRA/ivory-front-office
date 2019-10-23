const { mixin } = require('ivory-shared')
const { getRoutes } = require('../../../flow')
class AgentAddressFindHandlers extends mixin(require('ivory-common-modules').address.find.handlers, require('./agent-address-mixin')) {}

const handlers = new AgentAddressFindHandlers()

const routes = getRoutes.bind(handlers)('agent-address-find')

module.exports = handlers.routes(routes)
