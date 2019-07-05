const Joi = require('@hapi/joi')

const fieldName = 'agentActingAs'
const items = [
  {
    text: 'Professional advisor',
    value: 'professional-advisor'
  },
  {
    text: 'Executor',
    value: 'executor'
  },
  {
    text: 'Trustee',
    value: 'trustee'
  },
  {
    text: 'Friend or relative',
    value: 'friend-or-relative'
  }
]

class ItemDescriptionHandlers extends require('../common/handlers') {
  get schema () {
    const validValues = items.map(({ value }) => value)
    return {
      [fieldName]: Joi.string().valid(...validValues).required()
    }
  }

  get errorMessages () {
    return {
      [fieldName]: {
        'any.required': 'Select how you acting on behalf of the owner'
      }
    }
  }

  async getAgent (request) {
    return this.getCache(request, 'agent') || {}
  }

  async setAgent (request, agent) {
    return this.setCache(request, 'agent', agent)
  }

  // Overrides parent class getHandler
  async getHandler (request, h, errors) {
    const agent = await this.getAgent(request)

    // Use the payload in this special case to force the items to be displayed even when there is an error
    request.payload = {
      items: items.map(({ value, text }) => {
        return {
          value: value.toString(),
          text,
          checked: value === agent.actingAs
        }
      })
    }
    return super.getHandler(request, h, errors)
  }

  // Overrides parent class postHandler
  async postHandler (request, h) {
    const agent = await this.getAgent(request)
    agent.actingAs = request.payload['agentActingAs']
    await this.setAgent(request, agent)
    return super.postHandler(request, h)
  }
}

const handlers = new ItemDescriptionHandlers()

module.exports = handlers.routes({
  path: '/agent',
  app: {
    pageHeading: 'How are you acting on behalf of the owner?',
    fieldName,
    view: 'common/radio-buttons',
    nextPath: '/owner-name'
  }
})
