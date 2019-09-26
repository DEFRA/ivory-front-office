const Joi = require('@hapi/joi')
const { Item } = require('../../lib/cache')
const config = require('../../config')

class ItemDescriptionHandlers extends require('../common/handlers') {
  get schema () {
    return Joi.object({
      'item-description': Joi.string().trim().required()
    })
  }

  get errorMessages () {
    return {
      'item-description': {
        'any.empty': 'Enter a description of the item'
      }
    }
  }

  async requiresAgeExemptionDeclaration (request) {
    const { itemType } = await Item.get(request) || {}
    const reference = config.referenceData.itemType.choices.find(({ shortName }) => shortName === itemType)
    return !!reference.ageExemptionDeclaration
  }

  // Overrides parent class getNextPath
  async getNextPath (request) {
    if (await this.requiresAgeExemptionDeclaration(request)) {
      return '/item-age-exemption-declaration'
    } else {
      return '/owner-email'
    }
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const { description } = await Item.get(request) || {}
    this.viewData = {
      'item-description': description
    }
    return super.handleGet(request, h, errors)
  }

  // Overrides parent class handlePost
  async handlePost (request, h) {
    const item = await Item.get(request) || {}
    item.description = request.payload['item-description']
    await Item.set(request, item)
    return super.handlePost(request, h)
  }
}

const handlers = new ItemDescriptionHandlers()

module.exports = handlers.routes({
  path: '/item-description',
  app: {
    pageHeading: 'Describe the item',
    view: 'item/item-description',
    // nextPath is derived in the getNextPath method above
    nextPath: '/item-age-exemption-declaration',
    isQuestionPage: true
  }
})
