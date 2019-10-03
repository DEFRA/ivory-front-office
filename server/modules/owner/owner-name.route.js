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
          'any.empty': 'Enter your full name'
        }
      }
    }
    return {
      'full-name': {
        'any.empty': 'Enter owner\'s full name'
      }
    }
  }

  get fullNameLabel () {
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
    view: 'common/person/person-name',
    nextPath: '/owner-full-address'
  }
})
