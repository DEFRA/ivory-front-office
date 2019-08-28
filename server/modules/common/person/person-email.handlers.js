const Joi = require('@hapi/joi')
const { mixin } = require('ivory-shared')

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

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const person = await this.getPerson(request)
    this.viewData = {
      email: person.email
    }
    return super.handleGet(request, h, errors)
  }

  // Overrides parent class handlePost
  async handlePost (request, h) {
    const person = await this.getPerson(request)
    person.email = request.payload.email
    await this.setPerson(request, person, true)
    return super.handlePost(request, h)
  }
}

module.exports = PersonEmailHandlers
