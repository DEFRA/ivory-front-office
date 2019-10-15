const { Registration } = require('../../lib/cache')

class AgentHandlers extends require('ivory-common-modules').option.single.handlers {
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

const handlers = new AgentHandlers()

module.exports = handlers.routes({
  path: '/agent',
  app: {
    pageHeading: 'How are you acting on behalf of the owner?',
    view: 'common/select-one-option',
    nextPath: '/agent-name',
    isQuestionPage: true
  }
})
