const { Agent } = require('../../lib/cache')
const { getRoutes } = require('../../flow')
const { addressLookUpEnabled } = require('../../config')

class AgentNameHandlers extends require('../common/person/person-name.handlers') {
  get Person () {
    return Agent
  }

  async errorMessages (request) {
    return {
      'full-name': {
        'any.empty': 'Enter your full name',
        'string.max': `Your full name must be ${this.maxNameLength} characters or fewer`
      }
    }
  }

  lookUpEnabled () {
    return addressLookUpEnabled
  }
}

const handlers = new AgentNameHandlers()

const routes = getRoutes.bind(handlers)('agent-name')

module.exports = handlers.routes(routes)
