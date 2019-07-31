const Joi = require('@hapi/joi')
const syncRegistration = require('../../lib/sync-registration')
const utils = require('../../lib/utils')

class ItemDescriptionHandlers extends require('../common/handlers') {
  get schema () {
    return Joi.object({
      'item-description': Joi.string().required()
    })
  }

  get errorMessages () {
    return {
      'item-description': {
        'any.empty': 'Enter a description of the item'
      }
    }
  }

  async getItem (request) {
    return await utils.getCache(request, 'item') || {}
  }

  async setItem (request, item, persistToDatabase) {
    await utils.setCache(request, 'item', item)
    if (persistToDatabase) {
      return syncRegistration.save(request)
    }
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const item = await this.getItem(request)
    this.viewData = {
      itemDescription: item.description
    }
    return super.handleGet(request, h, errors)
  }

  // Overrides parent class handlePost
  async handlePost (request, h) {
    const item = await this.getItem(request)
    item.description = request.payload['item-description']
    await this.setItem(request, item, true)
    return super.handlePost(request, h)
  }
}

const handlers = new ItemDescriptionHandlers()

module.exports = handlers.routes({
  path: '/item-description',
  app: {
    pageHeading: 'Item description',
    view: 'item/item-description',
    nextPath: '/check-your-answers'
  }
})
