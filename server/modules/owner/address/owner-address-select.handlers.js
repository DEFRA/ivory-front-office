const { mixin } = require('../../../lib/hapi-utils/index')

class OwnerAddressSelectHandlers extends mixin(require('../../common/address/select/address-select.handlers'), require('../owner-mixin'), require('./owner-address-mixin')) {}

module.exports = OwnerAddressSelectHandlers
