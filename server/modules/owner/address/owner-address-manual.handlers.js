const { mixin } = require('defra-hapi-utils')

class OwnerAddressManualHandlers extends mixin(require('defra-hapi-modules').address.manual.handlers, require('../owner-mixin'), require('./owner-address-mixin')) {}

module.exports = OwnerAddressManualHandlers
