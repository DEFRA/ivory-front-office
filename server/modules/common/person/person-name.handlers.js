const Joi = require('@hapi/joi')
const mixin = require('../../../lib/mixin')

class PersonNameHandlers extends mixin(require('../handlers'), require('./person-mixin')) {
  get schema () {
    return Joi.object({
      'full-name': Joi.string().required()
    })
  }

  get errorMessages () {
    return {
      'full-name': {
        'any.empty': 'Enter your full name'
      }
    }
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const person = await this.getPerson(request)
    this.viewData = {
      fullName: person.fullName
    }
    return super.handleGet(request, h, errors)
  }

  // Overrides parent class handlePost
  async handlePost (request, h) {
    const person = await this.getPerson(request)
    person.fullName = request.payload['full-name']
    await this.setPerson(request, person)
    return super.handlePost(request, h)
  }
}

module.exports = PersonNameHandlers
