const Joi = require('@hapi/joi')
const { Item } = require('../../lib/cache')
const { utils } = require('ivory-shared')
const config = require('../../config')

class ItemDescriptionHandlers extends require('ivory-common-modules').handlers {
  get schema () {
    return Joi.object({
      'item-description': Joi.string().trim().max(this.maxFreeTextLength).required()
    })
  }

  get errorMessages () {
    return {
      'item-description': {
        'any.empty': 'Enter a description of the item',
        'string.max': `Enter a description of the item in less than ${this.maxFreeTextLength} characters`
      }
    }
  }

  async requiresAgeExemptionDeclaration (request) {
    const { itemType } = await Item.get(request) || {}
    const reference = config.referenceData.itemType.choices.find(({ shortName }) => shortName === itemType)
    return !!utils.getNestedVal(reference, 'ageExemptionDeclaration')
  }

  // Overrides parent class getNextPath
  async getNextPath (request) {
    if (await this.requiresAgeExemptionDeclaration(request)) {
      return '/item-age-exemption-declaration'
    } else {
      return '/who-owns-item'
    }
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const { description = '' } = await Item.get(request) || {}
    this.viewData = {
      'item-description': description.trim()
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
