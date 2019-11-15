const { Agent } = require('ivory-data-mapping').cache

class AgentNameHandlers extends require('ivory-common-modules').person.email.handlers {
  get Person () {
    return Agent
  }

  async getEmailHint () {
    return { text: 'We\'ll use this to send you the payment receipt and confirmation of registration' }
  }
}

module.exports = AgentNameHandlers
