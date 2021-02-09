const { Owner } = require('../../lib/data-mapping/index').cache
const { mixin } = require('../../lib/hapi-utils/index')
const config = require('../../config')

class OwnerNameHandlers extends mixin(require('../common/person/name/person-name.handlers'), require('./owner-mixin')) {
  get Person () {
    return Owner
  }

  async errorMessages (request) {
    if (await this.isOwner(request)) {
      return {
        'full-name': {
          'string.empty': 'Enter your full name',
          'string.max': `Your full name must be ${this.maxNameLength} characters or fewer`
        }
      }
    }
    return {
      'full-name': {
        'string.empty': 'Enter the owner\'s full name',
        'string.max': `Owner's full name must be ${this.maxNameLength} characters or fewer`
      }
    }
  }

  async fullNameLabel (request) {
    if (await this.isOwner(request)) {
      return 'Enter your full name'
    }
    return 'Enter the owner\'s full name'
  }

  lookUpEnabled () {
    return config.addressLookUpEnabled
  }
}

module.exports = OwnerNameHandlers
