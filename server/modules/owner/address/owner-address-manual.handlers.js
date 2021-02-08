const { mixin } = require('../../../lib/hapi-utils/index')

class OwnerAddressManualHandlers extends mixin(require('../../common/address/manual/address-manual.handlers'), require('../owner-mixin'), require('./owner-address-mixin')) {}

module.exports = OwnerAddressManualHandlers
