const { mixin } = require('../../../lib/hapi-utils/index')

class OwnerAddressFindHandlers extends mixin(require('../../common/address/find/address-find.handlers'), require('../owner-mixin'), require('./owner-address-mixin')) {}

module.exports = OwnerAddressFindHandlers
