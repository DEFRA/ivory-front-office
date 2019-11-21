const { mixin } = require('ivory-shared')

class OwnerAddressSelectHandlers extends mixin(require('ivory-common-modules').address.select.handlers, require('../owner-mixin'), require('./owner-address-mixin')) {}

module.exports = OwnerAddressSelectHandlers
