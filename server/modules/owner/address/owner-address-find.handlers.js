const { mixin } = require('defra-hapi-utils')

class OwnerAddressFindHandlers extends mixin(require('../../common/address/find/address-find.handlers'), require('../owner-mixin'), require('./owner-address-mixin')) {}

module.exports = OwnerAddressFindHandlers
