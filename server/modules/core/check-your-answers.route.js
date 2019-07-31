const syncRegistration = require('../../lib/sync-registration')
const utils = require('../../lib/utils')

class CheckYourAnswersHandlers extends require('../common/handlers') {
  async handleGet (request, h, errors) {
    const [registration, owner, ownerAddress, agent, agentAddress, item] = await utils.getCache(request, ['registration', 'owner', 'owner-address', 'agent', 'agent-address', 'item'])
    const { agentIsOwner } = registration || {}
    this.viewData = { agentIsOwner, owner, ownerAddress, agent, agentAddress, item }
    return super.handleGet(request, h, errors)
  }

  async handlePost (request, h) {
    await syncRegistration.save(request)
    return super.handlePost(request, h)
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
