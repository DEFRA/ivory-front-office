const { mixin } = require('defra-hapi-utils')

class OwnerAddressSelectHandlers extends mixin(require('defra-hapi-modules').address.select.handlers, require('../owner-mixin'), require('./owner-address-mixin')) {}

module.exports = OwnerAddressSelectHandlers
