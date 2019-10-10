const { Owner } = require('../../lib/cache')
const { mixin } = require('ivory-shared')
class OwnerEmailHandlers extends mixin(require('../common/person/person-email.handlers'), require('./owner-mixin')) {
  get Person () {
    return Owner
  }

  // Overrides parent class getPageHeading
  async getPageHeading (request) {
    if (await this.isOwner(request)) {
      return 'Your email address'
    }
    return 'Owner\'s email address'
  }

  async getEmailHint (request) {
    if (await this.isOwner(request)) {
      return { text: 'We\'ll use this to send you the payment receipt and confirmation of registration' }
    }
  }
}

const handlers = new OwnerEmailHandlers()

module.exports = handlers.routes({
  path: '/owner-email',
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'common/person-email',
    nextPath: '/dealing-intent',
    isQuestionPage: true
  }
})
