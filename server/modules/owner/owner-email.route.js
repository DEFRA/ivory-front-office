const { Owner } = require('../../lib/cache')
const { mixin } = require('ivory-shared')
const { getRoutes } = require('../../flow')

class OwnerEmailHandlers extends mixin(require('../common/person/person-email.handlers'), require('./owner-mixin')) {
  get Person () {
    return Owner
  }

  async getEmailHint (request) {
    if (await this.isOwner(request)) {
      return { text: 'We\'ll use this to send you the payment receipt and confirmation of registration' }
    }
  }
}

const handlers = new OwnerEmailHandlers()

const routes = getRoutes.bind(handlers)('owner-email')

module.exports = handlers.routes(routes)
