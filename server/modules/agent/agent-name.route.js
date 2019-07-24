class AgentNameHandlers extends require('../common/person/person-name.handlers') {
  get personType () {
    return 'agent'
  }
}

const handlers = new AgentNameHandlers()

module.exports = handlers.routes({
  path: '/agent-name',
  app: {
    pageHeading: 'Your name',
    view: 'common/person/person-name',
    nextPath: '/agent-email'
  }
})
