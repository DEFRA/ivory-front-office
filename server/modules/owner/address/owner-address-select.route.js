const { mixin } = require('ivory-shared')
const { getRoutes } = require('../../../flow')

class OwnerAddressSelectHandlers extends mixin(require('ivory-common-modules').address.select.handlers, require('../owner-mixin'), require('./owner-address-mixin')) {}

const handlers = new OwnerAddressSelectHandlers()

const routes = getRoutes.bind(handlers)('owner-address-select')

module.exports = handlers.routes(routes)
