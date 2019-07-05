const Joi = require('@hapi/joi')

const fieldName = 'who-owns-item'
const items = [
  {
    text: 'I own it',
    value: true
  },
  {
    text: 'Someone else owns it',
    value: false
  }
]

class ItemDescriptionHandlers extends require('../common/handlers') {
  get schema () {
    return {
      [fieldName]: Joi.boolean().required()
    }
  }

  get errorMessages () {
    return {
      [fieldName]: {
        'any.required': 'Select who owns the item'
      }
    }
  }

  async getItem (request) {
    return this.getCache(request, 'item') || {}
  }

  async setItem (request, item) {
    return this.setCache(request, 'item', item)
  }

  // Overrides parent class getNextPath
  async getNextPath (request) {
    const { ownerIsAgent } = await this.getCache(request, 'item')
    if (ownerIsAgent) {
      return '/owner-name'
    } else {
      return '/agent'
    }
  }

  // Overrides parent class getHandler
  async getHandler (request, h, errors) {
    const item = await this.getItem(request)

    // Use the payload in this special case to force the items to be displayed even when there is an error
    request.payload = {
      items: items.map(({ value, text }) => {
        return {
          value: value.toString(),
          text,
          checked: value === item.ownerIsAgent
        }
      })
    }
    return super.getHandler(request, h, errors)
  }

  // Overrides parent class postHandler
  async postHandler (request, h) {
    const item = await this.getItem(request)
    item.ownerIsAgent = request.payload['who-owns-item']
    await this.setItem(request, item)
    return super.postHandler(request, h)
  }
}

const handlers = new ItemDescriptionHandlers()

module.exports = handlers.routes({
  path: '/who-owns-item',
  app: {
    pageHeading: 'Who owns the item?',
    fieldName,
    view: 'common/radio-buttons'
  }
  // nextPath is derived in the getNextPath method above
})
