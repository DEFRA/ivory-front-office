const syncRegistration = require('../../lib/sync-registration')
const config = require('../../config')
const {
  Registration,
  Owner,
  OwnerAddress,
  Agent,
  AgentAddress,
  Item
} = require('../../lib/cache')

class CheckYourAnswersHandlers extends require('../common/handlers') {
  async handleGet (request, h, errors) {
    this.viewData = {
      registration: await Registration.get(request) || {},
      owner: await Owner.get(request) || {},
      ownerAddress: await OwnerAddress.get(request) || {},
      agent: await Agent.get(request) || {},
      agentAddress: await AgentAddress.get(request) || {},
      item: await Item.get(request) || {}
    }
    const { dealingIntent } = this.viewData.registration

    if (dealingIntent) {
      this.viewData.dealingIntent = config.referenceData.dealingIntent.choices.find(({ shortName }) => shortName === dealingIntent).label
    }

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
    pageHeading: 'Check your answers',
    view: 'check-your-answers/check-your-answers',
    nextPath: '/no-idea'
  }
})
