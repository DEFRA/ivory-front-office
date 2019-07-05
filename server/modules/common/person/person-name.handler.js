const Joi = require('@hapi/joi')

class NameHandlers extends require('../handlers') {
  get schema () {
    return {
      'full-name': Joi.string().required()
    }
  }

  get errorMessages () {
    return {
      'full-name': {
        'any.empty': 'Enter your full name'
      }
    }
  }

  async getPerson (request) {
    return this.getCache(request, this.personType) || {}
  }

  async setPerson (request, person) {
    return this.setCache(request, this.personType, person)
  }

  // Overrides parent class getHandler
  async getHandler (request, h, errors) {
    const person = await this.getPerson(request)
    this.viewData = {
      fullName: person.fullName
    }
    return super.getHandler(request, h, errors)
  }

  // Overrides parent class postHandler
  async postHandler (request, h) {
    const person = await this.getPerson(request)
    person.fullName = request.payload['full-name']
    await this.setPerson(request, person)
    return super.postHandler(request, h)
  }
}

module.exports = NameHandlers
