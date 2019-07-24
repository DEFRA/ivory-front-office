class CheckYourAnswersHandlers extends require('../common/handlers') {
  async getHandler (request, h, errors) {
    const { agentIsOwner } = await this.getCache(request, 'registration') || {}
    const [owner, ownerAddress, agent, agentAddress, item] = await this.getCache(request, ['owner', 'owner-address', 'agent', 'agent-address', 'item'])
    this.viewData = { agentIsOwner, owner, ownerAddress, agent, agentAddress, item }
    return super.getHandler(request, h, errors)
  }
}

const handlers = new CheckYourAnswersHandlers()

module.exports = handlers.routes({
  path: '/check-your-answers',
  app: {
    pageHeading: `Check your answers`,
    view: 'core/check-your-answers',
    nextPath: '/no-idea'
  }
})
