const { Agent } = require('../../lib/data-mapping/index').cache
const config = require('../../config')

class AgentNameHandlers extends require('../common/person/name/person-name.handlers') {
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
