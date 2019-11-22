const Joi = require('@hapi/joi')
const { Item } = require('ivory-data-mapping').cache
const { utils } = require('defra-hapi-utils')
const config = require('../../config')

class ItemDescriptionHandlers extends require('defra-hapi-modules').handlers {
  get schema () {
    return Joi.object({
      'item-description': Joi.string().trim().max(this.maxFreeTextLength).required()
    })
  }

  get errorMessages () {
    return {
      'item-description': {
        'string.empty': 'Enter the item\'s description',
        'string.max': `The description must be ${this.maxFreeTextLength} characters or fewer`
      }
    }
  }

  async requiresAgeExemptionDeclaration (request) {
    const { itemType } = await Item.get(request) || {}
    const reference = config.referenceData.itemType.choices.find(({ shortName }) => shortName === itemType)
    return !!utils.getNestedVal(reference, 'ageExemptionDeclaration')
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

module.exports = ItemDescriptionHandlers
