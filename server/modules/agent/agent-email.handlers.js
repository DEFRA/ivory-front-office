const { Agent } = require('../../lib/data-mapping/index').cache

class AgentNameHandlers extends require('../common/person/email/person-email.handlers') {
  get Person () {
    return Agent
  }

  async getEmailHint () {
    return { text: 'We\'ll use this to send you the payment receipt and confirmation of registration' }
  }
}

module.exports = AgentNameHandlers
