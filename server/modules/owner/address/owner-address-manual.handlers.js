const { mixin } = require('ivory-shared')

class OwnerAddressManualHandlers extends mixin(require('ivory-common-modules').address.manual.handlers, require('../owner-mixin'), require('./owner-address-mixin')) {}

module.exports = OwnerAddressManualHandlers
