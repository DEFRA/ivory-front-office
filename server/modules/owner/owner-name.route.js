const { Owner } = require('../../lib/cache')
const { mixin } = require('ivory-shared')

class OwnerNameHandlers extends mixin(require('../common/person/person-name.handlers'), require('./owner-mixin')) {
  get Person () {
    return Owner
  }

  async errorMessages (request) {
    if (await this.isOwner(request)) {
      return super.errorMessages
    }
    return {
      'full-name': {
        'any.empty': 'Enter the owner\'s full name',
        'string.max': `Enter the owner's  full name in ${this.maxNameLength} characters or less`
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
