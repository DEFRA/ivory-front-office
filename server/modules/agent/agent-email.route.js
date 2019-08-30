const { Agent } = require('../../lib/cache')

class AgentNameHandlers extends require('../common/person/person-email.handlers') {
  get Person () {
    return Agent
  }
}

const handlers = new AgentNameHandlers()

module.exports = handlers.routes({
  path: '/agent-email',
  app: {
    pageHeading: 'Your email address',
    view: 'common/person/person-email',
    nextPath: '/agent-address'
  }
})
