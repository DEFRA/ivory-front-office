const { Agent } = require('ivory-data-mapping').cache
const config = require('../../config')

class AgentNameHandlers extends require('defra-hapi-modules').person.name.handlers {
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
    return config.addressLookUpEnabled
  }
}

module.exports = AgentNameHandlers
