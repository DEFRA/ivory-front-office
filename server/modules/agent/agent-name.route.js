const { Agent } = require('ivory-data-mapping').cache
const { getRoutes } = require('../../flow')
const { addressLookUpEnabled } = require('../../config')

class AgentNameHandlers extends require('ivory-common-modules').person.name.handlers {
  get Person () {
    return Agent
  }

  async errorMessages (request) {
    return {
      'full-name': {
        'string.empty': 'Enter your full name',
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
