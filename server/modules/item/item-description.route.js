const Joi = require('@hapi/joi')
const { Item } = require('../../lib/cache')

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
    await Item.set(request, item, true)
    return super.handlePost(request, h)
  }
}

const handlers = new ItemDescriptionHandlers()

module.exports = handlers.routes({
  path: '/item-description',
  app: {
    pageHeading: 'Describe the item',
    view: 'item/item-description',
    nextPath: '/owner-name'
  }
})
