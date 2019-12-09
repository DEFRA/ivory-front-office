const { Owner } = require('ivory-data-mapping').cache
const { mixin } = require('defra-hapi-utils')

class OwnerEmailHandlers extends mixin(require('../common/person/email/person-email.handlers'), require('./owner-mixin')) {
  get Person () {
    return Owner
  }

  async getEmailHint (request) {
    if (await this.isOwner(request)) {
      return { text: 'We\'ll use this to send you the payment receipt and confirmation of registration' }
    }
  }
}

module.exports = OwnerEmailHandlers
