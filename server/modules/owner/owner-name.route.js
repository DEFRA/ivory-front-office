const { Owner } = require('../../lib/cache')
const { mixin } = require('ivory-shared')
const { getRoutes } = require('../../flow')
const { addressLookUpEnabled } = require('../../config')

class OwnerNameHandlers extends mixin(require('ivory-common-modules').person.name.handlers, require('./owner-mixin')) {
  get Person () {
    return Owner
  }

  async errorMessages (request) {
    if (await this.isOwner(request)) {
      return {
        'full-name': {
          'any.empty': 'Enter your full name',
          'string.max': `Your full name must be ${this.maxNameLength} characters or fewer`
        }
      }
    }
    return {
      'full-name': {
        'any.empty': 'Enter the owner\'s full name',
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
    return addressLookUpEnabled
  }
}

const handlers = new OwnerNameHandlers()

const routes = getRoutes.bind(handlers)('owner-name')

module.exports = handlers.routes(routes)
