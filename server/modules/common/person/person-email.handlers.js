const Joi = require('@hapi/joi')
const mixin = require('../../../lib/mixin')

class PersonEmailHandlers extends mixin(require('../handlers'), require('./person-mixin')) {
  get schema () {
    return Joi.object({
      email: Joi.string().email().required()
    })
  }

  get errorMessages () {
    return {
      email: {
        'any.empty': 'Enter an email address in the correct format, like name@example.com',
        'string.email': 'Enter an email address in the correct format, like name@example.com'
      }
    }
  }

  // Overrides parent class getHandler
  async getHandler (request, h, errors) {
    const person = await this.getPerson(request)
    this.viewData = {
      email: person.email
    }
    return super.getHandler(request, h, errors)
  }

  // Overrides parent class postHandler
  async postHandler (request, h) {
    const person = await this.getPerson(request)
    person.email = request.payload['email']
    await this.setPerson(request, person, true)
    return super.postHandler(request, h)
  }
}

module.exports = PersonEmailHandlers
