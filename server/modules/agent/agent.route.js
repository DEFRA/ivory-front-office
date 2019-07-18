
class AgentHandlers extends require('../common/option/select-one-option.handlers') {
  get fieldName () {
    return 'agentActingAs'
  }

  get selectError () {
    return 'Select how you acting on behalf of the owner'
  }
}

const handlers = new AgentHandlers()

module.exports = handlers.routes({
  path: '/agent',
  app: {
    pageHeading: 'How are you acting on behalf of the owner?',
    view: 'common/option/select-one-option',
    fieldName: handlers.fieldName,
    nextPath: '/owner-name'
  }
})
