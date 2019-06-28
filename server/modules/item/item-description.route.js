const Joi = require('@hapi/joi')

class ItemDescriptionHandlers extends require('../base/handlers') {
  get schema () {
    return {
      'item-description': Joi.string().required()
    }
  }

  get errorMessages () {
    return {
      'item-description': {
        'any.empty': 'Enter a description of your item'
      }
    }
  }

  async getItem (request) {
    return this.getCache(request, 'item') || {}
  }

  async setItem (request, item) {
    return this.setCache(request, 'item', item)
  }

  // Overrides parent class getHandler
  async getHandler (request, h, errors) {
    const item = await this.getItem(request)
    this.viewData = {
      description: item.description
    }
    return super.getHandler(request, h, errors)
  }

  // Overrides parent class postHandler
  async postHandler (request, h) {
    const item = await this.getItem(request)
    item.description = request.payload['item-description']
    await this.setItem(request, item)
    return super.postHandler(request, h)
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
