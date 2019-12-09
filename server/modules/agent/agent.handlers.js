const { Registration } = require('ivory-data-mapping').cache

class AgentHandlers extends require('../common/option/single/single-option.handlers') {
  get Model () {
    return Registration
  }

  get fieldname () {
    return 'agentActingAs'
  }

  get selectError () {
    return 'Select how you are acting on behalf of the owner'
  }
}

module.exports = AgentHandlers
