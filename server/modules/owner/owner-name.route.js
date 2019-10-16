const { Owner } = require('../../lib/cache')
const { mixin } = require('ivory-shared')

class OwnerNameHandlers extends mixin(require('../common/person/person-name.handlers'), require('./owner-mixin')) {
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
    return 'Owner\'s full name'
  }

  // Overrides parent class getPageHeading
  async getPageHeading (request) {
    if (await this.isOwner(request)) {
      return 'Your name'
    }
    return 'Owner\'s name'
  }
}

const handlers = new OwnerNameHandlers()

module.exports = handlers.routes({
  path: '/owner-name',
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'common/person-name',
    nextPath: '/owner-full-address'
  }
})
