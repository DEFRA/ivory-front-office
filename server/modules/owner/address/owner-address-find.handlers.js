const { mixin } = require('ivory-shared')

class OwnerAddressFindHandlers extends mixin(require('ivory-common-modules').address.find.handlers, require('../owner-mixin'), require('./owner-address-mixin')) {}

module.exports = OwnerAddressFindHandlers
