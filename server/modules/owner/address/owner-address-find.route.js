const { mixin } = require('ivory-shared')
const { getRoutes } = require('../../../flow')
class OwnerAddressFindHandlers extends mixin(require('ivory-common-modules').address.find.handlers, require('../owner-mixin'), require('./owner-address-mixin')) {}

const handlers = new OwnerAddressFindHandlers()

const routes = getRoutes.bind(handlers)('owner-address-find')

module.exports = handlers.routes(routes)
