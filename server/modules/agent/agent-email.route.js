const { Agent } = require('../../lib/cache')
const { getRoutes } = require('../../flow')

class AgentNameHandlers extends require('../common/person/person-email.handlers') {
  get Person () {
    return Agent
  }

  async getEmailHint () {
    return { text: 'We\'ll use this to send you the payment receipt and confirmation of registration' }
  }
}

const handlers = new AgentNameHandlers()

const routes = getRoutes.bind(handlers)('agent-email')

module.exports = handlers.routes(routes)
