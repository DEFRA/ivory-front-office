const { mixin } = require('defra-hapi-utils')

class OwnerAddressFindHandlers extends mixin(require('defra-hapi-modules').address.find.handlers, require('../owner-mixin'), require('./owner-address-mixin')) {}

module.exports = OwnerAddressFindHandlers
