const { mixin } = require('ivory-shared')
const { getRoutes } = require('../../../flow')

class OwnerAddressManualHandlers extends mixin(require('ivory-common-modules').address.manual.handlers, require('../owner-mixin'), require('./owner-address-mixin')) {}

const handlers = new OwnerAddressManualHandlers()

const routes = getRoutes.bind(handlers)('owner-address-full')

module.exports = handlers.routes(routes)
