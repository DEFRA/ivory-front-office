const registrationNumberGenerator = require('../../lib/registration-number-generator')
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
    const { itemType } = this.viewData.item

    if (dealingIntent) {
      this.viewData.dealingIntent = config.referenceData.dealingIntent.choices
        .find(({ shortName }) => shortName === dealingIntent).label
    }

    if (itemType) {
      this.viewData.itemType = config.referenceData.itemType.choices
        .find(({ shortName }) => shortName === itemType).label
    }

    return super.handleGet(request, h, errors)
  }

  async handlePost (request, h) {
    const registration = await Registration.get(request) || {}
    if (!registration.registrationNumber) {
      registration.registrationNumber = await registrationNumberGenerator.get()
    }
    await Registration.set(request, registration)
    return super.handlePost(request, h)
  }
}

const handlers = new CheckYourAnswersHandlers()

module.exports = handlers.routes({
  path: '/check-your-answers',
  app: {
    pageHeading: 'Check your answers',
    view: 'check-your-answers/check-your-answers',
    nextPath: '/payment'
  }
})
